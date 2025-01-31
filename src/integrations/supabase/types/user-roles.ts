import { Json } from './json';
import { Database } from './database';

export interface UserRolesTable {
  Row: {
    created_at: string
    id: string
    role: Database["public"]["Enums"]["app_role"]
    user_id: string
  }
  Insert: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["app_role"]
    user_id: string
  }
  Update: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["app_role"]
    user_id?: string
  }
  Relationships: []
}