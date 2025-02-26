
import React from 'react'

interface LogsDisplayProps {
  logs: string[]
  logsEndRef: React.RefObject<HTMLDivElement>
}

export function LogsDisplay({ logs, logsEndRef }: LogsDisplayProps) {
  return (
    <div className="bg-muted p-4 max-h-32 overflow-y-auto text-xs font-mono">
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="text-muted-foreground select-text">{log}</div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
