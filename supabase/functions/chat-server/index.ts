
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";
  
  // Check if it's a WebSocket request
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({ error: "This endpoint requires a WebSocket connection" }), 
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Get auth token from request
  const token = headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Authorization token is required" }), 
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify the token and get user
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !userData.user) {
    return new Response(
      JSON.stringify({ error: "Invalid authorization token" }), 
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  const userId = userData.user.id;
  
  // Upgrade the connection to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Set up WebSocket event handlers
  socket.onopen = () => {
    console.log(`WebSocket connection established for user ${userId}`);
    
    // Update user's online status
    supabase
      .from("users")
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq("id", userId)
      .then(() => {
        console.log(`User ${userId} marked as online`);
      })
      .catch((error) => {
        console.error(`Error updating online status for user ${userId}:`, error);
      });
  };
  
  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle different message types
      switch (message.type) {
        case "chat_message":
          await handleChatMessage(socket, userId, message);
          break;
          
        case "typing_status":
          await handleTypingStatus(userId, message);
          break;
          
        case "read_receipt":
          await handleReadReceipt(userId, message);
          break;
          
        default:
          socket.send(JSON.stringify({ 
            error: `Unknown message type: ${message.type}` 
          }));
      }
    } catch (error) {
      console.error("Error handling message:", error);
      socket.send(JSON.stringify({ error: "Invalid message format" }));
    }
  };
  
  socket.onclose = () => {
    console.log(`WebSocket connection closed for user ${userId}`);
    
    // Update user's offline status
    supabase
      .from("users")
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq("id", userId)
      .then(() => {
        console.log(`User ${userId} marked as offline`);
      })
      .catch((error) => {
        console.error(`Error updating offline status for user ${userId}:`, error);
      });
  };
  
  socket.onerror = (error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
  };
  
  return response;
});

// Handle incoming chat messages
async function handleChatMessage(socket: WebSocket, userId: string, message: any) {
  if (!message.chatId || !message.text || !message.recipientId) {
    socket.send(JSON.stringify({ 
      error: "Missing required fields for chat message" 
    }));
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Store message in the database
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: message.chatId,
        sender_id: userId,
        recipient_id: message.recipientId,
        text: message.text,
        image_url: message.imageUrl,
        voice_url: message.voiceUrl,
        timestamp: new Date().toISOString(),
        read: false
      })
      .select()
      .single();
      
    if (messageError) throw messageError;
    
    // Update the chat's last message
    await supabase
      .from("chats")
      .update({
        last_message: {
          text: message.text || (message.imageUrl ? "Image" : (message.voiceUrl ? "Voice message" : "")),
          sender_id: userId,
          timestamp: messageData.timestamp,
          read: false,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.chatId);
    
    // Create notification for recipient
    await supabase
      .from("notifications")
      .insert({
        user_id: message.recipientId,
        type: "message",
        title: "New message",
        body: message.text || "You received a new message",
        action_url: `/messages/${message.chatId}`,
        read: false,
        created_at: new Date().toISOString(),
        data: { chatId: message.chatId, senderId: userId }
      });
      
    // Send confirmation to the sender
    socket.send(JSON.stringify({
      type: "message_sent",
      messageId: messageData.id,
      timestamp: messageData.timestamp
    }));
    
  } catch (error) {
    console.error("Error handling chat message:", error);
    socket.send(JSON.stringify({ error: "Failed to send message" }));
  }
}

// Handle typing status updates
async function handleTypingStatus(userId: string, message: any) {
  if (!message.chatId) {
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    await supabase
      .from("user_typing")
      .upsert({
        chat_id: message.chatId,
        user_id: userId,
        is_typing: message.isTyping === true,
        updated_at: new Date().toISOString()
      }, { onConflict: "chat_id,user_id" });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
}

// Handle read receipts
async function handleReadReceipt(userId: string, message: any) {
  if (!message.chatId) {
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Mark messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("chat_id", message.chatId)
      .eq("recipient_id", userId)
      .eq("read", false);
      
    // Update last message read status if needed
    const { data: chatData } = await supabase
      .from("chats")
      .select("last_message")
      .eq("id", message.chatId)
      .single();
      
    if (chatData && chatData.last_message && 
        chatData.last_message.recipient_id === userId && 
        !chatData.last_message.read) {
      await supabase
        .from("chats")
        .update({ "last_message.read": true })
        .eq("id", message.chatId);
    }
  } catch (error) {
    console.error("Error handling read receipt:", error);
  }
}
