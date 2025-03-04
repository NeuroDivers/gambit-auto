
export type PermissionType = 'page_access' | 'feature_access';

export interface Permission {
  resource: string;
  type: PermissionType;
}

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

// Define permission groups for organization
export interface PermissionGroup {
  name: string;
  resources: string[];
}

// Define groups for page access
export const pageAccessGroups: PermissionGroup[] = [
  {
    name: "Dashboard",
    resources: ["dashboard"]
  },
  {
    name: "Operations",
    resources: ["work_orders", "service_bays", "calendar", "staff_skills"]
  },
  {
    name: "Sales",
    resources: ["quotes", "invoices", "commissions"]
  },
  {
    name: "Customers",
    resources: ["clients", "vehicles", "bookings"]
  },
  {
    name: "Administration",
    resources: ["users", "system_roles", "service_types", "business_settings", "developer_settings"]
  },
  {
    name: "Communication",
    resources: ["chat"]
  }
];

// Define groups for feature access
export const featureAccessGroups: PermissionGroup[] = [
  {
    name: "Dashboard",
    resources: ["dashboard"]
  },
  {
    name: "Operations",
    resources: ["work_orders", "service_bays", "calendar", "staff_skills"]
  },
  {
    name: "Sales",
    resources: ["quotes", "invoices", "commissions"]
  },
  {
    name: "Customers",
    resources: ["clients", "vehicles", "bookings"]
  },
  {
    name: "Administration",
    resources: ["users", "system_roles", "service_types", "business_settings", "developer_settings"]
  },
  {
    name: "Communication",
    resources: ["chat"]
  }
];
