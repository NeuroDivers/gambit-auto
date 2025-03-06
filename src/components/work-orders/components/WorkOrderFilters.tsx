
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WorkOrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  assignmentFilter: string
  onAssignmentFilterChange: (value: string) => void
}

export function WorkOrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assignmentFilter,
  onAssignmentFilterChange
}: WorkOrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative w-full">
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                <HelpCircle className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <p className="text-sm">
                Search by: Customer Name, Customer Email, Customer Phone, Vehicle Make, 
                Vehicle Model, or Vehicle VIN
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={assignmentFilter} onValueChange={onAssignmentFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by assignment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignments</SelectItem>
          <SelectItem value="assigned-bay">Assigned Bay</SelectItem>
          <SelectItem value="unassigned-bay">Unassigned Bay</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
