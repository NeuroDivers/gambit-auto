
import { Json } from './json';
import { Database } from './database';

// This interface now represents the roles table instead of user_roles
export interface RolesTable {
  Row: {
    id: string
    name: string
    nicename: string
    description: string | null
    can_be_assigned_to_bay: boolean
    created_at: string
    permissions_configured: boolean
    updated_at: string
  }
  Insert: {
    id?: string
    name: string
    nicename: string
    description?: string | null
    can_be_assigned_to_bay?: boolean
    created_at?: string
    permissions_configured?: boolean
    updated_at?: string
  }
  Update: {
    id?: string
    name?: string
    nicename?: string
    description?: string | null
    can_be_assigned_to_bay?: boolean
    created_at?: string
    permissions_configured?: boolean
    updated_at?: string
  }
  Relationships: []
}
