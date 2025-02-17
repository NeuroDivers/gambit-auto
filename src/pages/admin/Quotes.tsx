
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function Quotes() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Link to="/admin/quotes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Placeholder for QuoteList component */}
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium">No quotes found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating your first quote.
        </p>
      </div>
    </div>
  )
}
