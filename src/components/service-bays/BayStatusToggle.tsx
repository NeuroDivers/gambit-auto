
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

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
              ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm' 
              : 'bg-background border border-border hover:bg-green-50 hover:text-green-700 hover:border-green-200'
          }`}
        >
          {status === 'available' && (
            <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
          )}
          <CheckCircle className={`h-5 w-5 mb-1 ${status === 'available' ? 'text-green-600' : ''}`} />
          <span className="text-xs font-medium">Available</span>
        </button>
        
        <button
          type="button"
          onClick={() => onStatusChange('in_use')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all overflow-hidden ${
            status === 'in_use' 
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-300 shadow-sm' 
              : 'bg-background border border-border hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
          }`}
        >
          {status === 'in_use' && (
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
          )}
          <Clock className={`h-5 w-5 mb-1 ${status === 'in_use' ? 'text-purple-600' : ''}`} />
          <span className="text-xs font-medium">In Use</span>
        </button>
        
        <button
          type="button"
          onClick={() => onStatusChange('maintenance')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all overflow-hidden ${
            status === 'maintenance' 
              ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 shadow-sm' 
              : 'bg-background border border-border hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
          }`}
        >
          {status === 'maintenance' && (
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
          )}
          <AlertTriangle className={`h-5 w-5 mb-1 ${status === 'maintenance' ? 'text-amber-600' : ''}`} />
          <span className="text-xs font-medium">Maintenance</span>
        </button>
      </div>
    </div>
  )
}
