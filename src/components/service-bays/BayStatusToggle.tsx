
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

type BayStatusToggleProps = {
  status: 'available' | 'in_use' | 'maintenance'
  onStatusChange: (status: 'available' | 'in_use' | 'maintenance') => void
}

export function BayStatusToggle({ status, onStatusChange }: BayStatusToggleProps) {
  return (
    <div className="space-y-3">
      <Label className="font-medium text-foreground">Bay Status</Label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onStatusChange('available')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all overflow-hidden ${
            status === 'available' 
              ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-800 border-2 border-green-300 shadow-md' 
              : 'bg-background border border-border hover:bg-green-50 hover:text-green-700 hover:border-green-200'
          }`}
        >
          {status === 'available' && (
            <motion.div 
              className="absolute inset-0 bg-green-500/5"
              animate={{ opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <CheckCircle className={`h-5 w-5 mb-1 ${status === 'available' ? 'text-green-600' : ''}`} />
          <span className="text-xs font-medium">Available</span>
        </button>
        
        <button
          type="button"
          onClick={() => onStatusChange('in_use')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all overflow-hidden ${
            status === 'in_use' 
              ? 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-800 border-2 border-purple-300 shadow-md' 
              : 'bg-background border border-border hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
          }`}
        >
          {status === 'in_use' && (
            <motion.div 
              className="absolute inset-0 bg-purple-500/5"
              animate={{ opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <Clock className={`h-5 w-5 mb-1 ${status === 'in_use' ? 'text-purple-600' : ''}`} />
          <span className="text-xs font-medium">In Use</span>
        </button>
        
        <button
          type="button"
          onClick={() => onStatusChange('maintenance')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all overflow-hidden ${
            status === 'maintenance' 
              ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800 border-2 border-amber-300 shadow-md' 
              : 'bg-background border border-border hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
          }`}
        >
          {status === 'maintenance' && (
            <motion.div 
              className="absolute inset-0 bg-amber-500/5"
              animate={{ opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <AlertTriangle className={`h-5 w-5 mb-1 ${status === 'maintenance' ? 'text-amber-600' : ''}`} />
          <span className="text-xs font-medium">Maintenance</span>
        </button>
      </div>
    </div>
  )
}
