
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"

type BayCardHeaderProps = {
  name: string
  bayId: string
  status: 'available' | 'in_use' | 'maintenance'
}

export function BayCardHeader({ name, bayId, status }: BayCardHeaderProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .delete()
        .eq('id', bayId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Service bay deleted successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["serviceBays"] })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>
      case 'in_use':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Use</Badge>
      case 'maintenance':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>
      default:
        return null
    }
  }

  return (
    <CardHeader className="p-4 pb-2">
      <div className="flex flex-col space-y-2">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  )
}
