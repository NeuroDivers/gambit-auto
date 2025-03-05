
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { WorkOrderFormValues } from "@/types/work-order";

export function CustomerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { setValue } = useFormContext<WorkOrderFormValues>();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Mocked search results for now
      const mockResults = [
        { id: "1", first_name: "John", last_name: "Doe", email: "john@example.com", phone: "123-456-7890" },
        { id: "2", first_name: "Jane", last_name: "Smith", email: "jane@example.com", phone: "987-654-3210" }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error("Error searching for customers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setValue("customer_id", customer.id);
    setValue("customer_first_name", customer.first_name);
    setValue("customer_last_name", customer.last_name);
    setValue("customer_email", customer.email);
    setValue("customer_phone", customer.phone);
    
    // Also set direct fields for compatibility
    setValue("first_name", customer.first_name);
    setValue("last_name", customer.last_name);
    setValue("email", customer.email);
    setValue("phone_number", customer.phone);
    setValue("client_id", customer.id);
    
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      
      {searchResults.length > 0 && (
        <div className="border rounded-md mt-2 overflow-hidden">
          <div className="bg-muted p-2 text-sm font-medium">
            Search Results
          </div>
          <div className="divide-y">
            {searchResults.map((customer: any) => (
              <div 
                key={customer.id} 
                className="p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="font-medium">
                  {customer.first_name} {customer.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.email} • {customer.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
