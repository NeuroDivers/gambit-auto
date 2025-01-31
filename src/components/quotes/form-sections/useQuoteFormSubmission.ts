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
      if (initialData) {
        await updateQuote(initialData.id, data, mediaUrl)
      } else {
        await createQuote(data, mediaUrl)
      }
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return { handleSubmit }
}