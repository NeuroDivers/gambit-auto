
import { Button } from "@/components/ui/button"
import { CreditCard, Trash2 } from "lucide-react"
import { SavedPaymentMethod } from "./types"

type PaymentMethodCardProps = {
  method: SavedPaymentMethod
  onDelete: (id: string) => void
}

export function PaymentMethodCard({ method, onDelete }: PaymentMethodCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <CreditCard className="h-5 w-5" />
        <div>
          <p className="font-medium">
            {method.card_brand} **** {method.card_last4}
          </p>
          <p className="text-sm text-muted-foreground">
            Expires {method.card_exp_month}/{method.card_exp_year}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(method.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
