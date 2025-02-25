
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Star } from "lucide-react"

interface RatingSubmissionFormProps {
  workOrderId: string
  serviceId: string
  assignedProfileId: string
  onSuccess?: () => void
}

export function RatingSubmissionForm({ workOrderId, serviceId, assignedProfileId, onSuccess }: RatingSubmissionFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Check if user has already submitted a rating
  const { data: existingRating } = useQuery({
    queryKey: ['service-rating', workOrderId, serviceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('service_ratings')
        .select('*')
        .eq('work_order_id', workOrderId)
        .eq('service_id', serviceId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching rating:', error)
        return null
      }

      return data
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('service_ratings')
        .insert({
          work_order_id: workOrderId,
          service_id: serviceId,
          assigned_profile_id: assignedProfileId,
          rating,
          comment,
          client_id: user.id
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit rating",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (existingRating) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">You have already submitted a rating for this service.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                value <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      
      <Textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />
      
      <Button 
        type="submit" 
        disabled={rating === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  )
}
