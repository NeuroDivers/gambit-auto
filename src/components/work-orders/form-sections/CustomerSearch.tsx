import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { CustomerType, WorkOrderFormValues } from "../types";
import { CustomerForm } from "./CustomerForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerSearchProps {
  form: any;
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .ilike("first_name", `%${inputValue}%`);

        if (error) {
          console.error("Error fetching customers:", error);
          toast({
            title: "Error",
            description: "Failed to fetch customers",
            variant: "destructive",
          });
          return;
        }

        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        });
      }
    };

    fetchCustomers();
  }, [inputValue, toast]);

  const handleSelect = (customer: CustomerType) => {
    form.setValue("first_name", customer.first_name);
    form.setValue("last_name", customer.last_name);
    form.setValue("email", customer.email);
    form.setValue("phone_number", customer.phone_number || "");
    form.setValue("client_id", customer.id);
    form.setValue("street_address", customer.street_address || '');
    form.setValue("unit_number", customer.unit_number || '');
    form.setValue("city", customer.city || '');
    form.setValue("state_province", customer.state_province || '');
    form.setValue("postal_code", customer.postal_code || '');
    form.setValue("country", customer.country || '');
    form.setValue("vehicle_make", customer?.vehicles?.[0]?.make || '');
    form.setValue("vehicle_model", customer?.vehicles?.[0]?.model || '');
    form.setValue("vehicle_year", customer?.vehicles?.[0]?.year || 0);
    form.setValue("vehicle_serial", customer?.vehicles?.[0]?.vin || '');
    form.setValue("vehicle_trim", customer?.vehicles?.[0]?.trim || '');
    form.setValue("vehicle_body_class", customer?.vehicles?.[0]?.body_class || '');
    form.setValue("vehicle_doors", customer?.vehicles?.[0]?.doors || 0);
    setSelectedCustomerId(customer.id);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          Search for an existing customer or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-[1fr_110px] gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedCustomerId
                  ? customers.find((customer) => customer.id === selectedCustomerId)?.first_name + ' ' + customers.find((customer) => customer.id === selectedCustomerId)?.last_name
                  : "Select Customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search customer..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={`${customer.first_name} ${customer.last_name}`}
                        onSelect={() => handleSelect(customer)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {customer.first_name} {customer.last_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => setIsCustomerFormOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Customer
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              type="text"
              id="first_name"
              placeholder="First Name"
              {...form.register("first_name")}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              type="text"
              id="last_name"
              placeholder="Last Name"
              {...form.register("last_name")}
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              {...form.register("email")}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              type="tel"
              id="phone_number"
              placeholder="Phone Number"
              {...form.register("phone_number")}
              disabled
            />
          </div>
        </div>
      </CardContent>

      {/* Customer Form Modal */}
      {isCustomerFormOpen && (
        <CustomerForm
          open={isCustomerFormOpen}
          onOpenChange={setIsCustomerFormOpen}
          onCustomerCreated={(customer: CustomerType) => {
            setCustomers((prevCustomers) => [...prevCustomers, customer]);
            handleSelect(customer);
          }}
        />
      )}
    </Card>
  );
}
