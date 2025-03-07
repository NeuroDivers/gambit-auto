
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { RoleFormValues } from "./RoleFormSchema"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface RoleFormProps {
  form: UseFormReturn<RoleFormValues>
  onSubmit: (values: RoleFormValues) => void
  onCancel: () => void
  mode: 'create' | 'edit'
  roleId?: string
}

const PROTECTED_ROLE_IDS = [
  '816fe283-1aef-4294-b3cb-264347852e95', // Administrator
  '73a06339-6dd6-4da7-ac27-db9e160c2ff6'  // Client
];

export function RoleForm({ form, onSubmit, onCancel, mode, roleId }: RoleFormProps) {
  const isProtectedRole = roleId && PROTECTED_ROLE_IDS.includes(roleId);

  const handleSubmit = (values: RoleFormValues) => {
    if (isProtectedRole) {
      const originalName = form.getValues().name;
      onSubmit({ ...values, name: originalName });
    } else {
      onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {isProtectedRole && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a system role. Some fields cannot be modified to ensure system stability.
            </AlertDescription>
          </Alert>
        )}
        
        {!isProtectedRole && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="admin" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Internal name used by the system (lowercase, no spaces)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="nicename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Administrator" {...field} />
              </FormControl>
              <FormDescription>
                User-friendly name displayed in the interface
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Role description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_dashboard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Dashboard</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default dashboard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin Dashboard</SelectItem>
                  <SelectItem value="staff">Staff Dashboard</SelectItem>
                  <SelectItem value="client">Client Dashboard</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The dashboard users with this role will see after logging in
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create Role' : 'Update Role'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
