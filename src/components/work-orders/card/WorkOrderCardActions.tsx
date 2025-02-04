import { Button } from "@/components/ui/button"
import { FileText, Trash2, MoreVertical, Edit2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkOrder } from "@/types"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { EditWorkOrderDialog } from "../EditWorkOrderDialog"

type WorkOrderCardActionsProps = {
  workOrder: WorkOrder
  onDelete?: () => void
}

export function WorkOrderCardActions({ workOrder, onDelete }: WorkOrderCardActionsProps) {
  const navigate = useNavigate()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleCreateInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    try {
      const { data, error } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: workOrder.id
        })

      if (error) throw error

      toast.success('Invoice created successfully')
      navigate(`/invoices/${data}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrder.id)

      if (error) throw error

      toast.success('Work order deleted successfully')
      onDelete?.()
    } catch (error) {
      console.error('Error deleting work order:', error)
      toast.error('Failed to delete work order')
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    setIsEditOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={handleEdit}
            className="cursor-pointer"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCreateInvoice}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWorkOrderDialog 
        workOrder={workOrder}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}