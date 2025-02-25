
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface RatingsListProps {
  workOrderId?: string
  serviceId?: string
  assignedProfileId?: string
}

export function RatingsList({ workOrderId, serviceId, assignedProfileId }: RatingsListProps) {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['service-ratings', workOrderId, serviceId, assignedProfileId],
    queryFn: async () => {
      let query = supabase
        .from('service_ratings')
        .select(`
          *,
          service_types:service_id (name),
          profiles:client_id (first_name, last_name)
        `)

      if (workOrderId) {
        query = query.eq('work_order_id', workOrderId)
      }
      if (serviceId) {
        query = query.eq('service_id', serviceId)
      }
      if (assignedProfileId) {
        query = query.eq('assigned_profile_id', assignedProfileId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ratings:', error)
        throw error
      }

      return data
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!ratings?.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No ratings found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {rating.service_types?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rated by {rating.profiles?.first_name} {rating.profiles?.last_name}
                </p>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= rating.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            {rating.comment && (
              <p className="text-sm mt-2">
                {rating.comment}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(rating.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
