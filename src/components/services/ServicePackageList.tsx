
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
import { X, Plus } from "lucide-react";

interface ServicePackageListProps {
  serviceId: string;
  packages: ServicePackage[];
  onPackagesChange: () => void;
}

export function ServicePackageList({ serviceId, packages, onPackagesChange }: ServicePackageListProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    status: "active" as const,
  });

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
          />
          <Input
            type="number"
            placeholder="Price (optional)"
            value={newPackage.price}
            onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
          />
          <Button onClick={handleAddPackage}>Add Package</Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell>{pkg.name}</TableCell>
              <TableCell>{pkg.description}</TableCell>
              <TableCell>{pkg.price ? `$${pkg.price}` : "-"}</TableCell>
              <TableCell>
                <Select
                  value={pkg.status}
                  onValueChange={(value: "active" | "inactive") => 
                    handleUpdateStatus(pkg.id, value)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePackage(pkg.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
