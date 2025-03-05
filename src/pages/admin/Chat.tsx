
import React from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatUserList } from "@/components/chat/sidebar/ChatUserList";
import { EmptyChatState } from "@/components/chat/EmptyChatState";
import { useChatUserList } from "@/components/chat/hooks/useChatUserList";

export default function Chat() {
  const {
    users,
    isLoading,
    isError,
    error,
    selectedUser,
    setSelectedUser,
    searchTerm,
    setSearchTerm,
    handleRefreshUsers
  } = useChatUserList();

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <ChatUserList
        users={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleRefreshUsers={handleRefreshUsers}
      />
      
      <div className="flex-1 h-[calc(100vh-5rem)]">
        {selectedUser ? (
          <ChatWindow recipientId={selectedUser} />
        ) : (
          <EmptyChatState usersLength={users?.length} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
