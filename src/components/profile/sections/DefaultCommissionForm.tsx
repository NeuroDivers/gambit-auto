
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { CommissionRateFields } from "@/components/shared/form-fields/CommissionRateFields"

type FormValues = {
  default_rate: number | null
  type: 'percentage' | 'flat'
}

export function DefaultCommissionForm({ profileId }: { profileId: string }) {
  const form = useForm<FormValues>()

  const { data: currentRate, isLoading } = useQuery({
    queryKey: ['user-commission-rate', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_commission_rates')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  useEffect(() => {
    if (currentRate) {
      form.reset({
        default_rate: currentRate.default_rate,
        type: currentRate.type as 'percentage' | 'flat'
      })
    }
  }, [currentRate, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase
        .from('user_commission_rates')
        .upsert({
          profile_id: profileId,
          default_rate: values.default_rate,
          type: values.type
        })

      if (error) throw error
      toast.success("Default commission rate updated")
    } catch (error) {
      console.error('Error updating commission rate:', error)
      toast.error("Failed to update commission rate")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CommissionRateFields 
          form={form} 
          namePrefix="default_"
          label="Default Commission Rate"
        />
        <Button type="submit">Save Default Rate</Button>
      </form>
    </Form>
  )
}
