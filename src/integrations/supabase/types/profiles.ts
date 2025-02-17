
import { Json } from './json';

export interface ProfilesTable {
  Row: {
    created_at: string
    email: string | null
    first_name: string | null
    id: string
    last_name: string | null
    updated_at: string
    avatar_url: string | null
    phone_number: string | null
    address: string | null
    bio: string | null
  }
  Insert: {
    created_at?: string
    email?: string | null
    first_name?: string | null
    id: string
    last_name?: string | null
    updated_at?: string
    avatar_url?: string | null
    phone_number?: string | null
    address?: string | null
    bio?: string | null
  }
  Update: {
    created_at?: string
    email?: string | null
    first_name?: string | null
    id?: string
    last_name?: string | null
    updated_at?: string
    avatar_url?: string | null
    phone_number?: string | null
    address?: string | null
    bio?: string | null
  }
  Relationships: []
}
