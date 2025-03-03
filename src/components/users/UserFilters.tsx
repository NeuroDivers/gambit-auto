import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

type UserFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  excludedRoles?: string[];
  onExcludeRole?: (roleName: string) => void;
  onRemoveExcludedRole?: (roleName: string) => void;
  showStaffFilters?: boolean;
};

export const UserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  excludedRoles = [],
  onExcludeRole,
  onRemoveExcludedRole,
  showStaffFilters = false,
}: UserFiltersProps) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, nicename");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["staff_departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("department")
        .not("department", "is", null)
        .order("department");
      
      if (error) throw error;

      const uniqueDepartments = [...new Set(data.map(item => item.department))];
      return uniqueDepartments.filter(Boolean) as string[];
    },
    enabled: showStaffFilters,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="user-search"
            name="user-search"
            placeholder={showStaffFilters 
              ? "Search by name, email, department or position..." 
              : "Search by name or email..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background text-foreground border-input min-w-[300px]"
          />
        </div>
        <div className="sm:w-[220px]">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger id="role-filter" name="role-filter" className="w-full bg-background text-foreground border-input">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.nicename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showStaffFilters && departments && departments.length > 0 && (
          <div className="sm:w-[220px]">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="department-filter" name="department-filter" className="w-full bg-background text-foreground border-input">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {showStaffFilters && (
          <div className="sm:w-[220px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" name="status-filter" className="w-full bg-background text-foreground border-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="sm:w-[220px]">
          <Select 
            value="" 
            onValueChange={(value) => onExcludeRole?.(value)}
          >
            <SelectTrigger id="exclude-role-filter" name="exclude-role-filter" className="w-full bg-background text-foreground border-input">
              <SelectValue placeholder="Exclude roles" />
            </SelectTrigger>
            <SelectContent>
              {roles?.filter(role => !excludedRoles.includes(role.id)).map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.nicename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(excludedRoles.length > 0 || roleFilter !== 'all' || (showStaffFilters && (departmentFilter !== 'all' || statusFilter !== 'all'))) && (
        <div className="flex flex-wrap gap-2">
          {roleFilter !== 'all' && roles && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Role: {roles.find(r => r.name === roleFilter)?.nicename}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onRoleFilterChange('all')}
              />
            </Badge>
          )}
          
          {showStaffFilters && departmentFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Department: {departmentFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setDepartmentFilter('all')}
              />
            </Badge>
          )}
          
          {showStaffFilters && statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setStatusFilter('all')}
              />
            </Badge>
          )}
          
          {excludedRoles.map((roleId) => {
            const role = roles?.find(r => r.id === roleId);
            if (!role) return null;
            return (
              <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                Excluding {role.nicename}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onRemoveExcludedRole?.(roleId)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
