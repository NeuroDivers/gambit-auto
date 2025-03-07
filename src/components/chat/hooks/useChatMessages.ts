
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ChatUser } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useChatMessages(recipientId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<ChatUser | null>(null);
  const channelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const isActiveConversation = useRef<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    isActiveConversation.current = true;
    console.log("Chat window mounted, setting active conversation to true");
    
    return () => {
      isActiveConversation.current = false;
      console.log("Chat window unmounted, setting active conversation to false");
    };
  }, []);

  useEffect(() => {
    isActiveConversation.current = true;
    console.log("Recipient changed, setting active conversation to true for:", recipientId);
  }, [recipientId]);

  const scrollToBottom = (immediate = false) => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: immediate ? 'auto' : 'smooth'
          });
        }
      }, immediate ? 0 : 100);
    }
  };

  const scrollToFirstUnread = () => {
    if (firstUnreadRef.current) {
      firstUnreadRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchMessages = async () => {
    if (!currentUserId || !recipientId) return;
    
    console.log("Fetching messages between current user and recipient:", currentUserId, recipientId);
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    console.log("Fetched messages:", messages);
    setMessages(messages);

    const unreadMessages = messages.filter(m => 
      m.sender_id === recipientId && 
      m.recipient_id === currentUserId && 
      !m.read
    );

    if (unreadMessages.length > 0) {
      const { error: updateError } = await supabase
        .from("chat_messages")
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(m => m.id));

      if (updateError) {
        console.error("Error marking messages as read:", updateError);
      }

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("profile_id", currentUserId)
        .eq("sender_id", recipientId)
        .eq("type", 'chat_message');

      setTimeout(() => {
        scrollToFirstUnread();
      }, 100);
    } else {
      scrollToBottom(true);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Current user ID:", user.id);
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId || !recipientId) return;

    const fetchRecipient = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(id, name, nicename), avatar_url")
        .eq("id", recipientId)
        .single();

      if (error) {
        console.error("Error fetching recipient:", error);
        return;
      }

      const recipientData = {
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role
      } as ChatUser;

      setRecipient(recipientData);
    };

    fetchMessages();
    fetchRecipient();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`chat_messages_${currentUserId}_${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `recipient_id=eq.${currentUserId}`
        },
        async (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as ChatMessage;
          
          if (newMessage.sender_id === recipientId) {
            console.log("Adding new message to chat");
            setMessages((current) => [...current, newMessage]);
            
            const { error: updateError } = await supabase
              .from("chat_messages")
              .update({ read: true, read_at: new Date().toISOString() })
              .eq('id', newMessage.id);

            if (updateError) {
              console.error("Error marking message as read:", updateError);
            }

            const isDocumentVisible = document.visibilityState === "visible";
            
            if (!isActiveConversation.current || !isDocumentVisible) {
              console.log(`Showing toast notification - Active conversation: ${isActiveConversation.current}, Document visible: ${isDocumentVisible}`);
              toast({
                title: `${recipient?.first_name || 'New Message'}`,
                description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
                duration: 5000,
              });
            } else {
              console.log(`Not showing toast - Active conversation: ${isActiveConversation.current}, Document visible: ${isDocumentVisible}`);
            }
            
            scrollToBottom();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          console.log("Message updated:", payload);
          const updatedMessage = payload.new as ChatMessage;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages"
        },
        (payload) => {
          console.log("Message deleted:", payload);
          const deletedMessageId = payload.old.id;
          
          setMessages(prev => 
            prev.filter(msg => msg.id !== deletedMessageId)
          );
        }
      )
      .subscribe((status) => {
        console.log("Chat subscription status:", status);
      });

    const handleVisibilityChange = () => {
      console.log("Document visibility changed:", document.visibilityState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up chat subscription");
        supabase.removeChannel(channelRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [recipientId, currentUserId, recipient?.first_name, toast]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);
  
  return {
    messages,
    setMessages,
    messagesEndRef,
    firstUnreadRef,
    currentUserId,
    recipient,
    scrollToBottom
  };
}
