import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./ProfileForm";
import { Settings } from "lucide-react";

export const ProfileDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild id="profile-settings-trigger">
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Profile Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <ProfileForm />
      </DialogContent>
    </Dialog>
  );
};