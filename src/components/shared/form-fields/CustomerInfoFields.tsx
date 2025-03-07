import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerStreetAddress?: string;
  setCustomerStreetAddress?: (value: string) => void;
  clearSelectedCustomer?: () => void;
  onCustomerSelect: (customerId: string) => void;
  customers?: any[];
}

export function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerStreetAddress,
  setCustomerStreetAddress,
  clearSelectedCustomer,
  onCustomerSelect,
  customers = [],
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="customer-search">Find Customer</Label>
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {searchValue || 'Search customers...'}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search by name, email, or phone..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No customers found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => handleCustomerSelect(customer.id)}
                      >
                        <div className="flex flex-col">
                          <span>
                            {customer.first_name} {customer.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {customer.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-first-name">First Name</Label>
          <div className="relative">
            <Input
              id="customer-first-name"
              placeholder="First name"
              value={customerFirstName}
              onChange={(e) => setCustomerFirstName(e.target.value)}
              className={cn(
                clearSelectedCustomer && customerFirstName
                  ? 'pr-8'
                  : ''
              )}
            />
            {clearSelectedCustomer && customerFirstName && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-0 text-muted-foreground hover:text-foreground"
                onClick={clearSelectedCustomer}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear selection</span>
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-last-name">Last Name</Label>
          <Input
            id="customer-last-name"
            placeholder="Last name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="Email address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            type="tel"
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {setCustomerStreetAddress && (
        <div className="space-y-2">
          <Label htmlFor="customer-address">Address</Label>
          <Input
            id="customer-address"
            placeholder="Street address"
            value={customerStreetAddress || ''}
            onChange={(e) => setCustomerStreetAddress(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
