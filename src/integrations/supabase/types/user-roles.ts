
import { Json } from './json';
import { Database } from './database';

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
export interface ProfileWithRole extends ProfilesTable["Row"] {
  role: {
    id: string;
    name: string;
    nicename: string;
  };
}

