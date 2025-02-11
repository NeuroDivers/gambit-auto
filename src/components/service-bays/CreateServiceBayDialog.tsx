import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface CreateServiceBayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceBayDialog({ open, onOpenChange }: CreateServiceBayDialogProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('service_bays')
        .insert([{ name }])

      if (error) throw error

      // Clear form and close dialog
      setName("")
      onOpenChange(false)
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['serviceBays'] })

      toast({
        title: "Success",
        description: "Service bay created successfully",
      })
    } catch (error) {
      console.error('Error creating service bay:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Service Bay</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bay Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bay name"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Bay"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
