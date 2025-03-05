
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserFilterOption = "all" | "staff" | "customers";

interface ChatUserFilterProps {
  currentFilter: UserFilterOption;
  onFilterChange: (value: UserFilterOption) => void;
}

export function ChatUserFilter({ currentFilter, onFilterChange }: ChatUserFilterProps) {
  return (
    <div className="w-full">
      <Select value={currentFilter} onValueChange={(value) => onFilterChange(value as UserFilterOption)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter conversations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Conversations</SelectItem>
          <SelectItem value="staff">Staff Only</SelectItem>
          <SelectItem value="customers">Customers Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
