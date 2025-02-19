
export interface AuthFormData {
  email: string;
  password: string;
}

export interface RoleData {
  id: string;
  first_name: string | null;
  role: {
    id: string;
    name: string;
    nicename: string;
  };
}
