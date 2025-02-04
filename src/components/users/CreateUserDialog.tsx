import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "../CreateUserForm";
import { Plus } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useState } from "react";

export const CreateUserDialog = () => {
  const { isAdmin, loading } = useAdminStatus();
  const [open, setOpen] = useState(false);

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#BB86FC] hover:bg-[#BB86FC]/90 text-white transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <CreateUserForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};