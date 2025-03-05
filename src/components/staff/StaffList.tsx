
import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import { useStaffData } from "./hooks/useStaffData"
import { StaffDetailsDialog } from "./StaffDetailsDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

export function StaffList() {
  const { data: staffMembers, isLoading, error } = useStaffData()
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  if (error) {
    toast({
      title: "Error loading staff data",
      description: error.message,
      variant: "destructive",
    })
  }

  const handleViewDetails = (staffId: string) => {
    setSelectedStaffId(staffId)
    setIsDetailsOpen(true)
  }

  const selectedStaff = staffMembers?.find(staff => staff.staff_id === selectedStaffId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>
          View and manage staff information across departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers && staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <TableRow key={staff.staff_id}>
                      <TableCell className="font-medium">
                        {staff.first_name} {staff.last_name}
                      </TableCell>
                      <TableCell>{staff.position || "—"}</TableCell>
                      <TableCell>{staff.department || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.status === "active" ? "default" : "secondary"}
                        >
                          {staff.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.role_nicename || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(staff.staff_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No staff members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedStaff && (
        <StaffDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          staffId={selectedStaff.staff_id}
          profileId={selectedStaff.profile_id}
        />
      )}
    </Card>
  )
}
