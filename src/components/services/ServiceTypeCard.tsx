
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

type ServiceTypeCardProps = {
  service: {
    id: string
    name: string
    description?: string | null
    price?: number | null
    duration?: number | null
    status: 'active' | 'inactive'
  }
  onEdit: () => void
  onRefetch: () => void
}

export function ServiceTypeCard({ service, onEdit, onRefetch }: ServiceTypeCardProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', service.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Service type deleted successfully",
      })

      onRefetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
              {service.status}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
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
      <CardContent>
        <div className="space-y-2">
          {service.description && (
            <p className="text-sm text-muted-foreground">{service.description}</p>
          )}
          <div className="flex items-center gap-4">
            {service.price && (
              <span className="text-sm">Price: ${service.price}</span>
            )}
            {service.duration && (
              <span className="text-sm">Duration: {service.duration} min</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

