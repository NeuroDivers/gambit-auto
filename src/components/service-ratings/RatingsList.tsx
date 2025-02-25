
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface RatingsListProps {
  profileId?: string
  serviceId?: string
  workOrderId?: string
}

export function RatingsList({ profileId, serviceId, workOrderId }: RatingsListProps) {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['service-ratings', profileId, serviceId, workOrderId],
    queryFn: async () => {
      let query = supabase
        .from('service_ratings')
        .select(`
          *,
          profiles!service_ratings_assigned_profile_id_fkey (
            first_name,
            last_name
          ),
          service_types!service_ratings_service_id_fkey (
            name
          ),
          clients (
            first_name,
            last_name
          ),
          work_orders!service_ratings_work_order_id_fkey (
            id,
            vehicle_make,
            vehicle_model,
            vehicle_year
          )
        `)
        .order('created_at', { ascending: false })

      if (profileId) {
        query = query.eq('assigned_profile_id', profileId)
      }

      if (serviceId) {
        query = query.eq('service_id', serviceId)
      }

      if (workOrderId) {
        query = query.eq('work_order_id', workOrderId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching ratings:', error)
        throw error
      }

      return data
    }
  })

  if (isLoading) {
    return <div className="text-center">Loading ratings...</div>
  }

  if (!ratings?.length) {
    return <div className="text-center text-muted-foreground">No ratings yet</div>
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">
                {rating.clients?.first_name} {rating.clients?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {rating.service_types?.name}
              </p>
              {rating.work_orders && (
                <p className="text-xs text-muted-foreground">
                  {rating.work_orders.vehicle_year} {rating.work_orders.vehicle_make} {rating.work_orders.vehicle_model}
                </p>
              )}
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          {rating.comment && (
            <p className="text-sm mt-2">{rating.comment}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(rating.created_at).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  )
}
