
import { ServiceFormData } from "@/types/service-item"

export interface FormStorage {
  step: number
  data: ServiceFormData
}

export type QuoteRequestStatus = "pending" | "estimated" | "accepted" | "rejected" | "converted"

export interface QuoteRequest {
  id: string
  client_id: string
  status: QuoteRequestStatus
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  description: string | null
  service_ids: string[]
  service_details: Record<string, any>
  created_at: string
}
