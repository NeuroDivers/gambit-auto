
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

export type ServiceStatusFilter = 'all' | 'active' | 'inactive';
export type ServiceTypeFilter = 'all' | 'standalone' | 'bundle' | 'sub_service';

export default function ServiceTypes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ServiceTypeFilter>('all');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold">Service Types</h1>
              <div className="flex gap-4 items-center">
                <Input
                  type="search"
                  placeholder="Search service types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 border-input max-w-md"
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
                      onCheckedChange={() => setStatusFilter('all')}
                    >
                      All Statuses
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'active'}
                      onCheckedChange={() => setStatusFilter('active')}
                    >
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === 'inactive'}
                      onCheckedChange={() => setStatusFilter('inactive')}
                    >
                      Inactive
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={typeFilter === 'all'}
                      onCheckedChange={() => setTypeFilter('all')}
                    >
                      All Types
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={typeFilter === 'standalone'}
                      onCheckedChange={() => setTypeFilter('standalone')}
                    >
                      Standalone Services
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={typeFilter === 'bundle'}
                      onCheckedChange={() => setTypeFilter('bundle')}
                    >
                      Service Bundles
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={typeFilter === 'sub_service'}
                      onCheckedChange={() => setTypeFilter('sub_service')}
                    >
                      Sub Services
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <ServiceTypesList 
            searchQuery={searchQuery} 
            statusFilter={statusFilter} 
            typeFilter={typeFilter}
          />
        </div>
      </div>
    </div>
  );
}
