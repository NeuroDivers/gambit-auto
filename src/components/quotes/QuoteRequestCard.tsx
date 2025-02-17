import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Calendar, Archive, Clock } from "lucide-react"
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
import { toast } from "sonner"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"

interface QuoteRequestCardProps {
  request: QuoteRequest
  services: any[]
  onStatusChange: (id: string, status: QuoteRequest['status']) => void
  onDelete: (id: string) => void
  onArchiveToggle: (id: string, currentArchiveStatus: boolean) => void
  estimateAmount: Record<string, string>
  setEstimateAmount: (value: Record<string, string>) => void
  onEstimateSubmit: (id: string, estimates: Record<string, string>) => void
}

export function QuoteRequestCard({
  request,
  services,
  onStatusChange,
  onDelete,
  onArchiveToggle,
  estimateAmount,
  setEstimateAmount,
  onEstimateSubmit,
}: QuoteRequestCardProps) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const statusVariant = {
    pending: "secondary",
    estimated: "default",
    accepted: "outline",
    rejected: "destructive",
    converted: "outline" // Changed from "success" to "outline" since it's a valid variant
  } as const

  const requestedServices = request.service_ids
    .map(id => services?.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  const timeSinceCreation = () => {
    const created = new Date(request.created_at)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await supabase.functions.invoke('delete-quote-request', {
        body: { id: request.id }
      })

      if (response.error) throw response.error

      toast.success('Quote request deleted successfully')
      onDelete(request.id)
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
              {request.estimated_amount && (
                <span className="text-sm font-medium text-muted-foreground">
                  ${request.estimated_amount.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Clock className="h-4 w-4" />
                <span>{timeSinceCreation()}</span>
              </div>
            </div>
            
            {requestedServices && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                Services: {requestedServices}
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/quotes/${request.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchiveToggle(request.id, request.is_archived || false)}
            >
              <Archive className="h-4 w-4" />
            </Button>
            {(request.status === "pending" || request.status === "estimated") && (
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
                      This action cannot be undone. This will permanently delete this quote request
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
