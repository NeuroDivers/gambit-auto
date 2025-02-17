
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
  options?: (Option | GroupedOption)[]
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
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  showPrice = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Ensure we have a valid array and flatten it
  const safeOptions = Array.isArray(options) ? options.reduce<Option[]>((acc, curr) => {
    if ('options' in curr && Array.isArray(curr.options)) {
      return [...acc, ...curr.options]
    }
    return [...acc, curr as Option]
  }, []) : []

  // Filter options based on input value
  const filteredOptions = !inputValue ? safeOptions : 
    safeOptions.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )

  const selectedOption = safeOptions.find(option => option.value === value)

  // Early return for loading state
  if (disabled) {
    return (
      <Button
        variant="outline"
        role="combobox"
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
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
                  setInputValue("")
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
