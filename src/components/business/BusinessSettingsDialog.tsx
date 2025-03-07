
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { BusinessProfileForm } from "./BusinessProfileForm"
import { BusinessTaxForm } from "./BusinessTaxForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BusinessSettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild id="business-settings-trigger">
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Business Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Business Settings</DialogTitle>
          <DialogDescription>
            Manage your business profile and tax information.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="taxes">Tax Information</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <BusinessProfileForm />
          </TabsContent>
          <TabsContent value="taxes">
            <BusinessTaxForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
