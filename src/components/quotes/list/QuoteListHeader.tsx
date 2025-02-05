import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type QuoteListHeaderProps = {
  onCreateClick: () => void
}

export function QuoteListHeader({ onCreateClick }: QuoteListHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Quotes</h2>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        New Quote
      </Button>
    </div>
  )
}