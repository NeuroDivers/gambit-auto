
import { useState } from "react"
import { ServiceTypeDialog } from "@/components/services/ServiceTypeDialog"
import { ServiceTypeCard } from "@/components/services/ServiceTypeCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, Plus } from "lucide-react"
import { ServiceStatusFilter, ServiceTypeFilter } from "@/types/service-types"
import { supabase } from "@/integrations/supabase/client"

interface ServiceTypesListProps {
  searchQuery: string
  statusFilter: ServiceStatusFilter
  typeFilter: ServiceTypeFilter
  onSearch: (query: string) => void
  onStatusFilter: (status: ServiceStatusFilter) => void
  onTypeFilter: (type: ServiceTypeFilter) => void
}

export function ServiceTypesList({
  searchQuery,
  statusFilter,
  typeFilter,
  onSearch,
  onStatusFilter,
  onTypeFilter
}: ServiceTypesListProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<any>(null)

  const { data: serviceTypes, isLoading, refetch } = useQuery({
    queryKey: ["service-types", statusFilter, typeFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("service_types")
        .select("*")
        .order("name", { ascending: true })

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      // Apply service type filter
      if (typeFilter !== "all") {
        query = query.eq("service_type", typeFilter)
      }

      // Apply search filter if provided
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      return data || []
    }
  })

  const handleCreateClick = () => {
    setSelectedServiceType(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (serviceType: any) => {
    setSelectedServiceType(serviceType)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              value={statusFilter}
              onValueChange={(value: ServiceStatusFilter) => onStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={typeFilter}
              onValueChange={(value: ServiceTypeFilter) => onTypeFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standalone">Standalone</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
                <SelectItem value="sub_service">Sub Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : serviceTypes && serviceTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceTypes.map((serviceType) => (
            <ServiceTypeCard
              key={serviceType.id}
              serviceType={serviceType}
              onEdit={() => handleEditClick(serviceType)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No service types found. Create one to get started.</p>
        </div>
      )}

      <ServiceTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        serviceType={selectedServiceType}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
