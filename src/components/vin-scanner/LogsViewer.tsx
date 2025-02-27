
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { LogsViewerProps } from "./types"

export default function LogsViewer({ logs, logsEndRef }: LogsViewerProps) {
  return (
    <Collapsible open={true} className="mt-4">
      <CollapsibleContent>
        <div className="bg-muted rounded-md p-2 h-32 overflow-y-auto text-xs font-mono">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-muted-foreground">{log}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
