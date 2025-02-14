
import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Option = {
  value: string
  label: string
  disabled?: boolean
  price?: number | null
}

export interface GroupedOption {
  label: string
  options: Option[]
}

interface SearchableSelectProps {
  options: (Option | GroupedOption)[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  showPrice?: boolean
}

export function SearchableSelect({
  options = [],
  value = '',
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  showPrice = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)

  const isGrouped = (option: Option | GroupedOption): option is GroupedOption => {
    return 'options' in option && Array.isArray((option as GroupedOption).options);
  };

  const findSelectedOption = (value: string): Option | undefined => {
    for (const option of options) {
      if (isGrouped(option)) {
        const found = option.options.find(opt => opt.value === value);
        if (found) return found;
      } else if (option.value === value) {
        return option;
      }
    }
    return undefined;
  };

  const selectedOption = findSelectedOption(value);

  if (disabled) {
    return (
      <Button
        variant="outline"
        className={cn("w-full justify-between", className)}
        disabled
      >
        <span className="truncate">Loading...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {options.map((item, index) => {
            if (isGrouped(item)) {
              return (
                <CommandGroup key={index} heading={item.label}>
                  {item.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                      disabled={option.disabled}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>{option.label}</span>
                        </div>
                        {showPrice && option.price !== null && option.price !== undefined && (
                          <span className="text-muted-foreground">
                            ${option.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            }

            return (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onValueChange(item.value);
                  setOpen(false);
                }}
                disabled={item.disabled}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {showPrice && item.price !== null && item.price !== undefined && (
                    <span className="text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </CommandItem>
            );
          })}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
