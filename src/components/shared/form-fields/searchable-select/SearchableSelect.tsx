
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

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  showPrice?: boolean
}

export function SearchableSelect({
  options,
  value = '',
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  showPrice = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  // Initialize empty arrays for both states to prevent undefined errors
  const safeOptions = Array.isArray(options) ? options : []
  const selectedOption = safeOptions.find((option) => option.value === value)

  // Early return for loading state
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
    )
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
        <Command value={search} onValueChange={setSearch}>
          <CommandInput 
            value={search}
            onValueChange={setSearch}
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {safeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
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
        </Command>
      </PopoverContent>
    </Popover>
  )
}
