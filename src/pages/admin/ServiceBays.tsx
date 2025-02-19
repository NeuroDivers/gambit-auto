
import { useState } from "react"
import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList"
import { toast } from "sonner"

export default function ServiceBays() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Bays</h1>
      </div>

      <ServiceBaysList />
    </div>
  )
}
