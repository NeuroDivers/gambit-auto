
export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatRole {
  name: string
  nicename: string
}

export interface ChatUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  role: ChatRole | null
  last_seen_at?: string | null
  is_online?: boolean
  unread_count?: number
}

export interface ChatAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string
  created_at: string
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
