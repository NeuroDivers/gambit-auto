
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
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'in_use':
        return <Clock className="h-6 w-6 text-purple-600" />
      case 'maintenance':
        return <Wrench className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  const getHeaderGradient = () => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-r from-green-50 via-green-100/60 to-green-50/40 dark:from-green-950/30 dark:via-green-900/20 dark:to-green-950/10'
      case 'in_use':
        return 'bg-gradient-to-r from-purple-50 via-purple-100/60 to-purple-50/40 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-purple-950/10'
      case 'maintenance':
        return 'bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50/40 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/10'
      default:
        return 'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5'
    }
  }

  return (
    <CardHeader className={`p-6 pb-4 ${getHeaderGradient()} border-b flex flex-row items-start justify-between gap-4 group-hover:shadow-sm transition-all`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-white/80 dark:bg-black/20 shadow-sm">
          {getStatusIcon()}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">{name}</CardTitle>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="icon"
        className="rounded-full h-9 w-9 border-none bg-background/90 shadow-md hover:bg-destructive hover:text-white transition-colors"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </CardHeader>
  )
}
