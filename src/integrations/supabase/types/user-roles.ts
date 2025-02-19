
import { Json } from './json';

// This interface represents the roles table
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

// Export a type for role permissions
export interface RolePermission {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: 'page_access' | 'feature_access';
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Export a type for profiles with roles
export interface ProfileWithRole {
  id: string;
  created_at: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  updated_at: string;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
  bio: string | null;
  role: {
    id: string;
    name: string;
    nicename: string;
  };
}
