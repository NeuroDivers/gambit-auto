
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TaxRate {
  id?: string
  region: string
  country: string
  tax_type: string
  tax_rate: number
  tax_number: string
  is_default?: boolean
}

const taxFormSchema = z.object({
  region: z.string().min(1, "Region is required"),
  country: z.string().min(1, "Country is required"),
  tax_type: z.string().min(1, "Tax type is required"),
  tax_rate: z.coerce.number().min(0, "Tax rate must be a positive number"),
  tax_number: z.string().min(1, "Tax registration number is required"),
  is_default: z.boolean().optional()
})

type TaxFormValues = z.infer<typeof taxFormSchema>

interface TaxManagementFormProps {
  initialTaxes: any[]
}

export function TaxManagementForm({ initialTaxes }: TaxManagementFormProps) {
  const queryClient = useQueryClient()
  const [selectedCountry, setSelectedCountry] = useState<string>("Canada")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null)
  
  const { data: taxRates, isLoading } = useQuery({
    queryKey: ['tax-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_taxes')
        .select('*')
        .order('country')
        .order('region')
      
      if (error) throw error
      return data as TaxRate[]
    },
    initialData: initialTaxes as TaxRate[]
  })

  const countries = Array.from(new Set(taxRates.map(tax => tax.country)))
  const regions = taxRates
    .filter(tax => tax.country === selectedCountry)
    .map(tax => tax.region)
    .filter((value, index, self) => self.indexOf(value) === index)

  const defaultValues: TaxFormValues = {
    region: "",
    country: "Canada",
    tax_type: "GST",
    tax_rate: 0,
    tax_number: "",
    is_default: false
  }

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues,
  })

  const resetForm = () => {
    form.reset(defaultValues)
    setEditingTaxId(null)
  }

  const { mutate: saveTax, isPending: isSaving } = useMutation({
    mutationFn: async (values: TaxFormValues & { id?: string }) => {
      const taxData = {
        region: values.region,
        country: values.country,
        tax_type: values.tax_type,
        tax_rate: values.tax_rate,
        tax_number: values.tax_number,
        is_default: values.is_default || false
      }

      if (values.is_default) {
        // If setting as default, unset other defaults for this tax type
        const { error: updateError } = await supabase
          .from('business_taxes')
          .update({ is_default: false })
          .eq('tax_type', values.tax_type)
          .neq('id', values.id || '')
        
        if (updateError) throw updateError
      }

      if (editingTaxId) {
        // Update existing tax rate
        const { error } = await supabase
          .from('business_taxes')
          .update(taxData)
          .eq('id', editingTaxId)

        if (error) throw error
        return { ...taxData, id: editingTaxId }
      } else {
        // Insert new tax rate
        const { data, error } = await supabase
          .from('business_taxes')
          .insert(taxData)
          .select()

        if (error) throw error
        return data[0]
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success(editingTaxId ? "Tax rate updated successfully" : "New tax rate added successfully")
      resetForm()
      setIsAddingNew(false)
    },
    onError: (error: any) => {
      console.error("Error saving tax rate:", error)
      toast.error("Failed to save tax rate")
    }
  })

  const { mutate: deleteTax } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_taxes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success("Tax rate deleted successfully")
    },
    onError: (error: any) => {
      console.error("Error deleting tax rate:", error)
      toast.error("Failed to delete tax rate")
    }
  })

  function onSubmit(values: TaxFormValues) {
    saveTax({ ...values, id: editingTaxId || undefined })
  }

  const editTax = (tax: TaxRate) => {
    setEditingTaxId(tax.id)
    form.reset({
      region: tax.region,
      country: tax.country,
      tax_type: tax.tax_type,
      tax_rate: tax.tax_rate,
      tax_number: tax.tax_number,
      is_default: tax.is_default
    })
    setIsAddingNew(true)
  }

  const setAsDefault = async (tax: TaxRate) => {
    if (tax.is_default) return

    try {
      // First, unset any current defaults for this tax type
      await supabase
        .from('business_taxes')
        .update({ is_default: false })
        .eq('tax_type', tax.tax_type)

      // Then set the selected one as default
      await supabase
        .from('business_taxes')
        .update({ is_default: true })
        .eq('id', tax.id)

      queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      toast.success(`${tax.tax_type} for ${tax.region} set as default`)
    } catch (error) {
      console.error("Error setting default tax:", error)
      toast.error("Failed to set default tax")
    }
  }

  return (
    <Tabs defaultValue="canada" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          {countries.map(country => (
            <TabsTrigger 
              key={country} 
              value={country.toLowerCase()}
              onClick={() => setSelectedCountry(country)}
            >
              {country}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setIsAddingNew(true)
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTaxId ? "Edit Tax Rate" : "Add New Tax Rate"}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("country") === "Canada" ? "Province" : "State"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          {form.watch("country") === "Canada" ? "e.g. Quebec, Ontario" : "e.g. California, New York"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tax type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GST">GST</SelectItem>
                            <SelectItem value="HST">HST</SelectItem>
                            <SelectItem value="PST">PST</SelectItem>
                            <SelectItem value="QST">QST</SelectItem>
                            <SelectItem value="VAT">VAT</SelectItem>
                            <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tax_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Your tax registration number (e.g. GST/HST number)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default</FormLabel>
                        <FormDescription>
                          This will be the default tax used for new invoices
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsAddingNew(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : (editingTaxId ? "Update" : "Add")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {countries.map(country => (
        <TabsContent key={country} value={country.toLowerCase()} className="space-y-4">
          {isLoading ? (
            <div>Loading tax rates...</div>
          ) : (
            <>
              {regions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-muted-foreground mb-4">No tax rates defined for {country} yet</p>
                    <Button 
                      onClick={() => {
                        form.reset({...defaultValues, country})
                        setIsAddingNew(true)
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Tax Rate
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                regions.map(region => {
                  const regionTaxes = taxRates.filter(
                    tax => tax.country === country && tax.region === region
                  )
                  
                  return (
                    <Card key={region}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          {region}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {regionTaxes.map(tax => (
                            <div 
                              key={tax.id} 
                              className={`p-4 rounded-lg border ${tax.is_default ? 'border-primary' : 'border-border'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium flex items-center">
                                  {tax.tax_type}
                                  {tax.is_default && (
                                    <Badge className="ml-2" variant="secondary">Default</Badge>
                                  )}
                                </div>
                                <div className="text-xl font-bold">{tax.tax_rate}%</div>
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                Reg #: {tax.tax_number}
                              </div>
                              <div className="flex justify-between mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => editTax(tax)}
                                >
                                  Edit
                                </Button>
                                <div className="space-x-2">
                                  {!tax.is_default && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setAsDefault(tax)}
                                    >
                                      Set as default
                                    </Button>
                                  )}
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => tax.id && deleteTax(tax.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
