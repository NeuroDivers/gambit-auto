
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type UserFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  excludedRoles?: string[];
  onExcludeRole?: (roleName: string) => void;
  onRemoveExcludedRole?: (roleName: string) => void;
};

export const UserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  excludedRoles = [],
  onExcludeRole,
  onRemoveExcludedRole,
}: UserFiltersProps) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="user-search"
            name="user-search"
            placeholder="Search by name or email..."
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
        <div className="sm:w-[220px]">
          <Select 
            value="" 
            onValueChange={(value) => onExcludeRole?.(value)}
          >
            <SelectTrigger id="exclude-role-filter" name="exclude-role-filter" className="w-full bg-background text-foreground border-input">
              <SelectValue placeholder="Exclude roles" />
            </SelectTrigger>
            <SelectContent>
              {roles?.filter(role => !excludedRoles.includes(role.name)).map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.nicename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active Filters */}
      {(excludedRoles.length > 0 || roleFilter !== 'all') && (
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
          {excludedRoles.map((roleName) => {
            const role = roles?.find(r => r.name === roleName);
            if (!role) return null;
            return (
              <Badge key={roleName} variant="secondary" className="flex items-center gap-1">
                Excluding: {role.nicename}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onRemoveExcludedRole?.(roleName)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
