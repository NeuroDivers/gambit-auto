
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type BayCardActionsProps = {
  bayId: string
  onEdit: () => void
}

export function BayCardActions({ bayId, onEdit }: BayCardActionsProps) {
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
    <div className="px-6 py-4 mt-auto border-t flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-black hover:text-black hover:bg-gray-100"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
      <Button
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>
    </div>
  )
}
