
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
          console.log('Found cached VIN data:', cachedData)
          if (!cachedData.success) {
            console.log('Using cached error response:', cachedData.error_message)
            return { error: cachedData.error_message || 'Failed to decode VIN' }
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
        if (!response.ok) {
          throw new Error(`NHTSA API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const results = data.Results

        if (!Array.isArray(results)) {
          const error = 'Invalid response format from NHTSA API'
          await cacheErrorResult(vin, error)
          return { error }
        }

        const make = results.find((r: any) => r.Variable === 'Make')?.Value
        const model = results.find((r: any) => r.Variable === 'Model')?.Value
        const yearResult = results.find((r: any) => r.Variable === 'ModelYear')?.Value
        const year = yearResult ? parseInt(yearResult) : undefined

        console.log('NHTSA API response parsed values:', { 
          make, 
          model, 
          year,
          makeResult: results.find((r: any) => r.Variable === 'Make'),
          modelResult: results.find((r: any) => r.Variable === 'Model'),
          yearResult: results.find((r: any) => r.Variable === 'ModelYear')
        })

        if (!make || !model || !year) {
          const errorMessage = 'Could not decode VIN - incomplete vehicle information returned'
          console.log('Missing required vehicle information:', {
            hasMake: !!make,
            hasModel: !!model,
            hasYear: !!year
          })
          await cacheErrorResult(vin, errorMessage)
          return { error: errorMessage }
        }

        const timestamp = new Date().toISOString()

        // Cache the successful result
        const { error: upsertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            make,
            model,
            year,
            raw_data: data,
            success: true,
            error_message: null,
            created_at: timestamp,
            updated_at: timestamp
          }, {
            onConflict: 'vin'
          })

        if (upsertError) {
          console.error('Failed to cache VIN lookup:', upsertError)
          toast.error('Failed to cache VIN lookup')
        }

        return { make, model, year }
      } catch (error: any) {
        console.error('VIN lookup error:', error)
        await cacheErrorResult(vin, error.message)
        return { error: error.message }
      }
    },
    enabled: vin?.length === 17,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false // Don't retry failed lookups
  })
}

async function cacheErrorResult(vin: string, errorMessage: string) {
  const timestamp = new Date().toISOString()
  
  const { error: upsertError } = await supabase
    .from('vin_lookups')
    .upsert({
      vin,
      success: false,
      error_message: errorMessage,
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
}
