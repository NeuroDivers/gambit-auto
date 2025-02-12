
import { WorkOrderCard } from "../WorkOrderCard"
import { StatusLegend } from "../StatusLegend"
import { LoadingState } from "../LoadingState"
import { useWorkOrderData } from "../calendar/useWorkOrderData"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function WorkOrdersSection() {
  const { data: requests, isLoading } = useWorkOrderData()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter work orders based on search query and status
  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.vehicle_make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.vehicle_model?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort work orders by start_time, putting null dates at the end
  const sortedRequests = filteredRequests?.sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const statusCounts = {
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    rejected: requests?.filter(r => r.status === 'rejected').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <section 
      className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-0 relative" 
      style={{ zIndex: 0, position: 'relative' }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Work Orders</h3>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <Input
            placeholder="Search by name, email, or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <StatusLegend statusCounts={statusCounts} />
        
        {sortedRequests?.map((request) => (
          <WorkOrderCard key={request.id} request={request} />
        ))}
        
        {sortedRequests?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            {requests?.length === 0 ? "No work orders yet" : "No work orders match your search"}
          </div>
        )}
      </div>
    </section>
  )
}
