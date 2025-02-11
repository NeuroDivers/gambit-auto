
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

        // Find the make, model, and year from the results
        const makeResult = results.find((r: any) => r.Variable === 'Make')
        const modelResult = results.find((r: any) => r.Variable === 'Model')
        const yearResult = results.find((r: any) => r.Variable === 'Model Year')

        // Log the entire results array for debugging
        console.log('NHTSA API complete response:', results)
        
        // Log specific fields we're looking for
        console.log('Make result:', makeResult)
        console.log('Model result:', modelResult)
        console.log('Year result:', yearResult)

        const make = makeResult?.Value
        const model = modelResult?.Value
        const year = yearResult?.Value ? parseInt(yearResult.Value) : undefined

        // Log the extracted values
        console.log('Extracted values:', { make, model, year })

        if (!make || make === '' || make === 'null') {
          console.log('Make is missing or invalid')
          const error = 'Could not decode VIN - make information missing'
          await cacheErrorResult(vin, error)
          return { error }
        }

        if (!model || model === '' || model === 'null') {
          console.log('Model is missing or invalid')
          const error = 'Could not decode VIN - model information missing'
          await cacheErrorResult(vin, error)
          return { error }
        }

        if (!year) {
          console.log('Year is missing or invalid')
          const error = 'Could not decode VIN - year information missing'
          await cacheErrorResult(vin, error)
          return { error }
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
