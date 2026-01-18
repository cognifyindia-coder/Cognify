/**
 * supabase/functions/openrouter-proxy/index.ts
 * Analytics-enabled OpenRouter API wrapper with usage tracking
 */ import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
// Helper function to check if we're in development
function isDevelopment() {
  const env = Deno.env.get("ENVIRONMENT") || Deno.env.get("NODE_ENV") || "production";
  return env === "development" || env === "dev" || env === "local";
}
// Debug logging that only works in development
function debugLog(...args) {
  if (isDevelopment()) {
    console.log(...args);
  }
}
function debugError(...args) {
  if (isDevelopment()) {
    console.error(...args);
  } else {
    // In production, still log errors but without sensitive details
    console.error("Error occurred in openrouter-proxy");
  }
}
// OpenRouter model pricing (as of 2024) - Update these regularly
const MODEL_PRICING = {
  "openai/gpt-4o": {
    prompt: 5.0,
    completion: 15.0
  },
  "openai/gpt-4o-mini": {
    prompt: 0.15,
    completion: 0.6
  },
  "openai/gpt-4-turbo": {
    prompt: 10.0,
    completion: 30.0
  },
  "openai/gpt-3.5-turbo": {
    prompt: 0.5,
    completion: 1.5
  },
  "anthropic/claude-3.5-sonnet": {
    prompt: 3.0,
    completion: 15.0
  },
  "anthropic/claude-3-haiku": {
    prompt: 0.25,
    completion: 1.25
  },
  "anthropic/claude-3-opus": {
    prompt: 15.0,
    completion: 75.0
  },
  "google/gemini-pro": {
    prompt: 0.5,
    completion: 1.5
  },
  "meta-llama/llama-3.1-70b-instruct": {
    prompt: 0.52,
    completion: 0.75
  },
  "meta-llama/llama-3.1-8b-instruct": {
    prompt: 0.055,
    completion: 0.055
  },
  // Legacy model names for backward compatibility
  "gpt-4": {
    prompt: 30.0,
    completion: 60.0
  },
  "gpt-4-turbo": {
    prompt: 10.0,
    completion: 30.0
  },
  "gpt-3.5-turbo": {
    prompt: 0.5,
    completion: 1.5
  },
  "claude-3-opus-20240229": {
    prompt: 15.0,
    completion: 75.0
  },
  "claude-3-sonnet-20240229": {
    prompt: 3.0,
    completion: 15.0
  }
};
function calculateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`No pricing data for model: ${model}`);
    return 0;
  }
  const inputCost = inputTokens / 1_000_000 * pricing.prompt;
  const outputCost = outputTokens / 1_000_000 * pricing.completion;
  return Number((inputCost + outputCost).toFixed(6));
}
// Helper: Parse JWT from Supabase Auth
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch  {
    return null;
  }
}
// Helper: Get user ID from Authorization header
function getUserId(req) {
  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const jwt = parseJwt(auth.replace("Bearer ", ""));
  return jwt?.sub || null;
}
const DEFAULT_ALLOWED_PROVIDERS = [
  "openrouter",
  "openai",
  "mistralai",
  "anthropic",
  "google",
  "meta-llama",
  "deepseek"
];
function getProviderFromModel(model) {
  if (model.includes("/")) {
    return model.split("/")[0];
  }
  // Map legacy or short names to providers
  if (model.startsWith("gpt-")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("mistral-")) return "mistralai";
  if (model.startsWith("gemini-")) return "google";
  return "openrouter"; // fallback
}
Deno.serve(async (req)=>{
  debugLog(`OpenRouter Proxy: ${req.method} ${req.url}`);
  const url = new URL(req.url);
  debugLog(`URL pathname: ${url.pathname}`);
  debugLog(`URL search: ${url.search}`);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    debugLog("Handling CORS preflight");
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  // Add basic health check
  if (url.pathname.endsWith("/health")) {
    debugLog("Health check requested");
    return new Response(JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // Debug: Log all requests that don't match specific endpoints
  if (!url.pathname.endsWith("/models") && !url.pathname.endsWith("/test-prompt") && !url.pathname.endsWith("/health")) {
    debugLog("Main endpoint request - method:", req.method, "pathname:", url.pathname);
  }
  // Handle models endpoint
  if (url.pathname.endsWith("/models")) {
    if (req.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({
        error: "Missing OpenRouter API key"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: "Failed to fetch models",
        details: String(err)
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  }
  // Handle test-prompt endpoint
  if (url.pathname.endsWith("/test-prompt")) {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({
        error: "Missing OpenRouter API key"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    try {
      const requestBody = await req.json();
      const { messages, model, temperature, top_p } = requestBody;
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Cognify Test Prompt",
          "HTTP-Referer": Deno.env.get("SITE_URL") || "http://localhost:8080"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: temperature || 1,
          top_p: top_p || 1,
          max_tokens: 1024
        })
      });
      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        return new Response(JSON.stringify({
          error: "OpenRouter API error",
          details: errorText
        }), {
          status: openRouterResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      const data = await openRouterResponse.json();
      // Return simplified response for test-prompt endpoint
      return new Response(JSON.stringify({
        text: data.choices?.[0]?.message?.content || "No response",
        usage: data.usage
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: "Failed to test prompt",
        details: String(err)
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  }
  debugLog("Reached main request processing section");
  try {
    debugLog("Starting main request processing...");
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    debugLog("Environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasOpenRouterKey: !!openrouterKey
    });
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    if (!openrouterKey) {
      throw new Error("Missing OPENROUTER_API_KEY environment variable");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed"
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let requestBody;
    try {
      requestBody = await req.json();
      debugLog("Request received with model:", requestBody.model);
      debugLog("Messages count:", requestBody.messages?.length);
      // Log message types without logging full content (to avoid huge logs with images)
      if (requestBody.messages) {
        requestBody.messages.forEach((msg, i)=>{
          if (typeof msg.content === 'string') {
            debugLog(`Message ${i}: text content (${msg.content.length} chars)`);
          } else if (Array.isArray(msg.content)) {
            debugLog(`Message ${i}: array content with ${msg.content.length} parts`);
            msg.content.forEach((part, j)=>{
              if (part.type === 'image_url') {
                debugLog(`  Part ${j}: image_url`);
              } else if (part.type === 'text') {
                debugLog(`  Part ${j}: text (${part.text?.length || 0} chars)`);
              }
            });
          }
        });
      }
    } catch (error) {
      debugError("Failed to parse request JSON:", error);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const { model, messages, stream = false, ...otherParams } = requestBody;
    let { user_id } = requestBody;
    // Get user_id from auth header if not provided in body
    if (!user_id) {
      user_id = getUserId(req);
    }
    // Validate required fields
    if (!user_id || !model || !messages) {
      return new Response(JSON.stringify({
        error: "Missing required fields: user_id, model, messages"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Verify user exists (optional - remove if you want to skip this check)
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user) {
      console.warn("User verification failed:", userError);
    // Continue anyway - user might be valid but not accessible via admin API
    }
    // Check provider permissions
    const provider = getProviderFromModel(model);
    let allowedProviders = [
      ...DEFAULT_ALLOWED_PROVIDERS
    ];
    try {
      const { data: profile } = await supabase.from("profiles").select("selected_models").eq("id", user_id).single();
      if (profile?.selected_models) {
        let selectedModels = profile.selected_models;
        if (typeof selectedModels === "string") {
          try {
            selectedModels = JSON.parse(selectedModels);
          } catch (error) {
            console.warn('Failed to parse selected_models JSON:', error.message);
            selectedModels = [];
          }
        }
        if (Array.isArray(selectedModels)) {
          const userProviders = selectedModels.map((m)=>getProviderFromModel(m)).filter((p, i, arr)=>p && arr.indexOf(p) === i);
          allowedProviders = Array.from(new Set([
            ...DEFAULT_ALLOWED_PROVIDERS,
            ...userProviders
          ]));
        }
      }
    } catch (e) {
      console.warn("Could not load user providers:", e);
    }
    if (!allowedProviders.includes(provider)) {
      return new Response(JSON.stringify({
        error: `Provider '${provider}' is not allowed for model '${model}'.`,
        allowed_providers: allowedProviders
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const startTime = Date.now();
    const OPENROUTER_API_KEY = openrouterKey; // Use the key we already validated
    // Prepare OpenRouter API request
    const openRouterRequest = {
      model,
      messages,
      stream,
      max_tokens: otherParams.max_tokens || 1024,
      temperature: Math.min(otherParams.temperature || 1, 1),
      ...requestBody.modalities && {
        modalities: requestBody.modalities
      },
      ...otherParams
    };
    // Debug: Check if this is a vision request
    const hasImages = messages.some((msg)=>Array.isArray(msg.content) && msg.content.some((part)=>part.type === 'image_url'));
    if (hasImages) {
      debugLog("Vision request detected for model:", model);
      // Check if model supports vision
      const visionModels = [
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'openai/gpt-4-vision-preview',
        'anthropic/claude-3-opus',
        'anthropic/claude-3-sonnet',
        'anthropic/claude-3-haiku',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-pro-vision',
        'google/gemini-1.5-pro',
        'google/gemini-1.5-flash'
      ];
      if (!visionModels.includes(model)) {
        debugError("Model does not support vision:", model);
        return new Response(JSON.stringify({
          error: "Model does not support images",
          details: `The model '${model}' does not support image inputs. Please use a vision-capable model like 'openai/gpt-4o' or 'anthropic/claude-3.5-sonnet'.`,
          supportedModels: visionModels
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      debugLog("Vision model confirmed, processing image request");
    }
    // Check request size (rough estimate)
    const requestSize = JSON.stringify(openRouterRequest).length;
    debugLog(`Request size: ${(requestSize / 1024).toFixed(1)}KB`);
    if (requestSize > 10 * 1024 * 1024) {
      debugError("Request too large:", requestSize);
      return new Response(JSON.stringify({
        error: "Request too large",
        details: `Request size ${(requestSize / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`
      }), {
        status: 413,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Call OpenRouter API
    debugLog("Calling OpenRouter API with model:", model);
    let openRouterResponse;
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(()=>controller.abort(), 60000); // 60 second timeout
      openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Cognify Analytics",
          "HTTP-Referer": Deno.env.get("SITE_URL") || "http://localhost:8080"
        },
        body: JSON.stringify(openRouterRequest),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      debugError("Fetch error calling OpenRouter:", fetchError);
      let errorMessage = "Failed to connect to OpenRouter API";
      let statusCode = 500;
      if (fetchError.name === 'AbortError') {
        errorMessage = "Request timeout - OpenRouter API took too long to respond";
        statusCode = 408;
      } else if (fetchError.message.includes('404')) {
        errorMessage = "OpenRouter API endpoint not found - check model availability";
        statusCode = 404;
      } else if (fetchError.message.includes('401') || fetchError.message.includes('403')) {
        errorMessage = "OpenRouter API authentication failed - check API key";
        statusCode = 401;
      }
      return new Response(JSON.stringify({
        error: errorMessage,
        details: fetchError.message,
        model: model,
        hasImages: hasImages
      }), {
        status: statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const responseTime = Date.now() - startTime;
    if (stream) {
      debugLog("Handling streaming response, status:", openRouterResponse.status);
      // For streaming, handle errors differently
      if (!openRouterResponse.ok) {
        // Don't consume the body for streaming errors, just use status info
        const errorText = `HTTP ${openRouterResponse.status}: ${openRouterResponse.statusText}`;
        debugError("Streaming error:", errorText);
        // Log failed streaming request
        try {
          await supabase.from("usage_logs").insert({
            user_id,
            model,
            tokens_input: 0,
            tokens_output: 0,
            cost_usd: 0,
            endpoint: "chat/completions",
            response_time_ms: responseTime,
            success: false,
            error_message: errorText
          });
        } catch (logError) {
          debugError("Failed to log streaming error:", logError);
        }
        return new Response(JSON.stringify({
          error: "Streaming request failed",
          details: errorText,
          status: openRouterResponse.status
        }), {
          status: openRouterResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      // For successful streaming responses, pass through the body directly
      debugLog("Streaming response successful, passing through body");
      // Log successful streaming request (don't await to avoid blocking the stream)
      supabase.from("usage_logs").insert({
        user_id,
        model,
        tokens_input: 0,
        tokens_output: 0,
        cost_usd: 0,
        endpoint: "chat/completions",
        response_time_ms: responseTime,
        success: true,
        error_message: null
      }).then(()=>{
        debugLog("Streaming usage logged successfully");
      }).catch((logError)=>{
        debugError("Failed to log streaming success:", logError);
      });
      return new Response(openRouterResponse.body, {
        status: openRouterResponse.status,
        headers: {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          ...corsHeaders
        }
      });
    }
    if (!openRouterResponse.ok) {
      let errorText;
      try {
        errorText = await openRouterResponse.text();
      } catch (e) {
        errorText = "Failed to read error response";
      }
      debugError("OpenRouter API error:", {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        error: errorText
      });
      // Log failed request
      try {
        await supabase.from("usage_logs").insert({
          user_id,
          model,
          tokens_input: 0,
          tokens_output: 0,
          cost_usd: 0,
          endpoint: "chat/completions",
          response_time_ms: responseTime,
          success: false,
          error_message: errorText
        });
      } catch (logError) {
        debugError("Failed to log error:", logError);
      }
      return new Response(JSON.stringify({
        error: "OpenRouter API error",
        details: errorText,
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText
      }), {
        status: openRouterResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const openRouterData = await openRouterResponse.json();
    // Extract usage data
    const inputTokens = openRouterData.usage?.prompt_tokens || 0;
    const outputTokens = openRouterData.usage?.completion_tokens || 0;
    const totalTokens = openRouterData.usage?.total_tokens || inputTokens + outputTokens;
    // Calculate cost
    const costUsd = calculateCost(model, inputTokens, outputTokens);
    // Get request ID from headers if available
    const requestId = openRouterResponse.headers.get("x-request-id") || openRouterData.id;
    // Log usage to database
    const { error: logError } = await supabase.from("usage_logs").insert({
      user_id,
      model,
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      cost_usd: costUsd,
      endpoint: "chat/completions",
      request_id: requestId,
      response_time_ms: responseTime,
      success: true
    });
    if (logError) {
      debugError("Error logging usage:", logError);
    // Don't fail the request, just log the error
    }
    // Return the OpenRouter response with additional usage metadata
    const response = {
      ...openRouterData,
      usage_metadata: {
        tokens_input: inputTokens,
        tokens_output: outputTokens,
        total_tokens: totalTokens,
        cost_usd: costUsd,
        response_time_ms: responseTime,
        logged: !logError
      }
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    debugError("Unexpected error in openrouter-proxy:", error);
    debugError("Error stack:", error.stack);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
