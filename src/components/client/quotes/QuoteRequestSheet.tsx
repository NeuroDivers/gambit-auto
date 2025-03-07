
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { QuoteRequestForm } from "./QuoteRequestForm"
import { FormProvider, useForm } from "react-hook-form"
import { useState } from "react"

interface Props {
  onSuccess: () => void;
  quoteRequestForm: any; // This should be properly typed based on your application
}

export function QuoteRequestSheet({ onSuccess, quoteRequestForm }: Props) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request Quote</SheetTitle>
          <SheetDescription>
            Fill out the form to get a quote for your service needs.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <FormProvider {...quoteRequestForm}>
            <QuoteRequestForm onSuccess={handleSuccess} />
          </FormProvider>
        </div>
      </SheetContent>
    </Sheet>
  )
}
