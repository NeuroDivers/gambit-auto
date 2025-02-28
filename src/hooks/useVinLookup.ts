
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
        const { data: existingData, error: cacheError } = await supabase
          .from('vin_lookups')
          .select('*')
          .eq('vin', validVin)
          .single()

        if (cacheError && cacheError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - other errors should be logged
          console.error('Error checking VIN cache:', cacheError)
        }

        if (existingData && existingData.success) {
          console.log('Using cached VIN data:', existingData)
          
          // Extract data from cached record
          // Here we need to make sure we have all the fields we need
          const bodyClass = existingData.body_class || '';
          const doors = existingData.doors || 0;
          const trim = existingData.trim || '';
          
          // Log complete data retrieval for debugging
          console.log('Extracted from cache:', {
            make: existingData.make,
            model: existingData.model,
            year: existingData.year,
            bodyClass,
            doors,
            trim
          });
          
          return {
            make: existingData.make || '',
            model: existingData.model || '',
            year: existingData.year || 0,
            bodyClass,
            doors,
            trim,
          }
        }

        // If not in cache, fetch from NHTSA API
        console.log('Fetching VIN data from NHTSA API:', validVin)
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${validVin}?format=json`)
        const data = await response.json()

        if (!response.ok || !data || !data.Results || !Array.isArray(data.Results)) {
          console.error('Failed to fetch VIN data:', data)
          
          // Store the failed lookup in cache to avoid repeated failures
          await supabase
            .from('vin_lookups')
            .upsert({
              vin: validVin,
              success: false,
              error_message: 'API response error',
              raw_data: data || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'vin' })
            
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
        
        // Get trim information from multiple fields and merge them
        const trim1 = getValueByVariable(results, 'Trim')
        const trim2 = getValueByVariable(results, 'Trim2')
        const series = getValueByVariable(results, 'Series')
        const series2 = getValueByVariable(results, 'Series2')
        
        // Merge trim values without duplicates
        const trim = mergeTrims([trim1, trim2, series, series2])
        
        // Log what we've extracted from the API for debugging
        console.log('Extracted from API:', {
          make,
          model,
          year,
          bodyClass,
          doors,
          trim
        });

        // Store in cache - using upsert to handle cases where the VIN exists but success was false
        await supabase
          .from('vin_lookups')
          .upsert({
            vin: validVin,
            make,
            model,
            year,
            body_class: bodyClass,
            doors,
            trim,
            success: true,
            raw_data: data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'vin' })

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
        
        // Store the error in the database to prevent repeated API calls for known errors
        try {
          await supabase
            .from('vin_lookups')
            .upsert({
              vin: validVin,
              success: false,
              error_message: error instanceof Error ? error.message : 'Unknown error',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'vin' })
        } catch (cacheError) {
          console.error('Failed to cache VIN lookup error:', cacheError)
        }
        
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
    staleTime: 1000 * 60 * 60 * 24 * 7 // 1 week - increased from 1 hour since VIN data rarely changes
  })
}

// Helper function to get a value by variable name
function getValueByVariable(results: any[], variableName: string): string {
  const found = results.find(item => item.Variable === variableName)
  return found && found.Value !== null ? found.Value : ''
}

// Function to merge trim values without duplicates
function mergeTrims(trimValues: string[]): string {
  // Filter out empty values
  const validValues = trimValues.filter(val => val !== null && val !== '' && val !== 'null')
  
  if (validValues.length === 0) return ''
  
  // Split each value into words and create a set of unique words
  const words = new Set<string>()
  validValues.forEach(val => {
    val.split(/\s+/).forEach(word => {
      if (word.trim()) {
        words.add(word.trim())
      }
    })
  })
  
  // Convert the set back to a string
  return Array.from(words).join(' ')
}
