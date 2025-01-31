import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type CreateServiceBayDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceBayDialog({ open, onOpenChange }: CreateServiceBayDialogProps) {
  const [name, setName] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from("service_bays")
        .insert({ name })

      if (error) throw error

      toast({
        title: "Success",
        description: "Service bay created successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["serviceBays"] })
      onOpenChange(false)
      setName("")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Service Bay</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Bay Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bay name..."
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Bay
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}