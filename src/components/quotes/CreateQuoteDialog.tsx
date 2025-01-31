import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { QuoteRequestForm } from "./QuoteRequestForm"

export function CreateQuoteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Quote Request</DialogTitle>
        </DialogHeader>
        <QuoteRequestForm />
      </DialogContent>
    </Dialog>
  )
}