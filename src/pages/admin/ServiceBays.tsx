import { Button } from "@/components/ui/button"
import { Plus, Loader2, Edit, Trash2, User, Wrench } from "lucide-react"
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProfileWithRole } from "@/integrations/supabase/types/user-roles"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AssignedProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface ServiceBay {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  notes?: string;
  assigned_profile_id?: string | null;
  created_at: string;
  updated_at: string;
  profile?: AssignedProfile | null;
  bay_services?: { service_id: string, is_active: boolean }[];
  assigned_services?: string[];
}

interface ServiceBayFormData {
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  notes?: string;
}

interface BayService {
  service_id: string;
  is_active: boolean;
  bay_id: string;
}

export default function ServiceBays() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null)
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false)
  const [isManageServicesOpen, setIsManageServicesOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<ServiceBayFormData>({
    defaultValues: {
      name: "",
      status: "available",
      notes: "",
    },
  })

  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      console.log("Fetching assignable users...")
      
      const { data: assignableRoles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('can_be_assigned_to_bay', true)

      if (rolesError) {
        console.error("Error fetching roles:", rolesError)
        throw rolesError
      }

      console.log("Assignable roles:", assignableRoles)

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          updated_at,
          avatar_url,
          phone_number,
          address,
          bio,
          role_id,
          roles (
            id,
            name,
            nicename
          )
        `)
        .in('role_id', assignableRoles.map(role => role.id))

      if (error) {
        console.error("Error fetching profiles:", error)
        throw error
      }

      console.log("Fetched profiles:", profiles)

      const transformedProfiles = profiles.map(profile => {
        const roleData = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles

        return {
          id: profile.id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          phone_number: profile.phone_number,
          address: profile.address,
          bio: profile.bio,
          role: roleData ? {
            id: roleData.id,
            name: roleData.name,
            nicename: roleData.nicename,
          } : null
        }
      }).filter(profile => profile.role)

      console.log("Transformed profiles:", transformedProfiles)
      return transformedProfiles
    },
  })

  const { data: availableServices } = useQuery({
    queryKey: ["available-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')

      if (error) throw error
      return data
    },
  })

  const { data: bayServices } = useQuery({
    queryKey: ["bay-services", selectedBay?.id],
    queryFn: async () => {
      if (!selectedBay) return []
      const { data, error } = await supabase
        .from('bay_services')
        .select('*')
        .eq('bay_id', selectedBay.id)

      if (error) throw error
      return data as BayService[]
    },
    enabled: !!selectedBay,
  })

  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("service_bays", "page_access")
      console.log("Service bays permission check:", hasPermission)
      setHasAccess(hasPermission)
    }
    checkAccess()
  }, [checkPermission])

  const { data: serviceBays, isLoading, refetch } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select(`
          *,
          profile:assigned_profile_id (
            id,
            email,
            first_name,
            last_name
          ),
          bay_services (
            service_id,
            is_active
          )
        `)
        .order("name")

      if (error) throw error
      return data as ServiceBay[]
    },
  })

  const assignUserMutation = useMutation({
    mutationFn: async ({ bayId, userId }: { bayId: string, userId: string | null }) => {
      console.log('Assigning user:', { bayId, userId })
      const { error } = await supabase
        .from('service_bays')
        .update({ assigned_profile_id: userId })
        .eq('id', bayId)

      if (error) {
        console.error('Error assigning user:', error)
        throw error
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User assignment updated successfully" })
      queryClient.invalidateQueries({ queryKey: ["service-bays"] })
      setIsAssignUserOpen(false)
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update user assignment", 
        variant: "destructive" 
      })
      console.error('Error assigning user:', error)
    }
  })

  const toggleServiceMutation = useMutation({
    mutationFn: async ({ 
      bayId, 
      serviceId, 
      isActive 
    }: { 
      bayId: string, 
      serviceId: string, 
      isActive: boolean 
    }) => {
      console.log('Toggling service:', { bayId, serviceId, isActive })
      
      if (isActive) {
        const { data: existingService, error: checkError } = await supabase
          .from('bay_services')
          .select('*')
          .eq('bay_id', bayId)
          .eq('service_id', serviceId)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing service:', checkError)
          throw checkError
        }

        if (!existingService) {
          const { error: insertError } = await supabase
            .from('bay_services')
            .insert([{ 
              bay_id: bayId, 
              service_id: serviceId,
              is_active: true 
            }])
          
          if (insertError) {
            console.error('Error inserting service:', insertError)
            throw insertError
          }
        } else {
          const { error: updateError } = await supabase
            .from('bay_services')
            .update({ is_active: true })
            .eq('bay_id', bayId)
            .eq('service_id', serviceId)
          
          if (updateError) {
            console.error('Error updating service:', updateError)
            throw updateError
          }
        }
      } else {
        const { error: deleteError } = await supabase
          .from('bay_services')
          .delete()
          .eq('bay_id', bayId)
          .eq('service_id', serviceId)
        
        if (deleteError) {
          console.error('Error deleting service:', deleteError)
          throw deleteError
        }
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Services updated successfully" })
      queryClient.invalidateQueries({ queryKey: ["service-bays"] })
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update services", 
        variant: "destructive" 
      })
      console.error('Error updating services:', error)
    }
  })

  const handleCreateBay = async (data: ServiceBayFormData) => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .insert([data])

      if (error) throw error

      toast({
        title: "Success",
        description: "Service bay created successfully",
      })
      setIsCreateDialogOpen(false)
      form.reset()
      refetch()
    } catch (error) {
      console.error('Error creating service bay:', error)
      toast({
        title: "Error",
        description: "Failed to create service bay",
        variant: "destructive",
      })
    }
  }

  const handleEditBay = async (data: ServiceBayFormData) => {
    if (!selectedBay) return

    try {
      const { error } = await supabase
        .from('service_bays')
        .update(data)
        .eq('id', selectedBay.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Service bay updated successfully",
      })
      setIsEditDialogOpen(false)
      setSelectedBay(null)
      refetch()
    } catch (error) {
      console.error('Error updating service bay:', error)
      toast({
        title: "Error",
        description: "Failed to update service bay",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBay = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Service bay deleted successfully",
      })
      refetch()
    } catch (error) {
      console.error('Error deleting service bay:', error)
      toast({
        title: "Error",
        description: "Failed to delete service bay",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: ServiceBay['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-500'
      case 'occupied':
        return 'text-yellow-500'
      case 'maintenance':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (hasAccess === null || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access service bays.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Bays</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service Bay
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service Bay</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateBay)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bay name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Create Service Bay</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {serviceBays?.map((bay) => (
          <Card key={bay.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bay.name}</CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBay(bay)
                          form.reset({
                            name: bay.name,
                            status: bay.status,
                            notes: bay.notes,
                          })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Service Bay</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEditBay)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter bay name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Add notes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">Update Service Bay</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Sheet open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBay(bay)
                        }}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Assign User to {bay.name}</SheetTitle>
                      </SheetHeader>
                      <div className="py-6">
                        <Select
                          value={bay.assigned_profile_id || "none"}
                          onValueChange={(value) => 
                            assignUserMutation.mutate({ 
                              bayId: bay.id, 
                              userId: value === "none" ? null : value 
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {assignableUsers?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} ({user.role?.nicename || ''})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Sheet open={isManageServicesOpen} onOpenChange={setIsManageServicesOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBay(bay)
                        }}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Manage Services for {bay.name}</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                        <div className="pr-4 space-y-4">
                          {availableServices?.map((service) => {
                            const isActive = bay.bay_services?.some(
                              bs => bs.service_id === service.id && bs.is_active
                            )
                            
                            return (
                              <div key={service.id} className="flex items-center justify-between">
                                <span>{service.name}</span>
                                <Button
                                  variant={isActive ? "default" : "outline"}
                                  onClick={() => {
                                    toggleServiceMutation.mutate({
                                      bayId: bay.id,
                                      serviceId: service.id,
                                      isActive: !isActive
                                    })
                                  }}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the service bay. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBay(bay.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(bay.status)}`}>
                    {bay.status}
                  </span>
                </div>
                {bay.notes && (
                  <div className="text-sm text-muted-foreground">
                    {bay.notes}
                  </div>
                )}
                {bay.profile && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>
                      Assigned to: {bay.profile.first_name} {bay.profile.last_name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
