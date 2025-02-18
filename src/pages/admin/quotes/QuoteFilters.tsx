
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuoteFiltersProps {
  activeTab: string
  searchTerm: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function QuoteFilters({
  activeTab,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange
}: QuoteFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Input
          placeholder={`Search ${activeTab === 'quotes' ? 'quotes' : 'requests'}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {activeTab === 'quotes' ? (
            <>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="estimated">Estimated</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
