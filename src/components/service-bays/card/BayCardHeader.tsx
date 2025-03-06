
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"

type BayCardHeaderProps = {
  name: string
  bayId: string
  status: 'available' | 'in_use' | 'maintenance'
  isExpanded: boolean
  onToggleExpand: () => void
  hasServices: boolean
}

export function BayCardHeader({ name, bayId, status, isExpanded, onToggleExpand, hasServices }: BayCardHeaderProps) {
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Maintenance</Badge>
      default:
        return null
    }
  }

  return (
    <CardHeader className="py-4 px-6 flex flex-row items-start justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg truncate">{name}</CardTitle>
          {hasServices && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpand}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onToggleExpand}
        >
          <span className="mr-1">Edit</span>
        </Button>
      </div>
    </CardHeader>
  )
}
