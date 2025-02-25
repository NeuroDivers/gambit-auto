
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AssignmentSheetProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{ id: string; name: string }>
  onAssign: (id: string | null) => void
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
          <SheetDescription>Select from the list below</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-4 pr-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => {
                onAssign(null);
                onOpenChange(false);
              }}
            >
              Unassign {title.toLowerCase()}
            </Button>
            {items?.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onAssign(item.id);
                  onOpenChange(false);
                }}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
