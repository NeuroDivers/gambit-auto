
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"

export async function markMessagesAsRead(messages: ChatMessage[], currentUserId: string | null, recipientId: string) {
  const unreadMessages = messages.filter(m => 
    m.sender_id === recipientId && 
    m.recipient_id === currentUserId && 
    !m.read
  )

  if (unreadMessages.length > 0) {
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', unreadMessages.map(m => m.id))

    if (updateError) {
      console.error("Error marking messages as read:", updateError)
    }

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("profile_id", currentUserId)
      .eq("sender_id", recipientId)
      .eq("type", 'chat_message')
  }

  return unreadMessages.length > 0
}

export async function markSingleMessageAsRead(messageId: string) {
  const { error: updateError } = await supabase
    .from("chat_messages")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', messageId)

  if (updateError) {
    console.error("Error marking message as read:", updateError)
  }
}

export async function sendNewMessage(messageText: string, currentUserId: string, recipientId: string) {
  const { error } = await supabase
    .from("chat_messages")
    .insert([{
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: messageText.trim(),
    }])

  return { success: !error, error }
}
