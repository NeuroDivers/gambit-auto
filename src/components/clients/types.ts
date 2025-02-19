
export type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string | null
  address?: string | null
  created_at: string
  updated_at: string
  user_id?: string | null
  access_token?: string | null
}

export type ClientFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}
