
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type FormNavigationProps = {
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
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={step === 1}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      
      {step < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={uploading}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
        >
          {isSubmitting ? "Submitting..." : "Submit Quote Request"}
        </Button>
      )}
    </div>
  )
}
