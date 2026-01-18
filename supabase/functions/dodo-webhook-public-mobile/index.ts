/* @ts-nocheck */
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { DodoPayments } from "https://esm.sh/dodopayments@2.11.0";

/**
 * Minimal dev logger for Supabase Edge Functions (Deno runtime).
 */
const devLoggerPrefix = "[DODO]";
const devLogger = {
  log: (...args: unknown[]) => {
    try {
      console.log(devLoggerPrefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
  warn: (...args: unknown[]) => {
    try {
      console.warn(devLoggerPrefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
  error: (...args: unknown[]) => {
    try {
      console.error(devLoggerPrefix, ...args);
    } catch {
      // ignore logging errors
    }
  },
};

/**
 * Dodo Payments Webhook (Supabase Edge - Deno)
 *
 * Security:
 * - Verifies signature from headers: webhook-id, webhook-signature, webhook-timestamp
 * - Uses HMAC-SHA256 over the EXACT raw body bytes (avoid any mutation before verification)
 *
 * Idempotency:
 * - processed_events(id primary key) table created in migration
 *
 * Events handled (minimum viable):
 * - payment.succeeded | payment.failed
 * - subscription.active | subscription.renewed | subscription.cancelled | subscription.on_hold | subscription.expired | subscription.failed | subscription.updated
 * - refund.succeeded | refund.failed (log only)
 *
 * DB updates (expects prior migration):
 * - credit_purchases: dodo_payment_id (unique), insert on credits payments
 * - profiles: uses add_paid_credits RPC for atomic increments (preferred) else fallback
 * - user_subscriptions: dodo_subscription_id, status, start/end dates
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with, webhook-id, webhook-signature, webhook-timestamp",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

// Security constants
const MAX_WEBHOOK_SIZE = 1024 * 1024; // 1MB max payload
const MAX_WEBHOOK_AGE_SECONDS = 5 * 60; // 5 minutes max age for timestamp validation

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function upsertProcessedEvent(supabase: any, id: string) {
  if (!id) throw new Error("Missing webhook id");
  // Try insert; if unique violation occurs, treat as already processed
  const { error } = await supabase.from("processed_events").insert({ id }).select().maybeSingle();
  if (error && !(error.code === "23505" || error.code === "PGRST116")) {
    // Not a unique violation
    throw error;
  }
}

function parsePeriodDates(maybe: any) {
  // Attempt to parse standard fields from subscription payload
  // Fallback to 30 days window
  const now = new Date();
  const start = maybe?.current_period_start ? new Date(maybe.current_period_start) :
               maybe?.current_start ? new Date(maybe.current_start) :
               now;
  const end = maybe?.current_period_end ? new Date(maybe.current_period_end) :
             maybe?.current_end ? new Date(maybe.current_end) :
             new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

async function resolvePlanId(supabase: any, planKey: any): Promise<string | null> {
  if (!planKey) return null;
  const normalized = String(planKey).toLowerCase().split("_")[0];
  try {
    const { data: allPlans } = await supabase
      .from("subscription_plans")
      .select("id, name, slug");
    if (!allPlans || allPlans.length === 0) return null;
    let match = allPlans.find(
      (p: any) =>
        p?.name?.toLowerCase() === normalized ||
        (p?.slug && p.slug.toLowerCase() === normalized),
    );
    if (!match) {
      const full = String(planKey).toLowerCase();
      match = allPlans.find(
        (p: any) =>
          p?.name?.toLowerCase() === full ||
          (p?.slug && p.slug.toLowerCase() === full),
      );
    }
    return match?.id || null;
  } catch (_e) {
    return null;
  }
}

serve(async (req: Request) => {
    devLogger.log("=== DODO WEBHOOK RECEIVED ===");
    devLogger.log("Method:", req.method);
    devLogger.log("URL:", req.url);
    devLogger.log("Headers:", {
      "webhook-id": req.headers.get("webhook-id"),
      "webhook-signature": req.headers.get("webhook-signature") ? "[REDACTED]" : "MISSING",
      "webhook-timestamp": req.headers.get("webhook-timestamp"),
      "content-type": req.headers.get("content-type"),
    });

    if (req.method === "OPTIONS") {
      devLogger.log("OPTIONS request, returning ok");
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const WEBHOOK_SECRET = Deno.env.get("DODO_WEBHOOK_SECRET_MOBILE") || "";

      devLogger.log("Environment check:", {
        hasSupabaseUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
        hasWebhookSecret: !!WEBHOOK_SECRET,
      });

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        devLogger.error("Missing Supabase configuration");
        return jsonResponse({ error: "Missing Supabase configuration" }, 500);
      }
      if (!WEBHOOK_SECRET) {
        devLogger.error("Missing webhook secret - DODO_WEBHOOK_SECRET_MOBILE not set");
        return jsonResponse({ error: "Missing Dodo webhook secret (DODO_WEBHOOK_SECRET_MOBILE)" }, 500);
      }

      // Security: Check request size to prevent payload bomb attacks
      const contentLength = req.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_WEBHOOK_SIZE) {
        devLogger.error("Request payload too large:", contentLength);
        return jsonResponse({ error: "Payload too large" }, 413);
      }

      const rawBody = await req.text();
      devLogger.log("Request body received, byteLength:", rawBody.length);

      // Security: Check actual body size
      if (rawBody.length > MAX_WEBHOOK_SIZE) {
        devLogger.error("Request payload exceeded maximum size:", rawBody.length);
        return jsonResponse({ error: "Payload too large" }, 413);
      }

     const webhookId = req.headers.get("webhook-id") || "";
     const webhookTimestampStr = req.headers.get("webhook-timestamp") || "";

     // Security: Validate webhook ID exists
     if (!webhookId) {
       devLogger.error("Missing webhook-id header");
       return jsonResponse({ error: "Missing webhook-id header" }, 400);
     }

     // Security: Validate timestamp to prevent replay attacks (required)
     if (!webhookTimestampStr) {
       devLogger.error("Missing webhook-timestamp header");
       return jsonResponse({ error: "Missing timestamp header" }, 400);
     }

     try {
       const webhookTimestamp = parseInt(webhookTimestampStr, 10);
       const currentTime = Math.floor(Date.now() / 1000);
       const timeDiff = Math.abs(currentTime - webhookTimestamp);
       
       if (timeDiff > MAX_WEBHOOK_AGE_SECONDS) {
         devLogger.error("Webhook timestamp too old. Diff:", timeDiff, "seconds. Max:", MAX_WEBHOOK_AGE_SECONDS);
         return jsonResponse({ error: "Webhook timestamp expired" }, 400);
       }
     } catch (e) {
       devLogger.error("Invalid webhook timestamp format:", webhookTimestampStr);
       return jsonResponse({ error: "Invalid timestamp format" }, 400);
     }

     const webhookHeaders = {
       'webhook-id': webhookId,
       'webhook-signature': req.headers.get('webhook-signature') || '',
       'webhook-timestamp': webhookTimestampStr,
     };

     let payload: any;
     try {
       const dodoPaymentsClient = new DodoPayments({
         bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY") || "",
         webhookKey: WEBHOOK_SECRET,
       });
       const unwrappedWebhook = dodoPaymentsClient.webhooks.unwrap(rawBody, { headers: webhookHeaders });
       payload = unwrappedWebhook;
       devLogger.log("✓ Webhook signature verified");
       devLogger.log("Unwrapped webhook type:", typeof unwrappedWebhook);
       devLogger.log("Unwrapped webhook keys:", unwrappedWebhook ? Object.keys(unwrappedWebhook) : "null/undefined");
     } catch (e: any) {
       devLogger.error("Webhook verification failed:", e?.message);
       // Do NOT fallback to raw body - reject if signature verification fails
       devLogger.error("Rejecting webhook due to signature verification failure");
       return jsonResponse({ error: "Invalid webhook signature" }, 401);
     }
     const eventType = payload?.type || payload?.event || payload?.event_type;
     const data = payload?.data || payload?.payload || payload;

     devLogger.log("Parsed webhook:", {
       eventType,
       webhookId,
       hasData: !!data,
     });

     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

     devLogger.log("Checking idempotency for webhook ID:", webhookId);
     await upsertProcessedEvent(supabase, webhookId);
     devLogger.log("✓ Idempotency check passed");

     // Security: Strict user_id validation helper
     function validateUserId(userId: any): string | null {
       if (!userId) return null;
       const userIdStr = String(userId).trim();
       // Basic validation: must be a valid UUID v4 or numeric ID
       // Adjust pattern based on your user ID format
       if (!/^[a-f0-9-]{36}$|^\d+$/.test(userIdStr)) {
         devLogger.warn("Invalid user_id format detected:", userIdStr);
         return null;
       }
       return userIdStr;
     }

     async function logPayment(userId: string, action: string, extra: Record<string, unknown> = {}) {
       try {
         devLogger.log("Logging payment:", { userId, action });
         await supabase.from("payment_logs").insert([{
           user_id: userId,
           action,
           success: true,
           additional_data: extra,
           created_at: new Date().toISOString(),
         }]);
         devLogger.log("✓ Payment logged");
       } catch (err) {
         devLogger.error("Failed to log payment:", err);
       }
     }

     devLogger.log("Processing event type:", eventType);
     devLogger.log("Full payload data:", JSON.stringify(data, null, 2));
     switch (eventType) {
       case "payment.succeeded": {
         const payment = data?.payload || data?.payment || data;
         const metadata = payment?.metadata || {};
         const rawUserId = metadata?.user_id;
         
         devLogger.log("Payment succeeded - metadata:", JSON.stringify(metadata, null, 2));
         devLogger.log("Payment succeeded - raw userId:", rawUserId);
         devLogger.log("Payment succeeded - flow_type:", metadata?.flow_type);
         
         // Security: Validate user_id before using
         const userId = validateUserId(rawUserId);
         if (!userId) {
           devLogger.error("Invalid or missing user_id in payment metadata. Raw:", rawUserId);
           await logPayment("unknown", "payment.succeeded.invalid_user", { raw_user_id: rawUserId });
           break;
         }
         
         const flow = metadata?.flow_type || "unknown";
         const dodoPaymentId = payment?.payment_id || payment?.id || payload?.payment_id || null;
         const amount = payment?.total_amount || payment?.amount || payment?.amount_captured || 0;
         const currency = payment?.currency || payload?.currency || null;
         const credits = typeof metadata?.credits === 'string' ? parseInt(metadata.credits, 10) : (metadata?.credits || 0);
         const planKey = metadata?.plan_key || null;
         const paymentSubscriptionId = payment?.subscription_id || payment?.subscription?.subscription_id || null;

         if (userId) {
           if (flow === "credits" && credits > 0) {
             const { data: existing } = await supabase
               .from("credit_purchases")
               .select("id")
               .eq("dodo_payment_id", dodoPaymentId)
               .maybeSingle();

             if (!existing) {
               const { error: insertErr } = await supabase
                 .from("credit_purchases")
                 .insert([{
                   user_id: userId,
                   credits: credits,
                   amount: amount,
                   status: "completed",
                   payment_method: "dodo",
                   dodo_payment_id: dodoPaymentId,
                   created_at: new Date().toISOString(),
                 }]);

               if (insertErr) {
                 devLogger.error("Failed to insert credit_purchases:", insertErr);
               } else {
                 devLogger.log("✓ Credit purchase recorded");
               }
             }

             try {
               const { error: rpcError } = await supabase.rpc("add_paid_credits", {
                 user_id: userId,
                 credit_amount: credits,
               });
               if (rpcError) throw rpcError;
               devLogger.log("✓ Credits added to user balance via RPC");
             } catch (rpcErr: any) {
               devLogger.warn("RPC add_paid_credits failed, falling back to direct update:", rpcErr);
               const { data: profile } = await supabase
                 .from("profiles")
                 .select("paid_credits")
                 .eq("id", userId)
                 .maybeSingle();
               const current = profile?.paid_credits || 0;
               await supabase
                 .from("profiles")
                 .update({ paid_credits: (current || 0) + credits })
                 .eq("id", userId);
               devLogger.log("✓ Credits added via direct update");
             }
           } else if (flow === "subscription" && planKey) {
             devLogger.log("Flow is subscription, waiting for subscription webhook event");
           } else {
             devLogger.log("Unknown or unhandled flow:", flow);
           }

           await logPayment(userId, "payment.succeeded", { amount, currency, flow });
         }

         break;
       }

       case "payment.failed": {
         const payment = data?.payload || data?.payment || data;
         const metadata = payment?.metadata || {};
         const userId = metadata?.user_id;
         if (userId) {
           await logPayment(userId, "payment.failed", { error: payment?.error_message });
         }
         break;
       }

       case "subscription.active":
       case "subscription.renewed":
       case "subscription.updated": {
         const sub = data?.payload || data?.subscription || data;
         const metadata = sub?.metadata || {};
         const userId = metadata?.user_id;
         const planKey = metadata?.plan_key || metadata?.product_id || null;
         const dodoSubId = sub?.subscription_id || sub?.id || sub?.subscriptionId || payload?.subscription_id || payload?.id || null;
         const dodoCustomerId = sub?.customer_id || sub?.customer?.id || null;
         
         devLogger.log("🎯 SUBSCRIPTION EVENT DEBUG:", JSON.stringify({
           eventType,
           userId,
           planKey,
           dodoSubId,
           dodoCustomerId,
           "sub.subscription_id": sub?.subscription_id,
           "sub.id": sub?.id,
           "sub.subscriptionId": sub?.subscriptionId,
           "payload.subscription_id": payload?.subscription_id,
           "payload.id": payload?.id,
           "sub.customer_id": sub?.customer_id,
           metadata,
           subPayload: sub
         }, null, 2));

         const { start, end } = parsePeriodDates(sub);

         if (!userId || !dodoSubId) {
           devLogger.error("❌ SKIPPING UPDATE - Missing userId or dodoSubId:", { userId, dodoSubId });
           break;
         }

         if (userId && dodoSubId) {
           const { data: existing } = await supabase
             .from("user_subscriptions")
             .select("id, plan_id")
             .eq("dodo_subscription_id", dodoSubId)
             .maybeSingle();

           let planIdToUse: string | null = null;
           let planSourceTable: "subscription_plans" = "subscription_plans";
           const normalizedKey = planKey ? String(planKey).toLowerCase().split("_")[0] : null;
           const currencyUpper = String((sub?.currency || sub?.plan?.currency || payload?.currency || metadata?.billing_currency || "")).toUpperCase();
           
           devLogger.log(`🔍 PLAN RESOLUTION DEBUG: planKey=${planKey}, normalizedKey=${normalizedKey}, currency=${currencyUpper}, sub.currency=${sub?.currency}, sub.plan?.currency=${sub?.plan?.currency}`);

           if (normalizedKey) {
             // Query all plans from subscription_plans (supports both INR and USD)
             const { data: allPlans } = await supabase
               .from("subscription_plans")
               .select("id, name, currency");
             
             // Find matching plan by name and currency
             let matchedPlan = allPlans?.find(
               p => p.name?.toLowerCase() === normalizedKey && p.currency === currencyUpper
             );
             
             // Fallback: match by name only if currency match not found
             if (!matchedPlan) {
               matchedPlan = allPlans?.find(
                 p => p.name?.toLowerCase() === normalizedKey
               );
             }
             
             planIdToUse = matchedPlan?.id || null;
             devLogger.log("Plan mapping - planKey:", planKey, "normalized:", normalizedKey, "currency:", currencyUpper, "found:", matchedPlan?.name, "found_currency:", matchedPlan?.currency, "id:", planIdToUse);
           }

           // 1) Update by exact dodo_subscription_id if present
           if (existing) {
             await supabase
               .from("user_subscriptions")
               .update({
                 status: "active",
                 start_date: start.toISOString(),
                 end_date: end.toISOString(),
                 updated_at: new Date().toISOString(),
                 ...(dodoCustomerId ? { dodo_customer_id: dodoCustomerId } : {}),
                 ...(planIdToUse ? { plan_id: planIdToUse } : {}),
               })
               .eq("id", existing.id);
           } else {
             const { data: userExisting } = await supabase
               .from("user_subscriptions")
               .select("id")
               .eq("user_id", userId)
               .is("dodo_subscription_id", null)
               .order("created_at", { ascending: false })
               .limit(1)
               .maybeSingle();

             if (userExisting) {
               await supabase
                 .from("user_subscriptions")
                 .update({
                   dodo_subscription_id: dodoSubId,
                   ...(dodoCustomerId ? { dodo_customer_id: dodoCustomerId } : {}),
                   status: "active",
                   start_date: start.toISOString(),
                   end_date: end.toISOString(),
                   updated_at: new Date().toISOString(),
                   ...(planIdToUse ? { plan_id: planIdToUse } : {}),
                 })
                 .eq("id", userExisting.id);
             } else {
               await supabase
                 .from("user_subscriptions")
                 .insert([{
                   user_id: userId,
                   plan_id: planIdToUse,
                   status: "active",
                   dodo_subscription_id: dodoSubId,
                   ...(dodoCustomerId ? { dodo_customer_id: dodoCustomerId } : {}),
                   start_date: start.toISOString(),
                   end_date: end.toISOString(),
                   created_at: new Date().toISOString(),
                   updated_at: new Date().toISOString(),
                 }]);
             }
           }

           const trialEndRaw = sub?.trial_end || sub?.trial_ends_at || sub?.trial_period_end || null;
           let inTrial = false;
           try {
             if (trialEndRaw) {
               const te = new Date(trialEndRaw);
               inTrial = !isNaN(te.getTime()) && te.getTime() > Date.now();
             }
           } catch {}
           const allowedPlans = ["free","pro","premium"];

           if (planIdToUse) {
             // Look up plan name from subscription_plans
             const { data: plan } = await supabase
               .from("subscription_plans")
               .select("name")
               .eq("id", planIdToUse)
               .maybeSingle();
             const planName = plan?.name ? String(plan.name).toLowerCase() : null;
             devLogger.log(`✅ Plan lookup: planIdToUse=${planIdToUse}, foundPlan=${plan?.name}, resolvedName=${planName}`);
             
             if (planName && allowedPlans.includes(planName)) {
               devLogger.log(`Attempting to update user ${userId} plan to: ${planName}`);
               const { error: updateErr, data: updateData } = await supabase
                 .from("profiles")
                 .update({
                   plan: planName,
                   subscription_expires_at: end.toISOString(),
                 })
                 .eq("id", userId)
                 .select();
               if (updateErr) {
                 devLogger.error("❌ Failed to update plan on profiles:", { userId, planName, error: updateErr.message });
               } else {
                 devLogger.log(`✅ PLAN UPDATED: user=${userId}, newPlan=${planName}, updateData=${JSON.stringify(updateData)}`);
                // Apply immediate paid credits by ADDING plan credits (use RPC for atomic increment)
                try {
                  const { data: p } = await supabase
                    .from("subscription_plans")
                    .select("credits")
                    .eq("id", planIdToUse)
                    .maybeSingle();
                  const planCredits = p?.credits ?? null;

                  // If plan defines unlimited credits with -1, set that; otherwise add plan credits
                  if (planCredits === -1) {
                    const { data: profile } = await supabase
                      .from("profiles")
                      .select("paid_credits")
                      .eq("id", userId)
                      .maybeSingle();
                    if (profile?.paid_credits !== -1) {
                      await supabase.from("profiles").update({ paid_credits: -1 }).eq("id", userId);
                      devLogger.log("✅ Set unlimited paid_credits per plan definition for user", userId);
                    }
                  } else if (planCredits != null && planCredits > 0) {
                    try {
                      const { error: rpcErr } = await supabase.rpc("add_paid_credits", {
                        user_id: userId,
                        credit_amount: planCredits,
                        provider: "subscription_auto",
                        transaction_id: dodoSubId || webhookId || null,
                      });
                      if (rpcErr) throw rpcErr;
                      devLogger.log("✓ Added paid_credits via RPC for user", userId, planCredits);
                    } catch (rpcErr) {
                      devLogger.warn("RPC add_paid_credits failed, falling back to direct increment:", rpcErr);
                      const { data: profile } = await supabase
                        .from("profiles")
                        .select("paid_credits")
                        .eq("id", userId)
                        .maybeSingle();
                      const currentPaid = profile?.paid_credits ?? 0;
                      await supabase.from("profiles").update({ paid_credits: (currentPaid || 0) + planCredits }).eq("id", userId);
                      devLogger.log("✓ Added paid_credits via direct update for user", userId, planCredits);
                    }
                  }
                } catch (err) {
                  devLogger.warn("Failed to apply immediate plan credits for user", userId, err);
                }
               }
             } else {
               devLogger.warn(`Invalid plan name for update: ${planName}, allowed=${allowedPlans}`);
             }
           } else if (planKey) {
             const normalized = String(planKey).toLowerCase().split('_')[0];
             let finalPlan = normalized;
             devLogger.log(`⚠️ FALLBACK: planIdToUse was null/undefined, using planKey=${planKey}, normalized=${normalized}`);
             if (allowedPlans.includes(finalPlan)) {
               devLogger.log(`Fallback: Updating user ${userId} plan to: ${finalPlan} from planKey=${planKey}`);
               const { error: updateErr, data: updateData } = await supabase
                 .from("profiles")
                 .update({
                   plan: finalPlan,
                   subscription_expires_at: end.toISOString(),
                 })
                 .eq("id", userId)
                 .select();
               if (updateErr) {
                 devLogger.error("❌ Fallback plan update failed:", { userId, finalPlan, error: updateErr.message });
               } else {
                 devLogger.log(`✅ PLAN UPDATED (FALLBACK): user=${userId}, newPlan=${finalPlan}, updateData=${JSON.stringify(updateData)}`);
               }
             } else {
               devLogger.warn(`Invalid plan name from fallback: ${finalPlan}, allowed=${allowedPlans}`);
             }
           } else {
             devLogger.warn(`⚠️ No planIdToUse or planKey available for user ${userId}. planIdToUse=${planIdToUse}, planKey=${planKey}`);
           }

           await logPayment(userId, eventType, { dodo_subscription_id: dodoSubId });
         }

         break;
       }

       case "subscription.cancelled":
       case "subscription.on_hold":
       case "subscription.expired":
       case "subscription.failed": {
         const sub = data?.payload || data?.subscription || data;
         const metadata = sub?.metadata || {};
         const rawUserId = metadata?.user_id;
         const dodoSubId = sub?.subscription_id || sub?.id || sub?.subscriptionId || payload?.subscription_id || payload?.id || null;

         // Security: Validate user_id before using
         const userId = validateUserId(rawUserId);
         if (!userId) {
           devLogger.error("Invalid or missing user_id in subscription metadata. Raw:", rawUserId);
           break;
         }

         if (dodoSubId) {
           const newStatus = eventType.split(".")[1];
           
           // Extract hold/failure reason from Dodo payload
           let holdReason = null;
           let paymentFailedAt = null;
           let holdExpiresAt = null;
           
           if (newStatus === "on_hold") {
             // Capture reason for payment failure
             const failureReason = sub?.failure_reason || sub?.decline_reason || sub?.error_message || null;
             const lastPaymentFailure = sub?.last_payment_failure || null;
             
             // Map common Dodo decline reasons to user-friendly messages
             const reasonMap: Record<string, string> = {
               'insufficient_funds': 'Insufficient funds',
               'card_declined': 'Card declined',
               'expired_card': 'Card expired',
               'invalid_card': 'Invalid card',
               'fraud_check_failed': 'Fraud check failed',
               'authentication_failed': 'Authentication failed',
               'issuer_unavailable': 'Bank unavailable',
               'processing_error': 'Processing error',
               'duplicate_transaction': 'Duplicate transaction',
               'card_not_supported': 'Card not supported',
             };
             
             // Use mapped reason or original failure reason
             const normalizedReason = String(failureReason || '').toLowerCase().replace(/ /g, '_');
             holdReason = reasonMap[normalizedReason] || failureReason || 'Payment declined';
             
             paymentFailedAt = lastPaymentFailure ? new Date(lastPaymentFailure).toISOString() : new Date().toISOString();
             
             // Set hold expiry to 7 days from now (typical SaaS grace period)
             const expiryDate = new Date();
             expiryDate.setDate(expiryDate.getDate() + 7);
             holdExpiresAt = expiryDate.toISOString();
             
             devLogger.log("💔 SUBSCRIPTION ON HOLD:", {
               userId,
               dodoSubId,
               holdReason,
               paymentFailedAt,
               holdExpiresAt,
             });
           }
           
           const updatePayload: Record<string, any> = {
             status: newStatus,
             updated_at: new Date().toISOString(),
             ...(newStatus === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
             ...(newStatus === "on_hold" ? {
               hold_reason: holdReason,
               payment_failed_at: paymentFailedAt,
               hold_expires_at: holdExpiresAt,
               retry_count: 0,
             } : {}),
           };
           
           await supabase
             .from("user_subscriptions")
             .update(updatePayload)
             .eq("dodo_subscription_id", dodoSubId);

           if (newStatus === "cancelled" || newStatus === "expired" || newStatus === "failed") {
             await supabase
               .from("profiles")
               .update({
                 plan: "free",
                 subscription_expires_at: null,
               })
               .eq("id", userId);
           }

           await logPayment(userId, eventType, { 
             dodo_subscription_id: dodoSubId,
             hold_reason: holdReason,
             payment_failed_at: paymentFailedAt,
           });
         }
         break;
       }

       case "refund.succeeded":
       case "refund.failed": {
         const refund = data?.payload || data?.refund || data;
         const payment = refund?.payment || null;
         const metadata = (payment?.metadata) || {};
         const userId = metadata?.user_id;
         if (userId) {
           await logPayment(userId, eventType, {
             dodo_payment_id: payment?.payment_id || payment?.id || null,
             amount: refund?.amount || null,
             currency: refund?.currency || null,
           });
         }
         break;
       }

       default: {
         break;
       }
     }

     devLogger.log("✓ Webhook processed successfully");
     return jsonResponse({ received: true });
     } catch (e: any) {
     devLogger.error("=== WEBHOOK ERROR ===");
     devLogger.error("Error message:", e?.message);
     devLogger.error("Error stack:", e?.stack);
     // Don't expose internal error details to the caller
     return jsonResponse({ error: "Internal server error" }, 500);
     }
});
