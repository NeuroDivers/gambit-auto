import { Badge } from "@/components/ui/badge"

const serviceColors = [
  {
    name: 'Oil Change',
    bg: 'rgb(14,165,233,0.2)',
    text: '#0EA5E9',
    border: 'rgb(14,165,233,0.3)'
  },
  {
    name: 'Tire Rotation',
    bg: 'rgb(234,179,8,0.2)',
    text: 'rgb(250,204,21)',
    border: 'rgb(234,179,8,0.3)'
  },
  {
    name: 'Brake Service',
    bg: 'rgb(234,56,76,0.2)',
    text: '#ea384c',
    border: 'rgb(234,56,76,0.3)'
  },
  {
    name: 'General Maintenance',
    bg: 'rgb(155,135,245,0.2)',
    text: '#9b87f5',
    border: 'rgb(155,135,245,0.3)'
  }
]

export function ServiceLegend() {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4 p-4 rounded-lg">
      <span className="text-sm font-medium mr-2">Service Types:</span>
      {serviceColors.map((service) => (
        <div key={service.name} className="flex items-center gap-2">
          <Badge
            className="border"
            style={{
              backgroundColor: service.bg,
              color: service.text,
              borderColor: service.border
            }}
          >
            {service.name}
          </Badge>
        </div>
      ))}
    </div>
  )
}