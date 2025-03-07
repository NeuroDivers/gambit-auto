
export type Permission = {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: 'page_access' | 'feature_access';
  is_active: boolean;
  description?: string;
};

export type GroupedPermissions = Record<string, Permission[]>;

export const groupPermissions = (permissions: Permission[]): GroupedPermissions => {
  return permissions.reduce((acc: GroupedPermissions, permission) => {
    const section = permission.permission_type;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(permission);
    return acc;
  }, {});
};
