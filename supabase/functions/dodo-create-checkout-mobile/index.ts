/* @ts-nocheck */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

type CreateCheckoutInput = {
  type: "subscription" | "credits" | "one_time";
  // product_id is optional: subscriptions can resolve by metadata.plan_key + currency,
  // credits can resolve by credits + currency
  product_id?: string;
  quantity?: number;
  country_code?: string; // ISO alpha2 (e.g. IN, US)
  trial_period_days?: number; // for subscriptions only (unused; no trials)
  customer?: { email?: string; name?: string; phone_number?: string };
  // credits-only: include credits awarded for this product so webhook can atomically credit
  credits?: number;
  metadata?: Record<string, unknown>;
};

async function verifyAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing authorization header", status: 401 };
  }
  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: "Invalid or expired token", status: 401 };
  }
  return { user };
}

function resolveDodoBase() {
  const env = (Deno.env.get("DODO_ENV") || Deno.env.get("DODO_PAYMENTS_ENVIRONMENT") || "test_mode").toLowerCase();
  if (env === "live" || env === "live_mode") return "https://live.dodopayments.com";
  return "https://test.dodopayments.com";
}

function regionConfig(countryCode?: string) {
  const cc = (countryCode || "").toUpperCase();
  if (cc === "IN") {
    return {
      billing_currency: "INR",
      allowed_payment_method_types: ["upi_collect", "upi_intent", "credit", "debit"],
      billing_address_country: "IN",
    };
  }
  return {
    billing_currency: "USD",
    allowed_payment_method_types: ["credit", "debit", "apple_pay", "google_pay"],
    billing_address_country: (cc && cc.length === 2) ? cc : "US",
  };
}

/**
 * Helpers to resolve Dodo Product IDs from your catalog tables
 * - subscription_plans: must have columns (name, slug, currency, dodo_product_id)
 * - dodo_credit_packages: must have (credits, currency, dodo_product_id)
 */
async function resolveSubscriptionProductId(
  supabase: any,
  planKey: string | undefined,
  currencyUpper: string,
): Promise<string | null> {
  if (!planKey) return null;
  try {
    const normalized = String(planKey).toLowerCase().split("_")[0];
    const { data: rows, error } = await supabase
      .from("subscription_plans")
      .select("dodo_product_id, name, currency");
    if (error || !rows) return null;

    // Prefer currency match
    const byCurrency = rows.filter((r: any) => String(r.currency || "").toUpperCase() === currencyUpper);
    const pick = (arr: any[]) =>
      arr.find((r: any) => String(r.name || "").toLowerCase() === normalized);

    let match = pick(byCurrency);
    if (!match) match = pick(rows);
    const pid = match?.dodo_product_id ? String(match.dodo_product_id) : null;
    return pid || null;
  } catch (_e) {
    return null;
  }
}

async function resolveCreditsProductId(
  supabase: any,
  credits: number | null,
  currencyUpper: string,
): Promise<string | null> {
  if (!credits || credits <= 0) return null;
  try {
    // prefer exact match by credits & currency
    const { data, error } = await supabase
      .from("dodo_credit_packages")
      .select("dodo_product_id, credits, currency")
      .eq("credits", credits)
      .eq("currency", currencyUpper)
      .maybeSingle();
    if (error) return null;
    const pid = data?.dodo_product_id ? String(data.dodo_product_id) : null;
    return pid || null;
  } catch (_e) {
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const DODO_API_KEY = Deno.env.get("DODO_PAYMENTS_API_KEY") || "";
    // Mobile deep link for Expo (falls back to cognify scheme in app.json)
    // Prefer explicit DODO_PAYMENTS_RETURN_URL_MOBILE if set; then DODO_PAYMENTS_RETURN_URL; otherwise use cognify://payments/complete
    const RETURN_URL =
      Deno.env.get("DODO_PAYMENTS_RETURN_URL_MOBILE") ||
      Deno.env.get("DODO_PAYMENTS_RETURN_URL") ||
      Deno.env.get("DODO_RETURN_URL") ||
      "cognify://payments/complete";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!DODO_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing Dodo Payments API key (DODO_PAYMENTS_API_KEY)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify auth (same pattern as other functions)
    const authResult = await verifyAuth(req, supabase);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = authResult.user;

    // Log request details
    devLogger.log("Request method:", req.method);
    devLogger.log("Request URL:", req.url);
    devLogger.log("Content-Type:", req.headers.get("content-type"));
    devLogger.log("Content-Length:", req.headers.get("content-length"));

    // Read body as text first to debug
    const bodyText = await req.text();
    devLogger.log("Raw body length:", bodyText.length);
    devLogger.log("Raw body preview:", bodyText.substring(0, 200));

    let body: CreateCheckoutInput;
    try {
      if (!bodyText) {
        throw new Error("Request body is empty");
      }
      body = JSON.parse(bodyText) as CreateCheckoutInput;
    } catch (parseErr) {
      devLogger.error("Failed to parse request JSON:", parseErr);
      devLogger.error("Body text:", bodyText);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: (parseErr as any)?.message,
        bodyLength: bodyText.length
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Log sanitized request info without customer PII
    devLogger.log("Checkout request:", {
      type: body?.type,
      product_id: body?.product_id,
      quantity: body?.quantity,
      country_code: body?.country_code,
      trial_period_days: body?.trial_period_days,
      has_credits: !!body?.credits,
      has_metadata: !!body?.metadata,
    });
    
    // Only require type at this stage; product_id can be resolved later from catalog
    if (!body || !body.type) {
      devLogger.error("Validation failed - missing type:", body);
      return new Response(JSON.stringify({
        error: "Missing required field: type"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine region configuration
    const region = regionConfig(body.country_code);

    // Load customer details (prefer provided, else fallback from profile)
    let customerEmail = body.customer?.email || user?.email || undefined;
    let customerName = body.customer?.name || undefined;
    let customerPhone = body.customer?.phone_number || undefined;

    if (!customerEmail || !customerName) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("id", user.id)
          .maybeSingle();

        customerEmail = customerEmail || profile?.email || undefined;
        customerName = customerName || profile?.display_name || undefined;
      } catch (e) {
        devLogger.error("Failed to load profile details:", e);
        // continue silently
      }
    }

    // Derive/normalize plan_key for subscription so downstream always gets "pro" | "premium"
    // Look up plan name from subscription_plans table by dodo_product_id
    let derivedPlanKey: string | undefined = undefined;
    const clientPlanKey = (body as any)?.metadata?.plan_key as string | undefined;
    if (clientPlanKey) {
      derivedPlanKey = String(clientPlanKey).toLowerCase().split("_")[0]; // normalize
    }
    if (!derivedPlanKey && body.type === "subscription") {
      const pid = (body.product_id || "").trim();
      try {
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("name")
          .eq("dodo_product_id", pid)
          .maybeSingle();
        if (plan?.name) {
          derivedPlanKey = String(plan.name).toLowerCase();
        }
      } catch (_e) {
        // swallow and continue without plan_key
      }
    }

    const dodoBase = resolveDodoBase();

    // Resolve product_id if not supplied:
    // - For subscriptions, derive from subscription_plans by (plan_key, currency)
    // - For credits, derive from dodo_credit_packages by (credits, currency)
    let productId = (body.product_id || "").trim();
    const currencyUpper = String(region.billing_currency || "").toUpperCase();

    if (!productId) {
      if (body.type === "subscription") {
        // Use normalized plan_key computed earlier or client-provided
        const planKeyForLookup = derivedPlanKey || clientPlanKey || undefined;
        const resolved = await resolveSubscriptionProductId(supabase, planKeyForLookup, currencyUpper);
        if (resolved) productId = resolved;
      } else if (body.type === "credits") {
        const creditsNum = typeof body.credits === "number" ? body.credits : null;
        const resolved = await resolveCreditsProductId(supabase, creditsNum, currencyUpper);
        if (resolved) productId = resolved;
      }
    }

    if (!productId) {
      const reason =
        body.type === "subscription"
          ? "Missing product_id and could not resolve from subscription_plans via metadata.plan_key"
          : body.type === "credits"
            ? "Missing product_id and could not resolve from dodo_credit_packages via credits"
            : "Missing product_id";
      devLogger.error("Checkout validation error:", reason, { type: body.type, metadata: body?.metadata, credits: body?.credits });
      return new Response(JSON.stringify({ error: reason }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the checkout session payload (filter out undefined to avoid Dodo API validation errors)
    const product_cart = [{ product_id: productId, quantity: body.quantity && body.quantity > 0 ? body.quantity : 1 }];
    
    const checkoutPayload: Record<string, unknown> = {
      product_cart,
      allowed_payment_method_types: region.allowed_payment_method_types,
      billing_currency: region.billing_currency,
      billing_address: {
        country: region.billing_address_country,
      },
      return_url: RETURN_URL,
      metadata: {
        user_id: user.id,
        flow_type: body.type,
        product_id: body.product_id,
        // Ensure plan_key is normalized (pro/premium) if present
        ...(derivedPlanKey ? { plan_key: derivedPlanKey } : {}),
        ...(typeof body.credits === "number" ? { credits: String(body.credits) } : {}),
        // Help webhook choose catalog by currency if needed
        billing_currency: region.billing_currency,
        // Include other client metadata, but avoid overriding normalized plan_key above
        ...(() => {
          const m = { ...(body.metadata || {}) } as Record<string, unknown>;
          if (m && "plan_key" in m) delete (m as any)["plan_key"];
          return m;
        })(),
      },
      feature_flags: {
        allow_currency_selection: false,
      },
    };

    // Add customer only if we have an email
    if (customerEmail) {
      checkoutPayload.customer = {
        email: customerEmail,
        ...(customerName ? { name: customerName } : {}),
        ...(customerPhone ? { phone_number: customerPhone } : {}),
      };
    }

    // Trials are disabled per current requirements; do not include subscription_data.trial_period_days
    // (Intentionally left blank)
    
    devLogger.log("Final checkout payload to send to Dodo:", JSON.stringify(checkoutPayload, null, 2));

    // Call Dodo Payments - Checkout Sessions
    const resp = await fetch(`${dodoBase}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to create Dodo checkout session",
          status: resp.status,
          details: data,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Expecting checkout_url in response
    const checkoutUrl = data.checkout_url || data.url || data.checkout?.url;
    if (!checkoutUrl) {
      return new Response(
        JSON.stringify({
          error: "Dodo response missing checkout_url",
          details: data,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ checkout_url: checkoutUrl, session: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error creating Dodo checkout",
        details: e?.message || String(e),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});