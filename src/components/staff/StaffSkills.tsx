
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type StaffSkillsProps = {
  profileId: string;
}

export function StaffSkills({ profileId }: StaffSkillsProps) {
  const { data: skills, isLoading } = useQuery({
    queryKey: ["staff-skills", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_service_skills")
        .select(`
          id,
          service_id,
          is_active,
          service_types:service_id(id, name, description)
        `)
        .eq("profile_id", profileId)
        .order("is_active", { ascending: false })
      
      if (error) {
        console.error("Error fetching staff skills:", error)
        throw error
      }
      
      return data
    },
    enabled: !!profileId,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Skills & Services</CardTitle>
      </CardHeader>
      <CardContent>
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <TooltipProvider key={skill.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant={skill.is_active ? "outline" : "secondary"}
                      className={`
                        ${skill.is_active 
                          ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20" 
                          : "opacity-60"}
                        cursor-default px-3 py-1.5
                      `}
                    >
                      {skill.service_types?.name || "Unknown Service"}
                      {!skill.is_active && " (Inactive)"}
                    </Badge>
                  </TooltipTrigger>
                  {skill.service_types?.description && (
                    <TooltipContent className="max-w-xs">
                      <div className="flex gap-2 items-start">
                        <InfoIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm">{skill.service_types.description}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No services assigned to this staff member yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
