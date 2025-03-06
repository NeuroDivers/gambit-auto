
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
      <div className="animate-pulse flex items-center justify-center h-40 text-primary/60 text-lg">
        Loading service bays...
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

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      {mounted && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {serviceBays?.map((bay) => (
            <motion.div key={bay.id} variants={item}>
              <ServiceBayCard
                bay={bay}
                services={bay.bay_services || []}
                availableServices={availableServices || []}
              />
            </motion.div>
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
