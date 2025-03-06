
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { memo } from "react"

type WorkOrderFiltersProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  assignmentFilter: string
  onAssignmentFilterChange: (value: string) => void
}

export const WorkOrderFilters = memo(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assignmentFilter,
  onAssignmentFilterChange,
}: WorkOrderFiltersProps) => {
  // Fetch service bays for filtering
  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data
    }
  })

  // Using a local handler to prevent the search input from refreshing on every keystroke
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 items-end">
      <div className="w-full sm:w-1/3">
        <Label htmlFor="search" className="mb-2 block">
          Search
        </Label>
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search work orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search by: Customer Name, Email, Phone, Vehicle Make/Model/VIN</p>
            </TooltipContent>
          </Tooltip>
          
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-8"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
      </div>

      <div className="w-full sm:w-1/4">
        <Label htmlFor="status" className="mb-2 block">
          Status
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="invoiced">Invoiced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/4">
        <Label htmlFor="assignment" className="mb-2 block">
          Service Bay
        </Label>
        <Select
          value={assignmentFilter}
          onValueChange={onAssignmentFilterChange}
        >
          <SelectTrigger id="assignment">
            <SelectValue placeholder="All Service Bays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Bays</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {serviceBays?.map((bay) => (
              <SelectItem key={bay.id} value={bay.id}>
                {bay.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

WorkOrderFilters.displayName = 'WorkOrderFilters'
