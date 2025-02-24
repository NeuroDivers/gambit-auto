
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

interface WorkOrderPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function WorkOrderPagination({
  page,
  totalPages,
  onPageChange
}: WorkOrderPaginationProps) {
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage)
    
    // For mobile, find the work orders section and scroll it into view
    const workOrdersSection = document.querySelector('.space-y-4') // This targets the work orders container
    if (workOrdersSection) {
      workOrdersSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      // Fallback to window scroll if section not found
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  )
}
