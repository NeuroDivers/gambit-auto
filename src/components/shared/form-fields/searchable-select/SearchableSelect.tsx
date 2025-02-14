
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type Option = {
  value: string
  label: string
  price?: number | null
  disabled?: boolean
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  showPrice?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  showPrice = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)

  // Ensure options is always an array and filter out any invalid options
  const safeOptions = (options || []).filter((option): option is Option => 
    option && 
    typeof option === 'object' && 
    'value' in option && 
    'label' in option
  )

  const selectedOption = safeOptions.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={true} className="max-h-[300px] overflow-hidden">
          <CommandInput placeholder={placeholder} />
          <div className="overflow-y-auto max-h-[200px]">
            {safeOptions.length === 0 ? (
              <CommandEmpty>No options found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {safeOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    disabled={option.disabled}
                    className={cn(
                      "flex items-center justify-between",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </div>
                    {showPrice && option.price !== null && option.price !== undefined && (
                      <span className="text-muted-foreground">
                        ${option.price.toFixed(2)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
