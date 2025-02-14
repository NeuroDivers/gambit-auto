
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ServiceTypes() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold">Service Types</h1>
              <div className="max-w-md">
                <Input
                  type="search"
                  placeholder="Search service types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 border-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <ServiceTypesList searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
