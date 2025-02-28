
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { validateVIN } from '@/utils/vin-validation'
import { toast } from 'sonner'

interface VinData {
  make: string
  model: string
  year: number
  bodyClass: string
  doors: number
  trim: string
  error?: string
}

export function useVinLookup(vin: string | undefined | null) {
  const [validVin, setValidVin] = useState<string | null>(null)

  useEffect(() => {
    if (!vin || vin.length < 17) {
      setValidVin(null)
      return
    }

    // Clean and validate the VIN
    const cleanedVin = vin.trim().toUpperCase()
    
    if (validateVIN(cleanedVin)) {
      setValidVin(cleanedVin)
    } else {
      setValidVin(null)
    }
  }, [vin])

  return useQuery({
    queryKey: ['vin', validVin],
    queryFn: async (): Promise<VinData> => {
      if (!validVin) {
        return { make: '', model: '', year: 0, bodyClass: '', doors: 0, trim: '', error: 'Invalid VIN' }
      }

      try {
        // First check if we have this VIN in our cache
        const { data: existingData } = await supabase
          .from('vin_lookups')
          .select('*')
          .eq('vin', validVin)
          .eq('success', true)
          .maybeSingle()

        if (existingData) {
          console.log('Using cached VIN data:', existingData)
          
          // Extract data from cached
          return {
            make: existingData.make || '',
            model: existingData.model || '',
            year: existingData.year || 0,
            bodyClass: '',
            doors: 0,
            trim: '',
          }
        }

        // If not in cache, fetch from NHTSA API
        console.log('Fetching VIN data from NHTSA API:', validVin)
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${validVin}?format=json`)
        const data = await response.json()

        if (!response.ok || !data || !data.Results || !Array.isArray(data.Results)) {
          console.error('Failed to fetch VIN data:', data)
          return { 
            make: '', 
            model: '', 
            year: 0, 
            bodyClass: '', 
            doors: 0, 
            trim: '', 
            error: 'API response error' 
          }
        }

        // Extract the values from the API response
        const results = data.Results
        
        // Extract values with helper function
        const make = getValueByVariable(results, 'Make')
        const model = getValueByVariable(results, 'Model')
        const yearStr = getValueByVariable(results, 'Model Year')
        const year = yearStr ? parseInt(yearStr, 10) : 0
        const bodyClass = getValueByVariable(results, 'Body Class')
        const doorsStr = getValueByVariable(results, 'Doors')
        const doors = doorsStr ? parseInt(doorsStr, 10) : 0
        const trim = getValueByVariable(results, 'Trim')

        // Store in cache
        await supabase
          .from('vin_lookups')
          .insert({
            vin: validVin,
            make,
            model,
            year,
            success: true,
            raw_data: data,
          })

        // Return the extracted values
        return { 
          make: make || '', 
          model: model || '', 
          year: year || 0,
          bodyClass: bodyClass || '',
          doors: doors || 0,
          trim: trim || '',
        }
      } catch (error) {
        console.error('Error in VIN lookup:', error)
        toast.error('Error decoding VIN. Please try again or enter the information manually.')
        
        return { 
          make: '', 
          model: '', 
          year: 0, 
          bodyClass: '', 
          doors: 0, 
          trim: '', 
          error: 'Lookup failed' 
        }
      }
    },
    enabled: !!validVin,
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}

// Helper function to get a value by variable name
function getValueByVariable(results: any[], variableName: string): string {
  const found = results.find(item => item.Variable === variableName)
  return found && found.Value !== null ? found.Value : ''
}
