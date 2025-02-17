
import { Client } from "./types"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Edit, Trash, User, UserCheck } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface ClientCardProps {
  client: Client
  actions?: React.ReactNode
}

export function ClientCard({ client, actions }: ClientCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {client.user_id ? (
                  <UserCheck className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {client.first_name} {client.last_name}
                  {client.user_id && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Has Account
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                {client.phone_number && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {client.phone_number}
                  </p>
                )}
                {client.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {client.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
              </Button>
              {actions}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditClientDialog
        client={client}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  )
}
