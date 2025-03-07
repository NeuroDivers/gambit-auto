
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface StaffDetailsFormProps {
  profileId: string;
  onSaved: () => void;
  role: any;
  initialData?: any;
}

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  street_address: z.string().optional(),
  unit_number: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

export function StaffDetailsForm({ profileId, onSaved, role, initialData }: StaffDetailsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      bio: initialData?.bio || "",
      street_address: initialData?.street_address || "",
      unit_number: initialData?.unit_number || "",
      city: initialData?.city || "",
      state_province: initialData?.state_province || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Update profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          bio: values.bio,
          street_address: values.street_address,
          unit_number: values.unit_number,
          city: values.city,
          state_province: values.state_province,
          postal_code: values.postal_code,
          country: values.country,
        })
        .eq("id", profileId);

      if (error) throw error;

      // Also update staff table if it exists
      const { error: staffError } = await supabase
        .from("staff")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          bio: values.bio,
          street_address: values.street_address,
          unit_number: values.unit_number,
          city: values.city,
          state_province: values.state_province,
          postal_code: values.postal_code,
          country: values.country,
        })
        .eq("profile_id", profileId);

      // If error is "relation staff does not exist", ignore it
      if (staffError && !staffError.message.includes("relation") && !staffError.message.includes("does not exist")) {
        throw staffError;
      }

      toast.success("Staff profile updated successfully");
      onSaved();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast.error("Failed to update staff profile");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Phone Number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Bio" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Address Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="unit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Unit/Apt #" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state_province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State/Province" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
