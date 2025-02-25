
export interface CommissionTransaction {
  id: string
  profile_id: string
  service_id: string
  work_order_id: string
  invoice_id: string
  amount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  created_at: string
  updated_at: string
}

export interface ServiceCommission {
  id: string
  profile_id: string
  service_id: string
  rate: number
  type: 'percentage' | 'flat'
  created_at: string
  updated_at: string
}

export interface CommissionAnalytics {
  profile_id: string
  first_name: string | null
  last_name: string | null
  daily_amount: number
  weekly_amount: number
  monthly_amount: number
  day: string
}
