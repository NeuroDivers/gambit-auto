
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StaffDetails } from "./types/staff"

const staffFormSchema = z.object({
  position: z.string().optional(),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  status: z.string(),
  is_full_time: z.boolean(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  employment_date: z.string().optional(),
})

type StaffFormValues = z.infer<typeof staffFormSchema>

interface StaffDetailsFormProps {
  staffDetails: StaffDetails | null
  staffId: string
  onSuccess?: () => void
}

export function StaffDetailsForm({ staffDetails, staffId, onSuccess }: StaffDetailsFormProps) {
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      position: "",
      department: "",
      employee_id: "",
      status: "active",
      is_full_time: true,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      employment_date: "",
    },
  })
  
  useEffect(() => {
    if (staffDetails) {
      form.reset({
        position: staffDetails.position || "",
        department: staffDetails.department || "",
        employee_id: staffDetails.employee_id || "",
        status: staffDetails.status || "active",
        is_full_time: staffDetails.is_full_time || true,
        emergency_contact_name: staffDetails.emergency_contact_name || "",
        emergency_contact_phone: staffDetails.emergency_contact_phone || "",
        employment_date: staffDetails.employment_date ? new Date(staffDetails.employment_date).toISOString().split('T')[0] : "",
      })
    }
  }, [staffDetails, form])

  const onSubmit = async (data: StaffFormValues) => {
    try {
      const { error } = await supabase
        .from("staff")
        .update({
          position: data.position,
          department: data.department,
          employee_id: data.employee_id,
          status: data.status,
          is_full_time: data.is_full_time,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          employment_date: data.employment_date || null,
        })
        .eq("id", staffId)

      if (error) throw error

      toast("Staff details updated", {
        description: "The staff details have been updated successfully"
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error updating staff details:", error)
      toast("Error", {
        description: error.message || "Failed to update staff details",
        style: { backgroundColor: 'red', color: 'white' }
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Senior Technician" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Service" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. EMP-12345" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_full_time"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Full Time</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Details
          </Button>
        </div>
      </form>
    </Form>
  )
}
