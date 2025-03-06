import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from 'uuid'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { supabase } from "@/integrations/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ServiceItemType } from "@/types/service-item"
import { Profile } from "@/types/profile"
import { CommissionType } from "@/types/commission"

interface ServiceSelectionFieldProps {
  items: ServiceItemType[]
  setItems: (items: ServiceItemType[]) => void
  allowPriceEdit?: boolean
  showCommission?: boolean
}

export function InvoiceItemsFields({
  items,
  setItems,
  allowPriceEdit = false,
  showCommission = false
}: ServiceSelectionFieldProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [serviceName, setServiceName] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [commissionTypes, setCommissionTypes] = useState<CommissionType[]>([])
  const [selectedCommissionType, setSelectedCommissionType] = useState<CommissionType | null>(null)
  const [commissionRate, setCommissionRate] = useState<number | null>(null)
  
  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("name", { ascending: true })
      
      if (error) {
        console.error("Error fetching services:", error)
        return
      }
      
      setAvailableServices(data || [])
    }
    
    fetchServices()
  }, [])
  
  // Fetch profiles
  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true })
      
      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }
      
      setProfiles(data || [])
    }
    
    fetchProfiles()
  }, [])

  // Fetch commission types
  useEffect(() => {
    async function fetchCommissionTypes() {
      const { data, error } = await supabase
        .from("commission_types")
        .select("*")
        .order("name", { ascending: true })
      
      if (error) {
        console.error("Error fetching commission types:", error)
        return
      }
      
      setCommissionTypes(data || [])
    }
    
    fetchCommissionTypes()
  }, [])
  
  const handleAddItem = () => {
    if (!selectedService) {
      alert("Please select a service")
      return
    }
    
    const newItem: ServiceItemType = {
      id: uuidv4(),
      service_id: selectedService.id,
      service_name: selectedService.name,
      description: selectedService.description,
      quantity: quantity,
      unit_price: unitPrice,
      assigned_profile_id: selectedProfile ? selectedProfile.id : null,
      commission_type: selectedCommissionType ? selectedCommissionType.id : null,
      commission_rate: commissionRate || null
    }
    
    setItems([...items, newItem])
    setServiceName("")
    setServiceDescription("")
    setQuantity(1)
    setUnitPrice(0)
    setSelectedService(null)
    setSelectedProfile(null)
    setSelectedCommissionType(null)
    setCommissionRate(null)
  }
  
  const handleEditItem = (index: number) => {
    const itemToEdit = items[index]
    setEditingIndex(index)
    setSelectedService({
      id: itemToEdit.service_id,
      name: itemToEdit.service_name,
      description: itemToEdit.description
    })
    setServiceName(itemToEdit.service_name)
    setServiceDescription(itemToEdit.description || "")
    setQuantity(itemToEdit.quantity)
    setUnitPrice(itemToEdit.unit_price)
    
    // Set the selected profile if it exists
    if (itemToEdit.assigned_profile_id) {
      const profile = profiles.find(p => p.id === itemToEdit.assigned_profile_id)
      setSelectedProfile(profile || null)
    } else {
      setSelectedProfile(null)
    }

    // Set the selected commission type if it exists
    if (itemToEdit.commission_type) {
      const commissionType = commissionTypes.find(ct => ct.id === itemToEdit.commission_type)
      setSelectedCommissionType(commissionType || null)
    } else {
      setSelectedCommissionType(null)
    }

    // Set the commission rate
    setCommissionRate(itemToEdit.commission_rate || null)
  }
  
  const handleUpdateItem = () => {
    if (editingIndex === -1) return
    
    if (!selectedService) {
      alert("Please select a service")
      return
    }
    
    const updatedItem: ServiceItemType = {
      id: items[editingIndex].id,
      service_id: selectedService.id,
      service_name: selectedService.name,
      description: selectedService.description,
      quantity: quantity,
      unit_price: unitPrice,
      assigned_profile_id: selectedProfile ? selectedProfile.id : null,
      commission_type: selectedCommissionType ? selectedCommissionType.id : null,
      commission_rate: commissionRate || null
    }
    
    setItems(prevItems => {
      const newItems = [...prevItems]
      newItems[editingIndex] = updatedItem
      return newItems
    })
    
    setServiceName("")
    setServiceDescription("")
    setQuantity(1)
    setUnitPrice(0)
    setEditingIndex(-1)
    setSelectedService(null)
    setSelectedProfile(null)
    setSelectedCommissionType(null)
    setCommissionRate(null)
  }
  
  const handleRemoveItem = (index: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems]
      newItems.splice(index, 1)
      return newItems
    })
  }
  
  const handleServiceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceName(e.target.value)
  }
  
  const handleServiceDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setServiceDescription(e.target.value)
  }
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setQuantity(isNaN(value) ? 1 : value)
  }
  
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setUnitPrice(isNaN(value) ? 0 : value)
  }

  const handleProfileChange = (profile: Profile | null) => {
    setSelectedProfile(profile);

    setItems((prevItems) => {
      if (editingIndex === -1) return prevItems;
      const updatedItems = [...prevItems];
      updatedItems[editingIndex].assigned_profile_id = profile ? profile.id : null;
      return updatedItems;
    });
  };

  const handleCommissionTypeChange = (commissionType: CommissionType | null) => {
    setSelectedCommissionType(commissionType);

    setItems((prevItems) => {
      if (editingIndex === -1) return prevItems;
      const updatedItems = [...prevItems];
      updatedItems[editingIndex].commission_type = commissionType ? commissionType.id : null;
      return updatedItems;
    });
  };

const handleCommissionRateChange = (value: string) => {
  const numericValue = value === '' ? null : parseFloat(value);
  
  setItems((prevItems) => {
    const updatedItems = [...prevItems];
    updatedItems[editingIndex].commission_rate = numericValue;
    return updatedItems;
  });
};
  
  return (
    <div className="grid gap-4">
      <Table>
        <TableCaption>
          {editingIndex !== -1 ? "Edit Service" : "Add a service"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            {showCommission && <TableHead>Assigned To</TableHead>}
            {showCommission && <TableHead>Commission Type</TableHead>}
            {showCommission && <TableHead>Commission Rate</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                  >
                    {selectedService ? selectedService.name : "Select service"}
                    <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className="hover:bg-secondary cursor-pointer p-2 rounded-md"
                      onClick={() => {
                        setSelectedService(service)
                      }}
                    >
                      {service.name}
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell>
              <Textarea
                value={selectedService?.description || ''}
                onChange={handleServiceDescriptionChange}
                placeholder="Service description"
                className="w-[200px]"
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={quantity.toString()}
                onChange={handleQuantityChange}
                className="w-[80px]"
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={unitPrice.toString()}
                onChange={handleUnitPriceChange}
                className="w-[100px]"
                disabled={!allowPriceEdit}
              />
            </TableCell>
            {showCommission && (
              <TableCell>
                <Select onValueChange={(value) => {
                  const profile = profiles.find(p => p.id === value) || null
                  handleProfileChange(profile)
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select profile" value={selectedProfile?.id} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.first_name} {profile.last_name}
                      </SelectItem>
                    ))}
                    <SelectItem value="">
                      <em>No Profile</em>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            )}
            {showCommission && (
              <TableCell>
                <Select onValueChange={(value) => {
                  const commissionType = commissionTypes.find(ct => ct.id === value) || null
                  handleCommissionTypeChange(commissionType)
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" value={selectedCommissionType?.id} />
                  </SelectTrigger>
                  <SelectContent>
                    {commissionTypes.map((commissionType) => (
                      <SelectItem key={commissionType.id} value={commissionType.id}>
                        {commissionType.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="">
                      <em>No Type</em>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            )}
            {showCommission && (
              <TableCell>
                <Input
                  type="number"
                  value={(commissionRate === null ? '' : commissionRate).toString()}
                  onChange={(e) => handleCommissionRateChange(e.target.value)}
                  className="w-[100px]"
                  placeholder="Rate"
                />
              </TableCell>
            )}
            <TableCell className="text-right">
              {editingIndex !== -1 ? (
                <Button size="sm" onClick={handleUpdateItem}>
                  Update
                </Button>
              ) : (
                <Button size="sm" onClick={handleAddItem}>
                  Add
                </Button>
              )}
            </TableCell>
          </TableRow>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{item.service_name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.unit_price.toFixed(2)}</TableCell>
              {showCommission && (
                <TableCell>
                  {profiles.find(p => p.id === item.assigned_profile_id)?.first_name || '-'}
                </TableCell>
              )}
              {showCommission && (
                <TableCell>
                  {commissionTypes.find(ct => ct.id === item.commission_type)?.name || '-'}
                </TableCell>
              )}
              {showCommission && (
                <TableCell>
                  {item.commission_rate !== null ? `${item.commission_rate}%` : '-'}
                </TableCell>
              )}
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditItem(index)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
