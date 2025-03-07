
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

export function useChatActions(
  messages: ChatMessage[], 
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  currentUserId: string | null,
  recipientId: string,
  scrollToBottom: (immediate?: boolean) => void
) {
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      
      if (editingMessageId) {
        saveEdit(editingMessageId);
      } else {
        sendMessage();
      }
    } else if (e.key === 'Escape' && editingMessageId) {
      cancelEditing();
    }
  };

  const isWithinEditWindow = (message: ChatMessage) => {
    const messageDate = new Date(message.created_at);
    const now = new Date();
    return differenceInMinutes(now, messageDate) <= 5;
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setNewMessage(message.message);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

  const saveEdit = async (messageId: string) => {
    if (!newMessage.trim() || !currentUserId) return;

    const messageToUpdate = messages.find(m => m.id === messageId);
    if (!messageToUpdate) return;

    const originalMessage = messageToUpdate.original_message || messageToUpdate.message;

    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: newMessage, is_edited: true, original_message: originalMessage, updated_at: new Date().toISOString() } 
          : msg
      )
    );

    const { error } = await supabase
      .from("chat_messages")
      .update({
        message: newMessage,
        is_edited: true,
        original_message: originalMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Failed to update message",
        description: "Please try again",
        variant: "destructive"
      });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? messageToUpdate : msg
        )
      );
    } else {
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'message-edited',
          payload: { messageId, newText: newMessage }
        });
      }
    }

    cancelEditing();
  };

  const unsendMessage = async (messageId: string) => {
    const messageToDelete = messages.find(msg => msg.id === messageId);
    if (!messageToDelete) return;
    
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, message: "This message was unsent" }
          : msg
      )
    );

    const { error } = await supabase
      .from("chat_messages")
      .update({
        is_deleted: true,
        message: "This message was unsent"
      })
      .eq('id', messageId);

    if (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Failed to unsend message",
        description: "Please try again",
        variant: "destructive"
      });
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? messageToDelete : msg
      ));
    } else {
      toast({
        title: "Message unsent",
        duration: 2000
      });
      
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'message-deleted',
          payload: { messageId }
        });
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: recipientId,
      message: newMessage.trim(),
      read_at: null,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setMessages(curr => [...curr, newMsg]);
    setNewMessage("");
    scrollToBottom(true);

    const { error } = await supabase
      .from("chat_messages")
      .insert([{
        sender_id: currentUserId,
        recipient_id: recipientId,
        message: newMessage.trim(),
      }]);

    if (error) {
      console.error("Error sending message:", error);
      setMessages(curr => curr.filter(msg => msg.id !== newMsg.id));
      return;
    }
  };

  const handleTyping = () => {
    if (!currentUserId || !recipientId || !typingChannelRef.current) return;
    
    console.log("User is typing, sending typing indicator");

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingChannelRef.current.send({
      event: 'typing',
      payload: {
        typing: true,
        sender_id: currentUserId
      }
    }).then(() => {
      console.log("Typing indicator sent successfully");
    }).catch((err: any) => {
      console.error("Error sending typing indicator:", err);
    });

    const timeout = setTimeout(() => {
      setTypingTimeout(null);
    }, 1000);

    setTypingTimeout(timeout);
  };

  // Set up typing indicator channel
  const setupTypingChannel = () => {
    if (!currentUserId || !recipientId) return;
    
    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
    }
    
    const channelName = `typing_indicator_${[currentUserId, recipientId].sort().join('_')}`;
    console.log(`Setting up typing indicator channel: ${channelName}`);
    
    typingChannelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, payload => {
        console.log("Received typing indicator:", payload);
        if (payload.typing && payload.sender_id === recipientId) {
          console.log("Setting typing indicator to true");
          setIsTyping(true);
          
          setTimeout(() => {
            console.log("Auto-clearing typing indicator");
            setIsTyping(false);
          }, 3000);
        }
      })
      .subscribe((status) => {
        console.log("Typing indicator subscription status:", status);
      });
    
    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  };

  return {
    newMessage,
    setNewMessage,
    editingMessageId,
    isTyping,
    inputRef,
    handleKeyDown,
    handleTyping,
    isWithinEditWindow,
    startEditing,
    cancelEditing,
    saveEdit,
    unsendMessage,
    sendMessage,
    setupTypingChannel
  };
}
