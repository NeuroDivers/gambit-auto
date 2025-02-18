
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface AssignmentSheetProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{ id: string; name: string }>
  onAssign: (id: string) => void
}

export function AssignmentSheet({
  title,
  open,
  onOpenChange,
  items,
  onAssign
}: AssignmentSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {items?.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onAssign(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
