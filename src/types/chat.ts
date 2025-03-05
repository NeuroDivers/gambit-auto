
export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  read_at: string | null
  read: boolean
  created_at: string
  updated_at: string
}

export interface ChatRole {
  id: string
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
}
