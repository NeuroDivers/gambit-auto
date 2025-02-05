import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

type CustomerInfoFieldsProps = {
  form: UseFormReturn<any>
}

export function CustomerInfoFields({ form }: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customer_first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customer_first_name">First Name</FormLabel>
              <FormControl>
                <Input 
                  id="customer_first_name"
                  placeholder="Enter first name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customer_last_name">Last Name</FormLabel>
              <FormControl>
                <Input 
                  id="customer_last_name"
                  placeholder="Enter last name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customer_email">Email</FormLabel>
              <FormControl>
                <Input 
                  id="customer_email"
                  type="email" 
                  placeholder="Enter email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="customer_phone">Phone</FormLabel>
              <FormControl>
                <Input 
                  id="customer_phone"
                  placeholder="Enter phone number" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="customer_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="customer_address">Address</FormLabel>
            <FormControl>
              <Input 
                id="customer_address"
                placeholder="Enter address" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}