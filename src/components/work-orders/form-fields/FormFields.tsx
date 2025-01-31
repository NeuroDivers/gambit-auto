import React from 'react'
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { DateTimeFields } from "./DateTimeFields"
import { BaySelectionField } from "./BaySelectionField"
import { StatusField } from "./StatusField"
import { NotesField } from "./NotesField"

type FormFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function FormFields({ form }: FormFieldsProps) {
  return (
    <div className="space-y-6">
      <DateTimeFields control={form.control} />
      <BaySelectionField control={form.control} />
      <StatusField control={form.control} />
      <NotesField control={form.control} />
    </div>
  )
}