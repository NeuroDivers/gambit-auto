
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

interface FormNavigationProps {
  step: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
  uploading: boolean
}

export function FormNavigation({
  step,
  totalSteps,
  onNext,
  onPrevious,
  isSubmitting,
  uploading
}: FormNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrevious}
        disabled={step === 1 || isSubmitting || uploading}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      {step === totalSteps ? (
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Request
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || uploading}
          className="gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
