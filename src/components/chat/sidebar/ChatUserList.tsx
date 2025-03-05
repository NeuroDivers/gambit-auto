import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Circle, CircleCheck, User, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChatUser } from "@/types/chat";

interface ChatUserListProps {
  users: (ChatUser & { unread_count: number; is_online: boolean })[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleRefreshUsers: () => void;
}

export function ChatUserList({
  users,
  isLoading,
  isError,
  error,
  selectedUser,
  setSelectedUser,
  searchTerm,
  setSearchTerm,
  handleRefreshUsers
}: ChatUserListProps) {
  const getUserDisplayName = (user: ChatUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || "Unknown User";
  };

  // Filter users based on search term
  const filteredUsers = users?.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return displayName.includes(searchLower) || email.includes(searchLower);
  }) || [];

  // Separate users with unread messages
  const unreadUsers = filteredUsers.filter(user => user.unread_count > 0) || [];
  const otherUsers = filteredUsers.filter(user => !user.unread_count) || [];

  // Group remaining users by role
  const groupedUsers = otherUsers.reduce((acc, user) => {
    const roleName = user.role?.nicename || "Other";
    if (!acc[roleName]) {
      acc[roleName] = [];
    }
    acc[roleName].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  return (
    <Card className="w-72 flex flex-col">
      <div className="p-3 border-b">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleRefreshUsers}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh Users"}
        </Button>
      </div>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full py-2">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unread Messages Section */}
              {unreadUsers.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="px-3 pb-1">
                    <h3 className="text-sm font-semibold text-destructive">Unread Messages</h3>
                  </div>
                  {unreadUsers.map((user) => (
                    <ChatUserItem 
                      key={user.id}
                      user={user}
                      isSelected={selectedUser === user.id}
                      onClick={() => setSelectedUser(user.id)}
                      getUserDisplayName={getUserDisplayName}
                    />
                  ))}
                  <Separator className="my-2" />
                </div>
              )}

              {/* Other Users Grouped by Role */}
              {Object.entries(groupedUsers).map(([role, users]) => (
                <div key={role} className="space-y-1 pt-2">
                  <div className="px-3 pb-1">
                    <h3 className="text-sm font-semibold text-muted-foreground">{role}</h3>
                  </div>
                  {users?.map((user) => (
                    <ChatUserItem 
                      key={user.id}
                      user={user}
                      isSelected={selectedUser === user.id}
                      onClick={() => setSelectedUser(user.id)}
                      getUserDisplayName={getUserDisplayName}
                    />
                  ))}
                  {users && users.length > 0 && <Separator className="my-2" />}
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <EmptyUserList 
                  isError={isError} 
                  searchTerm={searchTerm}
                  handleRefreshUsers={handleRefreshUsers}
                  users={users}
                />
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ChatUserItemProps {
  user: ChatUser & { unread_count: number; is_online: boolean };
  isSelected: boolean;
  onClick: () => void;
  getUserDisplayName: (user: ChatUser) => string;
}

function ChatUserItem({ user, isSelected, onClick, getUserDisplayName }: ChatUserItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted"
      }`}
    >
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>{getUserDisplayName(user).substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {user.is_online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium">{getUserDisplayName(user)}</p>
          {user.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 text-xs"
            >
              {user.unread_count}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {user.role?.nicename || "User"}
        </p>
      </div>
    </button>
  );
}

interface EmptyUserListProps {
  isError: boolean;
  searchTerm: string;
  users: any[] | undefined;
  handleRefreshUsers: () => void;
}

function EmptyUserList({ isError, searchTerm, users, handleRefreshUsers }: EmptyUserListProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-10 w-10 mb-2 text-muted-foreground" />
      <h3 className="font-medium">
        {isError ? "Failed to load users" : "No users found"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        {searchTerm 
          ? "Try a different search term" 
          : isError 
            ? "There was an error loading the user list"
            : users && users.length === 0 
              ? "No other users exist yet in the system" 
              : "Try refreshing the user list"}
      </p>
      {(isError || users?.length === 0) && (
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefreshUsers}
          className="mt-4"
        >
          Refresh Users
        </Button>
      )}
    </div>
  );
}
