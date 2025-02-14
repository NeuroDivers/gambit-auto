
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
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  showPrice = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : []

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
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No options found.</CommandEmpty>
          <div className="max-h-[300px] overflow-y-auto">
            {safeOptions.map((option, index) => (
              <CommandGroup key={index}>
                <CommandItem
                  value={option.value}
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
              </CommandGroup>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
