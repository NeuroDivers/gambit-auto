export interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'unavailable' | 'maintenance' | 'in_use'
  created_at?: string
  updated_at?: string
}