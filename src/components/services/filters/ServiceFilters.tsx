
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceStatusFilter, ServiceTypeFilter } from "@/types/service-types";

interface ServiceFiltersProps {
  searchQuery: string;
  statusFilter: ServiceStatusFilter;
  typeFilter: ServiceTypeFilter;
  onSearch: (value: string) => void;
  onStatusFilter: (value: ServiceStatusFilter) => void;
  onTypeFilter: (value: ServiceTypeFilter) => void;
}

export const ServiceFilters = ({
  searchQuery,
  statusFilter,
  typeFilter,
  onSearch,
  onStatusFilter,
  onTypeFilter,
}: ServiceFiltersProps) => {
  return (
    <div className="flex gap-2 items-center w-full sm:w-auto">
      <Input
        type="search"
        placeholder="Search service types..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="bg-background/50 border-input flex-1 sm:max-w-[300px]"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Filter className="h-4 w-4" />
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'all'}
            onCheckedChange={() => onStatusFilter('all')}
          >
            All Statuses
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'active'}
            onCheckedChange={() => onStatusFilter('active')}
          >
            Active
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'inactive'}
            onCheckedChange={() => onStatusFilter('inactive')}
          >
            Inactive
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={typeFilter === 'all'}
            onCheckedChange={() => onTypeFilter('all')}
          >
            All Types
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={typeFilter === 'standalone'}
            onCheckedChange={() => onTypeFilter('standalone')}
          >
            Standalone Services
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={typeFilter === 'bundle'}
            onCheckedChange={() => onTypeFilter('bundle')}
          >
            Service Bundles
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={typeFilter === 'sub_service'}
            onCheckedChange={() => onTypeFilter('sub_service')}
          >
            Sub Services
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
