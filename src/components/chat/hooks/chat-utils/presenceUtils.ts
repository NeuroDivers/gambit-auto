
export async function updateUserTypingStatus(
  presenceChannel: any, 
  currentUserId: string | null, 
  recipientId: string,
  isTyping: boolean
) {
  if (!currentUserId || !presenceChannel) return;
  
  try {
    await presenceChannel.track({
      user_id: currentUserId,
      typing: isTyping,
      typing_to: recipientId,
      last_typing_update: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
}
