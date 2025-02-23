
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { PersonalInfoFields } from "@/components/shared/form-sections/PersonalInfoFields"
import { AddressFields } from "@/components/shared/form-sections/AddressFields"

interface CustomerInfoSectionProps {
  form: UseFormReturn<any>
}

export function CustomerInfoSection({ form }: CustomerInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PersonalInfoFields form={form} />
        <AddressFields form={form} />
      </CardContent>
    </Card>
  )
}
