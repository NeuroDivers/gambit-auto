
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAssignableProfiles } from "@/components/service-bays/hooks/useAssignableProfiles"

interface CommissionsSectionProps {
  invoiceId: string
  items: {
    id: string
    service_name: string
    commission_rate: number | null
    commission_type: 'percentage' | 'flat' | null
    quantity: number
    unit_price: number
    assigned_profile_id: string | null
  }[]
}

export function CommissionsSection({ invoiceId, items }: CommissionsSectionProps) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const { profiles } = useAssignableProfiles()

  const handleUpdateCommission = async (
    itemId: string, 
    updates: {
      commission_rate?: number | null
      commission_type?: 'percentage' | 'flat' | null
      assigned_profile_id?: string | null
    }
  ) => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('invoice_items')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Commission updated successfully')
    } catch (error) {
      console.error('Error updating commission:', error)
      toast.error('Failed to update commission')
    } finally {
      setSaving(false)
    }
  }

  const calculateCommissionAmount = (
    rate: number | null, 
    type: 'percentage' | 'flat' | null,
    quantity: number,
    unitPrice: number
  ) => {
    if (!rate) return 0
    if (type === 'percentage') {
      return (quantity * unitPrice * rate) / 100
    }
    return rate
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Commissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{item.service_name}</h4>
                <div className="text-sm text-muted-foreground">
                  Total: ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`assignee-${item.id}`}>Assign To</Label>
                  <Select
                    value={item.assigned_profile_id || ''}
                    onValueChange={(value) => 
                      handleUpdateCommission(item.id, {
                        assigned_profile_id: value || null
                      })
                    }
                  >
                    <SelectTrigger id={`assignee-${item.id}`}>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.first_name} {profile.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rate-${item.id}`}>Commission Rate</Label>
                  <Input
                    id={`rate-${item.id}`}
                    type="number"
                    placeholder="Enter rate"
                    value={item.commission_rate || ''}
                    onChange={(e) => {
                      const newRate = e.target.value ? parseFloat(e.target.value) : null
                      handleUpdateCommission(item.id, {
                        commission_rate: newRate
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`type-${item.id}`}>Commission Type</Label>
                  <Select
                    value={item.commission_type || ''}
                    onValueChange={(value) => 
                      handleUpdateCommission(item.id, {
                        commission_type: value as 'percentage' | 'flat'
                      })
                    }
                  >
                    <SelectTrigger id={`type-${item.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 text-sm">
                Estimated Commission: $
                {calculateCommissionAmount(
                  item.commission_rate,
                  item.commission_type,
                  item.quantity,
                  item.unit_price
                ).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
