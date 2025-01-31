import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const removeOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "relative w-full cursor-pointer rounded-md border border-white/10 bg-[#242424] px-3 py-2 text-left text-white/[0.87]",
          isOpen && "ring-2 ring-ring ring-offset-2 ring-offset-background"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-1 text-sm"
              >
                {option?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => removeOption(e, value)}
                />
              </span>
            );
          })}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-[#242424] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative cursor-pointer select-none py-2 pl-10 pr-4 text-white/[0.87]",
                "hover:bg-accent hover:text-accent-foreground",
                selected.includes(option.value) && "bg-accent"
              )}
              onClick={() => toggleOption(option.value)}
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 flex items-center pl-3",
                  selected.includes(option.value)
                    ? "text-primary"
                    : "text-transparent"
                )}
              >
                <Check className="h-4 w-4" />
              </span>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}