
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar, Loader2, Check, X } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"
import { useNavigate } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { toast } from "sonner"

interface QuoteRequestCardProps {
  request: QuoteRequest
  services: any[]
  onAcceptEstimate: (id: string) => void
  onRejectEstimate: (id: string) => void
  onDelete?: () => void
}

export function QuoteRequestCard({
  request,
  services,
  onAcceptEstimate,
  onRejectEstimate,
  onDelete
}: QuoteRequestCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive"
  } as const

  const requestedServices = request.service_ids
    .map(id => services?.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await supabase.functions.invoke('delete-quote-request', {
        body: { id: request.id }
      })

      if (response.error) throw response.error

      toast.success('Quote request deleted successfully')
      onDelete?.()
    } catch (error) {
      console.error('Error deleting quote request:', error)
      toast.error('Failed to delete quote request')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className={`hover:bg-accent/5 transition-colors ${request.is_archived ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">
                {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
              </h3>
              <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
                {request.status}
              </Badge>
              {request.client_response && (
                <Badge 
                  variant={request.client_response === "accepted" ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {request.client_response === "accepted" ? (
                    <>
                      <Check className="h-3 w-3" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3" />
                      Rejected
                    </>
                  )}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
            
            {requestedServices && (
              <p className="text-sm text-muted-foreground truncate">
                Services: {requestedServices}
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/client/quotes/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>

            {request.status === "estimated" && !request.client_response && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onAcceptEstimate(request.id)}
                >
                  Accept
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onRejectEstimate(request.id)}
                >
                  Reject
                </Button>
              </>
            )}

            {request.status === "pending" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your quote request
                      and all associated files.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
