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

export function BayCardHeader({ name, bayId }: BayCardHeaderProps) {
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

  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  )
}