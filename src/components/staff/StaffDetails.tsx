
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffProfile } from "./StaffProfile"
import { StaffSkills } from "./StaffSkills"
import { StaffCommissionRates } from "./StaffCommissionRates"
import { StaffWorkOrderHistory } from "./StaffWorkOrderHistory"

export function StaffDetails() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("profile")

  // Fetch staff details
  const { data: staffMember, isLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from("staff_view")
        .select("*")
        .eq("staff_id", id)
        .maybeSingle()
        
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  if (isLoading) {
    return <div className="p-8 text-center">Loading staff details...</div>
  }

  if (!staffMember) {
    return <div className="p-8 text-center">Staff member not found</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {staffMember.first_name} {staffMember.last_name}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="history">Work History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <StaffProfile staffMember={staffMember} />
        </TabsContent>
        
        <TabsContent value="skills">
          <StaffSkills profileId={staffMember.profile_id} />
        </TabsContent>
        
        <TabsContent value="commissions">
          <StaffCommissionRates profileId={staffMember.profile_id} />
        </TabsContent>
        
        <TabsContent value="history">
          <StaffWorkOrderHistory profileId={staffMember.profile_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
