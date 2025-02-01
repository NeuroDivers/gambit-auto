import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const getServiceColor = (serviceName: string) => {
  // Keep a fallback color scheme for any new services
  const baseColors = {
    'Oil Change': {
      bg: 'rgb(14,165,233,0.2)',
      text: '#0EA5E9',
      border: 'rgb(14,165,233,0.3)'
    },
    'Tire Rotation': {
      bg: 'rgb(234,179,8,0.2)',
      text: 'rgb(250,204,21)',
      border: 'rgb(234,179,8,0.3)'
    },
    'Brake Service': {
      bg: 'rgb(234,56,76,0.2)',
      text: '#ea384c',
      border: 'rgb(234,56,76,0.3)'
    },
    'General Maintenance': {
      bg: 'rgb(155,135,245,0.2)',
      text: '#9b87f5',
      border: 'rgb(155,135,245,0.3)'
    }
  } as Record<string, { bg: string; text: string; border: string }>

  return baseColors[serviceName] || {
    bg: 'rgb(148,163,184,0.2)',
    text: '#94A3B8',
    border: 'rgb(148,163,184,0.3)'
  }
}

export function ServiceLegend() {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .order("name")
      
      if (error) throw error
      return data
    },
  })

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4 p-4 rounded-lg">
      <span className="text-sm font-medium mr-2">Service Types:</span>
      {services.map((service) => {
        const colors = getServiceColor(service.name)
        return (
          <div key={service.id} className="flex items-center gap-2">
            <Badge
              className="border"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border
              }}
            >
              {service.name}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
