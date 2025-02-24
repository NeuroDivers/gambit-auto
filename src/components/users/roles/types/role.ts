
export interface Role {
  id: string;
  name: string;
  nicename: string;
  description: string | null;
  can_be_assigned_to_bay: boolean;
  default_dashboard: "admin" | "staff" | "client";
}
