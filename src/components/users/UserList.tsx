
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./UserCard";
import { useUserData } from "./hooks/useUserData";
import { useUserSubscription } from "./hooks/useUserSubscription";
import { UserListHeader } from "./UserListHeader";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface UserListProps {
  initialRoleFilter?: string;
}

const USERS_PER_PAGE = 10;

export const UserList = ({ initialRoleFilter = "all" }: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users, isLoading, error } = useUserData();
  const queryClient = useQueryClient();
  
  // Update roleFilter when initialRoleFilter changes
  useEffect(() => {
    if (initialRoleFilter !== roleFilter) {
      setRoleFilter(initialRoleFilter);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [initialRoleFilter, roleFilter]);
  
  // Set up realtime subscriptions
  useUserSubscription();

  // Log error if any
  if (error) {
    console.error("Error loading users:", error);
  }

  const filteredUsers = users?.filter(user => {
    // Name and email search
    const searchTerm = searchQuery.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm) || 
      email.includes(searchTerm);
    
    // Role filtering
    const matchesRole = roleFilter === "all" || 
      (user.role?.name && user.role.name.toLowerCase() === roleFilter.toLowerCase());
    
    console.log('Filtering user:', {
      user,
      searchTerm,
      matchesSearch,
      roleFilter,
      matchesRole
    });
    
    return matchesSearch && matchesRole;
  });

  const totalPages = filteredUsers ? Math.ceil(filteredUsers.length / USERS_PER_PAGE) : 0;
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserListHeader
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1); // Reset to first page when search changes
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(filter) => {
          console.log("Role filter changed to:", filter); // Debug log
          setRoleFilter(filter);
          setCurrentPage(1); // Reset to first page when role filter changes
        }}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <div className="space-y-4">
        {paginatedUsers?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {(!paginatedUsers || paginatedUsers.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
