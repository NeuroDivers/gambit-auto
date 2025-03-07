
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
    bio: string | null
    unit_number: string | null
    street_address: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    country: string | null
    role_id: string
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
    bio?: string | null
    unit_number?: string | null
    street_address?: string | null
    city?: string | null
    state_province?: string | null
    postal_code?: string | null
    country?: string | null
    role_id: string
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
    bio?: string | null
    unit_number?: string | null
    street_address?: string | null
    city?: string | null
    state_province?: string | null
    postal_code?: string | null
    country?: string | null
    role_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "profiles_role_id_fkey"
      columns: ["role_id"]
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
  ]
}
