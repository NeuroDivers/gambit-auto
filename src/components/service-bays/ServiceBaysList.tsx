
import { useState, useEffect } from "react"
import { BayHeader } from "./BayHeader"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"
import { ServiceBayCard } from "./ServiceBayCard"
import { useServiceBays } from "./hooks/useServiceBays"
import { useServiceTypes } from "./hooks/useServiceTypes"
import { motion } from "framer-motion"

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { serviceBays, isLoading } = useServiceBays()
  const { data: availableServices } = useServiceTypes()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-6 bg-muted/60 rounded animate-pulse w-3/4 mx-auto"></div>
          <div className="h-32 bg-muted/60 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-muted/60 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="space-y-8">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      {mounted && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {serviceBays?.map((bay) => (
            <ServiceBayCard
              key={bay.id}
              bay={bay}
              services={bay.bay_services || []}
              availableServices={availableServices || []}
            />
          ))}
        </motion.div>
      )}

      <CreateServiceBayDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
