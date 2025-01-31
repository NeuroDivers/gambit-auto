import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface QuoteRequestCardProps {
  quote: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    contact_preference: "phone" | "email";
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_serial: string;
    additional_notes?: string;
    created_at: string;
    status: string;
    service_types: {
      name: string;
    };
  };
}

export const QuoteRequestCard = ({ quote }: QuoteRequestCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          {quote.first_name} {quote.last_name}
        </CardTitle>
        <Badge
          variant={quote.status === "pending" ? "secondary" : "default"}
        >
          {quote.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <p><strong>Service:</strong> {quote.service_types.name}</p>
          <p><strong>Contact:</strong> {quote.contact_preference === "email" ? quote.email : quote.phone_number}</p>
          <p><strong>Vehicle:</strong> {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}</p>
          <p><strong>Serial:</strong> {quote.vehicle_serial}</p>
          {quote.additional_notes && (
            <p><strong>Notes:</strong> {quote.additional_notes}</p>
          )}
          <p className="text-muted-foreground mt-2">
            Submitted on {format(new Date(quote.created_at), "PPP")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};