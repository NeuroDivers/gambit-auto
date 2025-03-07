import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StaffCommissionRates({ profileId }: { profileId: string }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("")
  const [commissionRate, setCommissionRate] = useState<string>("0")
  const [commissionType, setCommissionType] = useState<string>("percentage")
  const queryClient = useQueryClient()

  // Fetch staff commission rates
  const { data: commissionRates, isLoading: loadingRates } = useQuery({
    queryKey: ["commissionRates", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_commissions")
        .select(`
          id,
          rate,
          type,
          service_id,
          service_types:service_id(id, name)
        `)
        .eq("profile_id", profileId)
      
      if (error) throw error
      return data || []
    },
    enabled: !!profileId
  })

  // Fetch service types for dropdown
  const { data: serviceTypes, isLoading: loadingServiceTypes } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name")
        .order("name", { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })

  // Add commission rate mutation
  const addCommissionMutation = useMutation({
    mutationFn: async (data: { 
      profile_id: string; 
      service_id: string; 
      rate: number; 
      type: string 
    }) => {
      const { error } = await supabase
        .from("service_commissions")
        .upsert([data], { 
          onConflict: 'profile_id,service_id',
          ignoreDuplicates: false 
        })
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Commission rate added")
      setIsAddDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["commissionRates", profileId] })
    },
    onError: (error) => {
      toast.error("Failed to add commission rate")
      console.error("Error adding commission rate:", error)
    }
  })

  // Delete commission rate mutation
  const deleteCommissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_commissions")
        .delete()
        .eq("id", id)
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Commission rate deleted")
      queryClient.invalidateQueries({ queryKey: ["commissionRates", profileId] })
    },
    onError: (error) => {
      toast.error("Failed to delete commission rate")
      console.error("Error deleting commission rate:", error)
    }
  })

  const handleSubmit = () => {
    if (!selectedService) {
      toast.error("Please select a service")
      return
    }
    
    if (!commissionRate || isNaN(Number(commissionRate))) {
      toast.error("Please enter a valid commission rate")
      return
    }
    
    addCommissionMutation.mutate({
      profile_id: profileId,
      service_id: selectedService,
      rate: Number(commissionRate),
      type: commissionType
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commission Rates</CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Commission Rate
        </Button>
      </CardHeader>
      <CardContent>
        {loadingRates ? (
          <div className="text-center py-4">Loading commission rates...</div>
        ) : commissionRates?.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No commission rates defined for this staff member.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionRates?.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{serviceTypes.find(s => s.id === commission.service_id)?.name || "Unknown Service"}</TableCell>
                  <TableCell>{commission.rate}</TableCell>
                  <TableCell className="capitalize">{commission.type}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteCommissionMutation.mutate(commission.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Commission Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Commission Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select 
                value={selectedService} 
                onValueChange={setSelectedService}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes?.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rate">Commission Rate</Label>
              <Input 
                id="rate" 
                type="number" 
                value={commissionRate} 
                onChange={(e) => setCommissionRate(e.target.value)}
                min="0"
                step={commissionType === 'percentage' ? "0.1" : "0.01"}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Commission Type</Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Commission Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
