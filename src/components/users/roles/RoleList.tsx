
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { RoleCard } from "./components/RoleCard"
import { RoleDialog } from "./RoleDialog"
import { useState } from "react"
import { Role } from "./types/role"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DeleteRoleDialog } from "./components/DeleteRoleDialog"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export function RoleList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { isAdmin } = useAdminStatus()

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name")

      if (error) throw error
      return data as Role[]
    },
  })

  const handleEditClick = (role: Role) => {
    setSelectedRole(role)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles?.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isAdmin={isAdmin}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <RoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
      />

      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
      />
    </>
  )
}
