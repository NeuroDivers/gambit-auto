
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type RoleFormValues } from "./RoleFormSchema";
import { type UseFormReturn } from "react-hook-form";

interface RoleFormProps {
  form: UseFormReturn<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const RoleForm = ({ form, onSubmit, onCancel, mode }: RoleFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name (e.g. project_manager)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nicename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter display name (e.g. Project Manager)" {...field} />
              </FormControl>
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
                <Textarea 
                  placeholder="Enter role description"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'edit' ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
