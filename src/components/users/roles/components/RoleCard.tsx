
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Shield, Trash2 } from "lucide-react"
import { Role } from "../types/role"
import { useNavigate } from "react-router-dom"

interface RoleCardProps {
  role: Role
  isAdmin: boolean
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleCard({ role, isAdmin, onEdit, onDelete }: RoleCardProps) {
  const navigate = useNavigate()
  
  // Check if role is protected (administrator or client)
  const isProtectedRole = role.name === 'administrator' || role.name === 'client'
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4" />
          {role.nicename}
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
