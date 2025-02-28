
import React from "react"

export interface PageTitleProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
}
