import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { UseReactToPrintHookReturnType } from "react-to-print"

type PrintButtonProps = {
  onPrint: UseReactToPrintHookReturnType
}

export function PrintButton({ onPrint }: PrintButtonProps) {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={() => onPrint()} 
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
    </div>
  )
}