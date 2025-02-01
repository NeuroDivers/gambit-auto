import { useToast } from "@/hooks/use-toast"
import type { QuoteRequestFormValues } from "../QuoteRequestFormFields"
import { useQuoteCreate } from "./useQuoteCreate"
import { useQuoteUpdate } from "./useQuoteUpdate"

type UseQuoteFormSubmissionProps = {
  initialData?: {
    id: string
    media_url?: string | null
  }
  mediaUrl: string | null
  onSuccess?: () => void
}

export function useQuoteFormSubmission({ 
  initialData, 
  mediaUrl,
  onSuccess 
}: UseQuoteFormSubmissionProps) {
  const { toast } = useToast()
  const { createQuote } = useQuoteCreate()
  const { updateQuote } = useQuoteUpdate()

  const handleSubmit = async (data: QuoteRequestFormValues) => {
    try {
      if (initialData?.id) {
        await updateQuote(initialData.id, data, mediaUrl)
      } else {
        const newQuote = await createQuote(data, mediaUrl)
        if (!newQuote?.id) {
          throw new Error("Failed to create quote request")
        }
      }
      onSuccess?.()
    } catch (error: any) {
      console.error("Error submitting quote request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote request",
        variant: "destructive",
      })
    }
  }

  return { handleSubmit }
}