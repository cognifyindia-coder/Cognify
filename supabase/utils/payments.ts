/* @ts-nocheck */
import { supabase } from "./supabase";

export type CheckoutType = "subscription" | "one_time" | "credits";

export type CreateCheckoutParams = {
  type: CheckoutType;
  /**
   * Optional: If omitted for subscriptions or credits, the Edge Function resolves:
   * - subscriptions: from subscription_plans by plan_key + currency
   * - credits: from dodo_credit_packages by credits + currency
   */
  product_id?: string;
  quantity?: number;
  country_code?: string; // ISO alpha2 (e.g. IN, US)
  trial_period_days?: number; // subscriptions only (unused; no trials)
  credits?: number; // credits flow only
  metadata?: Record<string, unknown>;
  customer?: { email?: string; name?: string; phone_number?: string };
};

/**
 * Create a Dodo hosted checkout session via Supabase Edge Function.
 * The Edge Function enforces auth using the Supabase session token.
 *
 * Returns the checkout_url to open in the system browser (expo-web-browser or Linking).
 */
export async function createMobileCheckout(params: CreateCheckoutParams): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error("No active session. Please log in.");

  const { data, error } = await supabase.functions.invoke("dodo-create-checkout-mobile", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      // Ensure the Edge Function can verify the user
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (error) {
    console.error("Edge Function error:", error);
    console.error("Edge Function data:", data);
    console.error("Error context:", error?.context);
    
    let errorMsg = error?.message || "Unknown error";
    
    // Try to read the response body if it's a Blob
    try {
      if (error?.context?._bodyBlob?.size > 0) {
        console.log("Body blob size:", error.context._bodyBlob.size);
        // Create a FileReader to read the blob
        const reader = new FileReader();
        const bodyPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve("Could not read body");
          reader.readAsText(error.context._bodyBlob);
        });
        const bodyText = await bodyPromise;
        console.error("Response body:", bodyText);
        try {
          const parsed = JSON.parse(bodyText);
          errorMsg = parsed.error || parsed.message || bodyText;
        } catch {
          errorMsg = bodyText;
        }
      }
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    
    throw new Error(`Failed to create checkout session (${error?.context?.status}): ${errorMsg}`);
  }

  const checkoutUrl = data?.checkout_url || data?.url || data?.checkout?.url;
  if (!checkoutUrl) {
    throw new Error("Checkout URL missing in function response");
  }
  return checkoutUrl;
}

/**
 * Example usage from a screen:
 *
 * import * as WebBrowser from "expo-web-browser";
 * import { createMobileCheckout } from "../supabase/utils/payments";
 *
 * async function onGoProPress() {
 *   try {
 *     const checkoutUrl = await createMobileCheckout({
 *       type: "subscription",
 *       product_id: "pdt_xxxxxxxxxxxxxxxxxxxxx", // replace with your Dodo product ID
 *       quantity: 1,
 *       // Optionally, pass country_code to hint regional payment methods:
 *       // country_code: "IN",
 *       // trial_period_days: 7,
 *       metadata: { plan_key: "pro" }, // normalized by the function; safe to pass
 *     });
 *     await WebBrowser.openBrowserAsync(checkoutUrl);
 *     // After payment, Dodo will deep-link back to your app at cognify://payments/complete
 *     // Refresh entitlements from Supabase in your focus/handler.
 *   } catch (e) {
 *     console.error("Failed to start checkout:", e);
 *   }
 * }
 */