import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Edit2, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { UserEditDialog } from "./UserEditDialog";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type UserCardProps = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_roles: {
      role: UserRole;
    } | null;
  };
};

export const UserCard = ({ user }: UserCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email;

  return (
    <>
      <div className="bg-[#242424] border border-white/12 rounded-lg p-6 transition-all duration-200 hover:border-[#BB86FC]/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#BB86FC]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#BB86FC]" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-white/[0.87]">{displayName}</p>
              <div className="flex items-center gap-2">
                {user.first_name && user.last_name && (
                  <p className="text-sm text-white/60">{user.email}</p>
                )}
                {user.user_roles?.role && (
                  <div className="flex items-center gap-1 text-sm text-[#BB86FC]">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{user.user_roles.role}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-white/60 hover:text-white/[0.87] hover:bg-white/[0.08]"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-white/60 hover:text-red-500 hover:bg-white/[0.08]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <UserEditDialog
        user={user}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
};