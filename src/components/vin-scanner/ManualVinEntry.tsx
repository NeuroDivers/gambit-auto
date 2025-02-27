
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ManualVinEntryProps } from "./types"

export default function ManualVinEntry({
  handleManualVinSubmit
}: ManualVinEntryProps) {
  const [manualVin, setManualVin] = useState("")

  return (
    <div className="flex space-x-2 mt-4">
      <Input
        placeholder="Enter VIN manually" 
        value={manualVin}
        onChange={e => setManualVin(e.target.value.toUpperCase())}
        maxLength={17}
        className="flex-1"
      />
      <Button 
        onClick={() => {
          // We need to expose the manualVin to the parent component
          // This is a workaround since we're refactoring
          (window as any).tempManualVin = manualVin
          handleManualVinSubmit()
        }}
        className="shrink-0" 
        disabled={manualVin.length !== 17}
      >
        Use
      </Button>
    </div>
  )
}
