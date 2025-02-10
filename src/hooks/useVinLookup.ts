
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface VinLookupResult {
  make?: string
  model?: string
  year?: number
  error?: string
}

export function useVinLookup(vin: string) {
  return useQuery({
    queryKey: ['vin-lookup', vin],
    queryFn: async (): Promise<VinLookupResult> => {
      if (!vin || vin.length !== 17) {
        return {}
      }

      try {
        // First check our local cache
        const { data: cachedData, error: cacheError } = await supabase
          .from('vin_lookups')
          .select('*')
          .eq('vin', vin)
          .maybeSingle()

        if (cacheError) {
          console.error('Cache lookup error:', cacheError)
          throw cacheError
        }

        if (cachedData) {
          if (!cachedData.success) {
            console.log('Using cached error response:', cachedData.error_message)
            throw new Error(cachedData.error_message || 'Failed to decode VIN')
          }
          return {
            make: cachedData.make,
            model: cachedData.model,
            year: cachedData.year
          }
        }

        // If not in cache, fetch from NHTSA API
        console.log('Fetching from NHTSA API for VIN:', vin)
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle information')
        }

        const results = data.Results
        const make = results.find((r: any) => r.Variable === 'Make')?.Value
        const model = results.find((r: any) => r.Variable === 'Model')?.Value
        const yearResult = results.find((r: any) => r.Variable === 'ModelYear')?.Value
        const year = yearResult ? parseInt(yearResult) : undefined

        console.log('NHTSA API response:', { make, model, year, results })

        const success = !!(make && model && year)
        const errorMessage = success ? null : 'Could not decode VIN - incomplete vehicle information returned'
        const timestamp = new Date().toISOString()

        // Cache the result
        const { error: upsertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            make: make || null,
            model: model || null,
            year: year || null,
            raw_data: data,
            success,
            error_message: errorMessage,
            created_at: timestamp,
            updated_at: timestamp
          }, {
            onConflict: 'vin'
          })

        if (upsertError) {
          console.error('Failed to cache VIN lookup:', upsertError)
          toast.error('Failed to cache VIN lookup')
        }

        if (success) {
          return { make, model, year }
        }

        throw new Error(errorMessage || 'Could not decode VIN')
      } catch (error: any) {
        console.error('VIN lookup error:', error)
        const timestamp = new Date().toISOString()
        
        // Cache the error result
        const { error: upsertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            success: false,
            error_message: error.message,
            make: null,
            model: null,
            year: null,
            raw_data: null,
            created_at: timestamp,
            updated_at: timestamp
          }, {
            onConflict: 'vin'
          })

        if (upsertError) {
          console.error('Failed to cache VIN lookup error:', upsertError)
          toast.error('Failed to cache VIN lookup error')
        }

        return { error: error.message }
      }
    },
    enabled: vin?.length === 17,
    staleTime: 1000 * 60 * 60 // Cache for 1 hour
  })
}
