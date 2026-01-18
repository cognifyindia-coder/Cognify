-- Create a function that calls the push notification edge function
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the edge function to send push notifications via HTTP request
  PERFORM net.http_post(
    'https://emdmuzhgzgapxzfrezzs.supabase.co/functions/v1/send-push-notification',
    jsonb_build_object(
      'messageId', NEW.id,
      'senderId', NEW.sender_id,
      'conversationId', NEW.conversation_id,
      'messageContent', NEW.content
    ),
    'application/json'
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_created_send_notification ON public.messages;

-- Create the trigger
CREATE TRIGGER on_message_created_send_notification
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.trigger_push_notification();
