
export type PermissionType = 'page_access' | 'feature_access';

export interface RolePermission {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: PermissionType;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}
