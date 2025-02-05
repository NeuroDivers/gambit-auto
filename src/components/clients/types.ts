export type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string | null
  address?: string | null
  created_at: string
  updated_at: string
}

export type ClientFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}