import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

async function sendPushNotifications(messages: PushMessage[]) {
  const chunks = [];
  const chunkSize = 100;

  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
          Authorization: `Bearer ${expoAccessToken}`,
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error("Push notification error:", await response.text());
      }
    } catch (error) {
      console.error("Failed to send push notifications:", error);
    }
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messageId, senderId, conversationId, messageContent } =
      await req.json();

    // Get sender info
    const { data: sender } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", senderId)
      .single();

    // Get all users in conversation except sender
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", senderId);

    if (!participants) {
      return new Response("No participants found", { status: 404 });
    }

    // Get push tokens for all participants
    const userIds = participants.map((p) => p.user_id);
    const { data: users } = await supabase
      .from("profiles")
      .select("id, push_token")
      .in("id", userIds)
      .not("push_token", "is", null);

    if (!users || users.length === 0) {
      return new Response("No push tokens available", { status: 404 });
    }

    // Prepare push notification messages
    const pushMessages: PushMessage[] = users.map((user) => ({
      to: user.push_token,
      sound: "default",
      title: sender?.display_name || "New Message",
      body: messageContent.substring(0, 100),
      data: { conversationId },
    }));

    // Send notifications
    await sendPushNotifications(pushMessages);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
