import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

type PrintButtonProps = {
  onPrint: () => void
}

export function PrintButton({ onPrint }: PrintButtonProps) {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onPrint} 
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
    </div>
  )
}