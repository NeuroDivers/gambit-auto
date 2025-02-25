
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ServiceItem {
  id: string
  service_id: string
  service_name: string
  assigned_profile_id?: string
}

interface RatingSubmissionFormProps {
  workOrderId: string
  serviceItems: ServiceItem[]
  onSuccess?: () => void
}

interface ServiceRating {
  rating: number
  comment: string
}

export function RatingSubmissionForm({ workOrderId, serviceItems, onSuccess }: RatingSubmissionFormProps) {
  const [ratings, setRatings] = useState<Record<string, ServiceRating>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Check for existing ratings
  const { data: existingRatings } = useQuery({
    queryKey: ['service-ratings', workOrderId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('service_ratings')
        .select('*')
        .eq('work_order_id', workOrderId)
        .eq('client_id', user.id)

      if (error) {
        console.error('Error fetching ratings:', error)
        return null
      }

      return data
    }
  })

  const setServiceRating = (serviceId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], rating }
    }))
  }

  const setServiceComment = (serviceId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], comment }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Convert ratings object to array of rating entries
      const ratingEntries = Object.entries(ratings).map(([serviceId, rating]) => {
        const serviceItem = serviceItems.find(item => item.service_id === serviceId)
        return {
          work_order_id: workOrderId,
          service_id: serviceId,
          assigned_profile_id: serviceItem?.assigned_profile_id,
          rating: rating.rating,
          comment: rating.comment,
          client_id: user.id
        }
      })

      // Filter out any incomplete ratings
      const validRatings = ratingEntries.filter(entry => entry.rating > 0)

      if (validRatings.length === 0) {
        throw new Error('Please provide at least one rating')
      }

      const { error } = await supabase
        .from('service_ratings')
        .insert(validRatings)

      if (error) throw error

      toast({
        title: "Success",
        description: "Ratings submitted successfully",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error submitting ratings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to submit ratings",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (existingRatings?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">You have already submitted ratings for this work order.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serviceItems.map((service) => (
        <Card key={service.service_id} className="p-4">
          <div className="space-y-4">
            <h3 className="font-medium">{service.service_name}</h3>
            
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setServiceRating(service.service_id, value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      value <= (ratings[service.service_id]?.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              placeholder="Share your experience with this service (optional)"
              value={ratings[service.service_id]?.comment || ""}
              onChange={(e) => setServiceComment(service.service_id, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </Card>
      ))}
      
      <Button 
        type="submit" 
        disabled={Object.keys(ratings).length === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Ratings"}
      </Button>
    </form>
  )
}
