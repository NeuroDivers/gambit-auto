
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffProfileForm } from "./StaffProfileForm"
import { StaffDetailsForm } from "./StaffDetailsForm"
import { useStaffDetails } from "./hooks/useStaffDetails"
import { Loader2 } from "lucide-react"

interface StaffDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffId: string
  profileId: string
}

export function StaffDetailsDialog({
  open,
  onOpenChange,
  staffId,
  profileId,
}: StaffDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const { staffDetails, isLoading } = useStaffDetails(staffId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="details">Staff Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 pt-4">
              <StaffProfileForm 
                profileId={profileId} 
                onSuccess={() => onOpenChange(false)}
              />
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <StaffDetailsForm 
                staffDetails={staffDetails} 
                staffId={staffId}
                onSuccess={() => onOpenChange(false)}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
