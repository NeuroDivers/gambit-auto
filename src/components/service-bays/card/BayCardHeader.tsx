
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
        return <Badge variant="success" className="font-medium">Available</Badge>
      case 'in_use':
        return <Badge variant="secondary" className="font-medium">In Use</Badge>
      case 'maintenance':
        return <Badge variant="pending" className="font-medium">Maintenance</Badge>
      default:
        return null
    }
  }

  return (
    <CardHeader className="p-6 pb-4 bg-gradient-to-br from-background to-muted/30 border-b flex flex-row items-start justify-between gap-4">
      <div className="space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">{name}</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>
      <Button 
        variant="outline" 
        size="icon"
        className="rounded-full h-9 w-9 border-none bg-background/90 shadow-sm hover:bg-destructive hover:text-white transition-colors"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </CardHeader>
  )
}
