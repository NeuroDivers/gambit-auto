
import React from "react";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

export function EmptyChatState({ usersLength, isLoading }: { usersLength?: number; isLoading?: boolean }) {
  return (
    <Card className="h-full flex items-center justify-center text-center">
      <div className="max-w-md p-6">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Select a conversation</h2>
        <p className="text-muted-foreground mt-2">
          Choose a person from the sidebar to start or continue a conversation
        </p>
        {usersLength === 0 && !isLoading && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-1">No users available</p>
            <p>There are no other users in the system yet. Once other users sign up, they will appear here.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
