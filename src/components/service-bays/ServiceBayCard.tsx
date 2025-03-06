
import { Card } from "@/components/ui/card"
import { BayCardHeader } from "./card/BayCardHeader"
import { BayCardContent } from "./card/BayCardContent"
import { useBayActions } from "./hooks/useBayActions"
import { motion } from "framer-motion"

type ServiceBayCardProps = {
  bay: {
    id: string
    name: string
    status: 'available' | 'in_use' | 'maintenance'
    assigned_profile_id?: string | null
    notes?: string | null
  }
  services: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  availableServices: {
    id: string
    name: string
    status?: 'active' | 'inactive'
  }[]
}

export function ServiceBayCard({ bay, services, availableServices }: ServiceBayCardProps) {
  const { updateBayStatus, updateBayNotes, toggleService } = useBayActions(bay.id)

  const getStatusColor = () => {
    switch (bay.status) {
      case 'available': return 'border-green-300 shadow-green-100/50 dark:shadow-green-900/20'
      case 'in_use': return 'border-purple-300 shadow-purple-100/50 dark:shadow-purple-900/20'
      case 'maintenance': return 'border-amber-300 shadow-amber-100/50 dark:shadow-amber-900/20'
      default: return 'border-border shadow-sm'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`overflow-hidden border-2 ${getStatusColor()} transition-all shadow-lg hover:shadow-xl flex flex-col h-full rounded-xl group bg-card`}
      >
        <BayCardHeader 
          name={bay.name} 
          bayId={bay.id}
          status={bay.status}
        />
        <BayCardContent
          bayId={bay.id}
          status={bay.status}
          assignedProfileId={bay.assigned_profile_id}
          notes={bay.notes}
          services={services}
          availableServices={availableServices}
          onStatusChange={updateBayStatus}
          onNotesChange={updateBayNotes}
          onToggleService={toggleService}
        />
      </Card>
    </motion.div>
  )
}
