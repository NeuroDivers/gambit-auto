
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EstimateNotes({ notes }) {
  if (!notes) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{notes}</p>
      </CardContent>
    </Card>
  )
}
