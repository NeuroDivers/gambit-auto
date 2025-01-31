import React from 'react'

type QuoteFormHeaderProps = {
  initialData?: boolean
}

export function QuoteFormHeader({ initialData }: QuoteFormHeaderProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">
        {initialData ? "Edit Quote Request" : "Request a Quote"}
      </h3>
      <p className="text-sm text-white/60">
        {initialData
          ? "Update the quote request details below"
          : "Fill out the form below to request a quote for our services"}
      </p>
    </div>
  )
}