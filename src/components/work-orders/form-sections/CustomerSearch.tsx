
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerForm } from "./CustomerForm";

interface CustomerType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    year: string;
    color: string;
    vin: string;
    license_plate: string;
  }>;
}

interface CustomerSearchProps {
  onSelectCustomer: (customer: CustomerType) => void;
  onSelectVehicle: (vehicle: any) => void;
}

export function CustomerSearch({ onSelectCustomer, onSelectVehicle }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);

  const mockCustomers: CustomerType[] = [
    {
      id: "1",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      address: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip_code: "12345",
      vehicles: [
        {
          id: "v1",
          make: "Toyota",
          model: "Camry",
          year: "2020",
          color: "Blue",
          vin: "1HGCM82633A123456",
          license_plate: "ABC123"
        },
        {
          id: "v2",
          make: "Honda",
          model: "Accord",
          year: "2018",
          color: "Silver",
          vin: "5FNRL38667B301214",
          license_plate: "XYZ789"
        }
      ]
    },
    {
      id: "2",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      phone: "555-987-6543",
      address: "456 Oak Ave",
      city: "Othertown",
      state: "NY",
      zip_code: "67890",
      vehicles: [
        {
          id: "v3",
          make: "Ford",
          model: "Mustang",
          year: "2021",
          color: "Red",
          vin: "1ZVHT82H485113456",
          license_plate: "FAST1"
        }
      ]
    }
  ];

  const handleSearch = () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = mockCustomers.filter(customer => 
      customer.first_name.toLowerCase().includes(lowerSearchTerm) ||
      customer.last_name.toLowerCase().includes(lowerSearchTerm) ||
      customer.email.toLowerCase().includes(lowerSearchTerm) ||
      customer.phone.includes(searchTerm)
    );
    
    setSearchResults(results);
  };

  const handleCustomerClick = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    onSelectCustomer(customer);
  };

  const handleVehicleClick = (vehicle: any) => {
    onSelectVehicle(vehicle);
  };

  const handleCustomerCreated = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    onSelectCustomer(customer);
    // In a real implementation, we'd add the customer to our list or fetch updated list
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="customer-search">Search Customer</Label>
          <Input
            id="customer-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, Email, or Phone"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <CustomerForm onCustomerCreated={handleCustomerCreated} />
      </div>

      {searchResults.length > 0 && !selectedCustomer && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-slate-100 p-2 font-medium">Search Results</div>
          <div className="divide-y">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                className="p-3 hover:bg-slate-50 cursor-pointer"
                onClick={() => handleCustomerClick(customer)}
              >
                <div className="font-medium">
                  {customer.first_name} {customer.last_name}
                </div>
                <div className="text-sm text-slate-500">
                  {customer.email} | {customer.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-slate-100 p-2 font-medium">
            Vehicles for {selectedCustomer.first_name} {selectedCustomer.last_name}
          </div>
          <div className="divide-y">
            {selectedCustomer.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-3 hover:bg-slate-50 cursor-pointer"
                onClick={() => handleVehicleClick(vehicle)}
              >
                <div className="font-medium">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div className="text-sm text-slate-500">
                  VIN: {vehicle.vin} | License: {vehicle.license_plate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
