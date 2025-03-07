
import { useEffect, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, ArchiveIcon, Archive, FilePlus2, Filter, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Estimate {
  id: string
  created_at: string
  client_id: string
  status: string
  total: number
  notes: string
  client_name: string | null
  is_archived: boolean
}

export default function EstimatesList() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [selectedEstimateIds, setSelectedEstimateIds] = useState<string[]>([])
  const [isArchived, setIsArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const { data: estimatesData, error, isLoading } = useQuery({
    queryKey: ["estimates", isArchived, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("estimates")
        .select("*")
        .eq("is_archived", isArchived)
        .order("created_at", { ascending: false })

      if (searchQuery) {
        query = query.ilike("client_name", `%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (estimatesData) {
      setEstimates(estimatesData)
    }
  }, [estimatesData])

  const columns: ColumnDef<Estimate>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return date.toLocaleDateString()
      },
    },
    {
      accessorKey: "client_name",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.client_name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">
            Est #{row.original.id.substring(0, 8)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={row.original.status === "draft" ? "bg-muted" : 
                   row.original.status === "sent" ? "bg-blue-100 text-blue-700" :
                   row.original.status === "approved" ? "bg-green-100 text-green-700" :
                   row.original.status === "declined" ? "bg-red-100 text-red-700" : ""}
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("total") || 0)
        return formatted
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const estimate = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/admin/edit-estimate/${estimate.id}`)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Logic for converting to invoice would go here
                  toast.info("Convert to invoice feature coming soon")
                }}
                className="cursor-pointer"
              >
                <FilePlus2 className="mr-2 h-4 w-4" /> Convert to Invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Logic for downloading/exporting estimate would go here
                  toast.info("Download feature coming soon")
                }}
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this estimate?"
                  )
                  if (!confirmDelete) return

                  const { error } = await supabase
                    .from("estimates")
                    .delete()
                    .eq("id", estimate.id)

                  if (error) {
                    toast.error("Failed to delete estimate")
                  } else {
                    toast.success("Estimate deleted successfully")
                    setEstimates((prevEstimates) =>
                      prevEstimates.filter((e) => e.id !== estimate.id)
                    )
                  }
                }}
                className="cursor-pointer text-destructive focus:bg-destructive/20"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: estimates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        setSelectedEstimateIds(prev => {
          const selectionState = updaterOrValue({});
          return Object.keys(selectionState).filter(key => selectionState[key]);
        });
      } else {
        setSelectedEstimateIds(Object.keys(updaterOrValue).filter(key => updaterOrValue[key]));
      }
    },
    state: {
      rowSelection: selectedEstimateIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>),
    }
  })

  const handleArchiveSelected = async () => {
    if (selectedEstimateIds.length === 0) {
      toast.error("No estimates selected")
      return
    }

    const confirmArchive = window.confirm(
      `Are you sure you want to archive ${selectedEstimateIds.length} estimates?`
    )
    if (!confirmArchive) return

    const { error } = await supabase
      .from("estimates")
      .update({ is_archived: true })
      .in("id", selectedEstimateIds)

    if (error) {
      toast.error("Failed to archive estimates")
    } else {
      toast.success("Estimates archived successfully")
      setEstimates((prevEstimates) =>
        prevEstimates.filter((e) => !selectedEstimateIds.includes(e.id))
      )
      setSelectedEstimateIds([])
    }
  }

  const handleRestoreSelected = async () => {
    if (selectedEstimateIds.length === 0) {
      toast.error("No estimates selected")
      return
    }

    const confirmRestore = window.confirm(
      `Are you sure you want to restore ${selectedEstimateIds.length} estimates?`
    )
    if (!confirmRestore) return

    const { error } = await supabase
      .from("estimates")
      .update({ is_archived: false })
      .in("id", selectedEstimateIds)

    if (error) {
      toast.error("Failed to restore estimates")
    } else {
      toast.success("Estimates restored successfully")
      setEstimates((prevEstimates) =>
        prevEstimates.filter((e) => !selectedEstimateIds.includes(e.id))
      )
      setSelectedEstimateIds([])
    }
  }

  // Add stats for estimates
  const { data: stats } = useQuery({
    queryKey: ["estimateStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estimates")
        .select("status, is_archived")
        
      if (error) throw error;
      
      const draft = data.filter(e => e.status === "draft" && !e.is_archived).length;
      const sent = data.filter(e => e.status === "sent" && !e.is_archived).length;
      const approved = data.filter(e => e.status === "approved" && !e.is_archived).length;
      const archived = data.filter(e => e.is_archived).length;
      
      return { draft, sent, approved, archived, total: data.length };
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Estimates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{stats?.draft || 0}</div>
            <p className="text-sm text-muted-foreground">Draft Estimates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{stats?.sent || 0}</div>
            <p className="text-sm text-muted-foreground">Sent Estimates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{stats?.approved || 0}</div>
            <p className="text-sm text-muted-foreground">Approved Estimates</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Estimates</h1>
        <Button onClick={() => navigate("/admin/create-estimate")}>
          Create Estimate
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          type="search"
          placeholder="Search by client name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div>
          <Button
            variant="secondary"
            onClick={() => setIsArchived(!isArchived)}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            {isArchived ? "View Active Estimates" : "View Archived Estimates"}
          </Button>
          {isArchived ? (
            <Button
              className="ml-2"
              onClick={handleRestoreSelected}
              disabled={selectedEstimateIds.length === 0}
            >
              Restore Selected
            </Button>
          ) : (
            <Button
              className="ml-2"
              onClick={handleArchiveSelected}
              disabled={selectedEstimateIds.length === 0}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Selected
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div>Loading estimates...</div>
      ) : error ? (
        <div>Error: {(error as Error).message}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() => {
                      // This allows clicking anywhere on the row to navigate to the estimate
                      // but excludes clicking on checkboxes and action buttons
                      const target = event?.target as HTMLElement;
                      if (
                        !target.closest('input[type="checkbox"]') &&
                        !target.closest('button')
                      ) {
                        navigate(`/admin/edit-estimate/${row.original.id}`);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
              {estimates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No estimates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
