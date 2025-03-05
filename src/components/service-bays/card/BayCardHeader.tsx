
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Wrench, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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

  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_use':
        return <Clock className="h-5 w-5 text-purple-500" />
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-amber-500" />
      default:
        return null
    }
  }

  const getHeaderGradient = () => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10'
      case 'in_use':
        return 'bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10'
      case 'maintenance':
        return 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10'
      default:
        return 'bg-gradient-to-r from-primary/10 to-primary/5'
    }
  }

  return (
    <CardHeader className={`p-6 pb-4 ${getHeaderGradient()} border-b flex flex-row items-start justify-between gap-4 group-hover:shadow-sm transition-all`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">{name}</CardTitle>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="icon"
        className="rounded-full h-8 w-8 border-none bg-background/90 shadow-sm hover:bg-destructive hover:text-white transition-colors"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </CardHeader>
  )
}
