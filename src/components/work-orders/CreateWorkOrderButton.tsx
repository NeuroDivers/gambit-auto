
import { Button, ButtonProps } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { useState } from "react"

type CreateWorkOrderButtonProps = Omit<ButtonProps, "onClick"> & {
  defaultStartTime?: Date
  label?: string
}

export function CreateWorkOrderButton({ 
  defaultStartTime, 
  label = "Create Work Order",
  ...props 
}: CreateWorkOrderButtonProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        {...props}
      >
        <Plus className="h-4 w-4 mr-2" />
        {label}
      </Button>
      
      <CreateWorkOrderDialog 
        open={open} 
        onOpenChange={setOpen}
        defaultStartTime={defaultStartTime}
      />
    </>
  )
}
