import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

type BayCardHeaderProps = {
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  bayId: string
}

export function BayCardHeader({ name, status, bayId }: BayCardHeaderProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in_use':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return ''
    }
  }

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

  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg">{name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={`border ${getStatusColor(status)}`}>
            {status}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}