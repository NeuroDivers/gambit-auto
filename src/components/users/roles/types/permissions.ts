
import { PermissionType } from "@/types/permissions";

export type Permission = {
  id: string;
  role_id: string;
  resource_name: string;
  permission_type: PermissionType;
  is_active: boolean;
  description?: string;
};

export type GroupedPermissions = Record<string, Permission[]>;

export const groupPermissions = (permissions: Permission[]): GroupedPermissions => {
  return permissions.reduce((acc: GroupedPermissions, permission) => {
    const section = permission.resource_name;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(permission);
    return acc;
  }, {});
};

export const defaultPermissionDescriptions: Record<string, string> = {
  bookings: "Access and manage booking requests",
  vehicles: "View and manage vehicle information",
  calendar: "Access and manage the calendar view",
  payment_methods: "View and manage payment methods",
};
