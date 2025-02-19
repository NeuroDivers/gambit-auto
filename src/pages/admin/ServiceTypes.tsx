
import { ServiceTypeDialog } from "@/components/services/ServiceTypeDialog"
import { ServiceTypesList } from "@/components/services/ServiceTypesList"
import { toast } from "sonner"
import { useState } from "react"

export default function ServiceTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")

  const handleSuccess = () => {
    setIsDialogOpen(false)
    toast.success("Service type created successfully")
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Types</h1>
      </div>

      <ServiceTypesList 
        onSearch={setSearchQuery}
        onStatusFilter={setStatusFilter}
        onTypeFilter={setTypeFilter}
      />
      
      <ServiceTypeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
