
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function WorkOrders() {
  const navigate = useNavigate()

  // Check if user is an admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'administrator'
      })
      
      return !!data
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-4 px-4 lg:px-8">
        <div className="sticky top-4 z-10">
          {isAdmin && (
            <Button 
              onClick={() => navigate("/work-orders/create")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Create Work Order
            </Button>
          )}
        </div>
        <div className="max-w-[1600px] mx-auto">
          <WorkOrderList />
        </div>
      </div>
    </div>
  )
}
