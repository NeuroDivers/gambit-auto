
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type BayHeaderProps = {
  onAddBay: () => void
}

export function BayHeader({ onAddBay }: BayHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white/[0.87]">Service Bays</h2>
        <p className="text-white/60">Manage your service bay availability and capabilities</p>
      </div>
      <Button
        onClick={onAddBay}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Service Bay
      </Button>
    </div>
  )
}
