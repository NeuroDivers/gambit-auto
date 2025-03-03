
import { supabase } from "@/integrations/supabase/client"

type AddHistoryParams = {
  customerId: string
  eventType: 'invoice' | 'quote' | 'work_order' | 'note' | 'contact' | 'other'
  description: string
  amount?: number
  relatedEntityId?: string
  relatedEntityType?: string
  createdBy?: string
}

export async function addCustomerHistoryEntry({
  customerId,
  eventType,
  description,
  amount = null,
  relatedEntityId = null,
  relatedEntityType = null,
  createdBy = null
}: AddHistoryParams) {
  try {
    const { data, error } = await supabase
      .from('customer_history')
      .insert({
        customer_id: customerId,
        event_type: eventType,
        description,
        amount,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        created_by: createdBy
      })
      .select()

    if (error) {
      console.error("Error adding customer history entry:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to add customer history entry:", error)
    throw error
  }
}

export async function updateCustomerMonthlySpending(
  customerId: string, 
  amount: number,
  month: string,
  year: number
) {
  try {
    // First try to update existing record
    const { data: existingData, error: fetchError } = await supabase
      .from('customer_monthly_spending')
      .select('*')
      .eq('customer_id', customerId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching customer monthly spending:", fetchError)
      throw fetchError
    }

    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('customer_monthly_spending')
        .update({ 
          amount: existingData.amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)

      if (updateError) {
        console.error("Error updating customer monthly spending:", updateError)
        throw updateError
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('customer_monthly_spending')
        .insert({
          customer_id: customerId,
          month,
          year,
          amount
        })

      if (insertError) {
        console.error("Error inserting customer monthly spending:", insertError)
        throw insertError
      }
    }

    return true
  } catch (error) {
    console.error("Failed to update customer monthly spending:", error)
    throw error
  }
}
