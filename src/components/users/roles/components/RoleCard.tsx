
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Trash2 } from "lucide-react"
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
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4" />
          {role.nicename}
        </div>
        {isAdmin && role.name !== 'admin' && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(role)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{role.description || 'No description provided.'}</p>
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(role)}
          >
            Edit Role
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/admin/system-roles/${role.id}/permissions`)}
          >
            Manage Permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
