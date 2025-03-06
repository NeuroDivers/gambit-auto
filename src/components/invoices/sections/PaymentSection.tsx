import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Invoice } from "../types"
import { CustomerInfo } from "@/types/shared-types"

type PaymentSectionProps = {
  invoice: Invoice
  customerInfo: CustomerInfo & { stripeCustomerId?: string }
  onUpdate: () => void
}

export function PaymentSection({ invoice, customerInfo, onUpdate }: PaymentSectionProps) {
  const { toast } = useToast()
  const [isFinalized, setIsFinalized] = useState(invoice.is_finalized || false)
  const [isCreatingStripeCustomer, setIsCreatingStripeCustomer] = useState(false)
  const [stripeCustomerId, setStripeCustomerId] = useState(customerInfo.stripeCustomerId || '')

  const { mutate: createStripeCustomer, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      setIsCreatingStripeCustomer(true)
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: {
          name: `${customerInfo.customer_first_name} ${customerInfo.customer_last_name}`,
          email: customerInfo.customer_email,
          phone: customerInfo.customer_phone,
        },
      })

      if (error) {
        console.error('Error creating Stripe customer:', error)
        throw new Error(error.message)
      }

      return data as { customerId: string }
    },
    onSuccess: async (data) => {
      setStripeCustomerId(data.customerId)
      toast({
        title: 'Stripe Customer Created',
        description: 'Customer created successfully in Stripe.',
      })

      // Update the customer's stripe_customer_id in your database
      const { error } = await supabase
        .from('customers')
        .update({ stripe_customer_id: data.customerId })
        .eq('email', customerInfo.customer_email)

      if (error) {
        console.error('Error updating customer with Stripe ID:', error)
        toast({
          title: 'Database Error',
          description: 'Failed to update customer with Stripe ID in the database.',
          variant: 'destructive',
        })
      } else {
        onUpdate()
      }
    },
    onError: (error: any) => {
      console.error('Error creating Stripe customer:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsCreatingStripeCustomer(false)
    },
  })

  const handleFinalizeToggle = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ is_finalized: !isFinalized })
        .eq('id', invoice.id)

      if (error) {
        console.error('Error updating invoice:', error)
        toast({
          title: 'Error',
          description: 'Failed to update invoice.',
          variant: 'destructive',
        })
      } else {
        setIsFinalized(!isFinalized)
        toast({
          title: 'Invoice Updated',
          description: 'Invoice finalized status updated successfully.',
        })
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating invoice:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stripe-customer-id">Stripe Customer ID</Label>
            <Input
              type="text"
              id="stripe-customer-id"
              value={stripeCustomerId}
              disabled
            />
            {!stripeCustomerId && (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => createStripeCustomer()}
                disabled={isCreating || isCreatingStripeCustomer}
              >
                {isCreating || isCreatingStripeCustomer ? 'Creating...' : 'Create Stripe Customer'}
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="is-finalized" className="flex items-center space-x-2">
            <Checkbox
              id="is-finalized"
              checked={isFinalized}
              onCheckedChange={handleFinalizeToggle}
            />
            <span>Mark as Finalized</span>
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
