
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScannerFeedbackProps {
  detectedText: string
  isProcessing: boolean
  error?: string
}

export function ScannerFeedback({ detectedText, isProcessing, error }: ScannerFeedbackProps) {
  const charCount = detectedText.length
  const isValidLength = charCount === 17

  return (
    <div className="space-y-2 p-4">
      {error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : detectedText ? (
        <Alert variant={isValidLength ? "default" : "warning"} className="py-2">
          {isValidLength ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {isValidLength 
              ? "Valid length detected, verifying..." 
              : `Character count: ${charCount}/17`
            }
          </AlertDescription>
        </Alert>
      ) : null}
      
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing scan...</span>
        </div>
      )}
    </div>
  )
}
