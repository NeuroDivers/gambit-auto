
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
      <div className="container mx-auto py-6 sm:py-12 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <PageBreadcrumbs />
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Service Types</h1>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <ServiceTypesList 
            searchQuery={searchQuery} 
            statusFilter={statusFilter} 
            typeFilter={typeFilter}
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onTypeFilter={setTypeFilter}
          />
        </div>
      </div>
    </div>
  );
}
