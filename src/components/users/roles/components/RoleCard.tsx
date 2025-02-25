
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Shield, Trash2, Users } from "lucide-react"
import { Role } from "../types/role"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface RoleCardProps {
  role: Role
  isAdmin: boolean
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleCard({ role, isAdmin, onEdit, onDelete }: RoleCardProps) {
  const navigate = useNavigate()
  
  // Check if role is protected (administrator or client)
  const isProtectedRole = role.name.toLowerCase() === 'administrator' || role.name.toLowerCase() === 'client'
  
  // Fetch user count for this role
  const { data: userCount } = useQuery({
    queryKey: ['roleUserCount', role.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', role.id);
        
      if (error) throw error;
      return count || 0;
    }
  });
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4" />
            {role.name}
          </div>
          <Badge 
            variant="default" 
            className="bg-primary/80 text-white hover:bg-primary/70"
          >
            {role.nicename}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{userCount || 0}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground min-h-[2.5rem]">
          {role.description || 'No description provided.'}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(role)}
            >
              Edit Details
            </Button>
            {isAdmin && !isProtectedRole && (
              <Button
                variant="destructive"
                size="sm"
                className="px-3"
                onClick={() => onDelete(role)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => navigate(`/system-roles/${role.id}/permissions`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
