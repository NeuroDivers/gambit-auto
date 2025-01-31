import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { QuoteRequestForm } from "./QuoteRequestForm"

type QuoteRequest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  media_url?: string
  status: string
  created_at: string
  quote_request_services: {
    service_types: {
      name: string
    }
  }[]
}

type EditQuoteDialogProps = {
  quote: QuoteRequest
}

export function EditQuoteDialog({ quote }: EditQuoteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Quote Request</DialogTitle>
        </DialogHeader>
        <QuoteRequestForm initialData={quote} />
      </DialogContent>
    </Dialog>
  )
}