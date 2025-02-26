
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Client } from "@/components/clients/types"
import debounce from "lodash/debounce"
import { useCallback, useState } from "react"

interface ClientSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientSelect: (client: Client) => void
}

export function ClientSearchDialog({
  open,
  onOpenChange,
  onClientSelect
}: ClientSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: searchResults } = useQuery({
    queryKey: ['client-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return []
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .limit(5)

      if (error) throw error
      return data
    },
    enabled: searchTerm.length > 2
  })

  const handleSearchTermChange = useCallback(
    debounce((value: string) => {
      setSearchTerm(value)
    }, 300),
    []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Customers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Search by name, email, or phone..."
            onChange={(e) => handleSearchTermChange(e.target.value)}
          />
          {searchResults && searchResults.length > 0 ? (
            <Table>
              <TableBody>
                {searchResults.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => onClientSelect(client)}
                  >
                    <TableCell>
                      {client.first_name} {client.last_name}
                      <div className="text-sm text-muted-foreground">
                        {client.email}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : searchTerm.length > 2 ? (
            <p className="text-center text-muted-foreground">No customers found</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
