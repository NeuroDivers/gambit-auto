
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServicePackage } from "@/integrations/supabase/types/service-types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Pencil } from "lucide-react";

interface ServicePackageListProps {
  serviceId: string;
  packages: ServicePackage[];
  onPackagesChange: () => void;
}

const getStatusStyles = (status: "active" | "inactive") => {
  switch (status) {
    case "active":
      return "text-green-400 bg-[rgb(34,197,94,0.2)] border-[rgb(34,197,94,0.3)]"
    case "inactive":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    default:
      return ""
  }
}

export function ServicePackageList({ serviceId, packages, onPackagesChange }: ServicePackageListProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    status: "active" as const,
  });
  const [editPackage, setEditPackage] = useState<ServicePackage | null>(null);

  const handleAddPackage = async () => {
    try {
      if (!newPackage.name) {
        toast({
          title: "Error",
          description: "Package name is required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("service_packages").insert({
        service_id: serviceId,
        name: newPackage.name,
        description: newPackage.description,
        price: newPackage.price ? parseFloat(newPackage.price) : null,
        sale_price: newPackage.sale_price ? parseFloat(newPackage.sale_price) : null,
        status: newPackage.status,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package added successfully",
      });

      setNewPackage({
        name: "",
        description: "",
        price: "",
        sale_price: "",
        status: "active",
      });
      setIsAdding(false);
      onPackagesChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPackage = async (packageId: string) => {
    if (!editPackage) return;

    try {
      const { error } = await supabase
        .from("service_packages")
        .update({
          name: editPackage.name,
          description: editPackage.description,
          price: editPackage.price,
          sale_price: editPackage.sale_price,
          status: editPackage.status,
        })
        .eq("id", packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package updated successfully",
      });

      setEditingId(null);
      setEditPackage(null);
      onPackagesChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .delete()
        .eq("id", packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      onPackagesChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (packageId: string, newStatus: "active" | "inactive") => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .update({ status: newStatus })
        .eq("id", packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package status updated successfully",
      });
      onPackagesChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEditing = (pkg: ServicePackage) => {
    setEditingId(pkg.id);
    setEditPackage(pkg);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Service Packages</h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Cancel" : "Add Package"}
        </Button>
      </div>

      {isAdding && (
        <div className="space-y-4 p-4 border rounded-lg">
          <Input
            placeholder="Package Name"
            value={newPackage.name}
            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newPackage.description}
            onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
            className="min-h-[100px]"
          />
          <Input
            type="number"
            placeholder="Regular Price (optional)"
            value={newPackage.price}
            onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Sale Price (optional)"
            value={newPackage.sale_price}
            onChange={(e) => setNewPackage({ ...newPackage, sale_price: e.target.value })}
          />
          <Button onClick={handleAddPackage}>Add Package</Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Regular Price</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              {editingId === pkg.id ? (
                <>
                  <TableCell colSpan={6}>
                    <div className="space-y-6 p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="Package Name"
                          value={editPackage?.name || ""}
                          onChange={(e) => setEditPackage(prev => ({ ...prev!, name: e.target.value }))}
                        />
                        <div className="flex gap-4">
                          <Input
                            type="number"
                            placeholder="Regular Price"
                            value={editPackage?.price || ""}
                            onChange={(e) => setEditPackage(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                          />
                          <Input
                            type="number"
                            placeholder="Sale Price"
                            value={editPackage?.sale_price || ""}
                            onChange={(e) => setEditPackage(prev => ({ ...prev!, sale_price: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <Select
                          value={editPackage?.status}
                          onValueChange={(value: "active" | "inactive") => 
                            setEditPackage(prev => ({ ...prev!, status: value }))
                          }
                        >
                          <SelectTrigger className={`w-[130px] ${getStatusStyles(editPackage?.status || 'inactive')}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-full">
                        <Textarea
                          placeholder="Description"
                          value={editPackage?.description || ""}
                          onChange={(e) => setEditPackage(prev => ({ ...prev!, description: e.target.value }))}
                          className="min-h-[150px] w-full"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditPackage(pkg.id)}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{pkg.description}</TableCell>
                  <TableCell>{pkg.price ? `$${pkg.price}` : "-"}</TableCell>
                  <TableCell>{pkg.sale_price ? `$${pkg.sale_price}` : "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={pkg.status}
                      onValueChange={(value: "active" | "inactive") => 
                        handleUpdateStatus(pkg.id, value)
                      }
                    >
                      <SelectTrigger className={`w-[130px] ${getStatusStyles(pkg.status)}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(pkg)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
