
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Trash2, Database } from "lucide-react";

export function CacheClearManager() {
  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      toast.success("Local storage cleared successfully");
    } catch (error) {
      console.error("Error clearing local storage:", error);
      toast.error("Failed to clear local storage");
    }
  };

  const clearSessionStorage = () => {
    try {
      sessionStorage.clear();
      toast.success("Session storage cleared successfully");
    } catch (error) {
      console.error("Error clearing session storage:", error);
      toast.error("Failed to clear session storage");
    }
  };

  const clearBrowserCache = () => {
    try {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
        toast.success("Browser cache cleared successfully");
      } else {
        toast.error("Browser cache API not available");
      }
    } catch (error) {
      console.error("Error clearing browser cache:", error);
      toast.error("Failed to clear browser cache");
    }
  };

  const reloadApplication = () => {
    window.location.reload();
  };

  const clearAllAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      toast.success("All caches cleared, reloading app...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error during clear all operation:", error);
      toast.error("Failed to clear all caches");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>
          Clear application caches and storage to resolve unexpected behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Storage</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={clearLocalStorage} className="justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Local Storage
              </Button>
              <Button variant="outline" onClick={clearSessionStorage} className="justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Session Storage
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Browser Cache</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={clearBrowserCache} className="justify-start">
                <Database className="mr-2 h-4 w-4" />
                Clear Browser Cache
              </Button>
              <Button variant="outline" onClick={reloadApplication} className="justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t">
          <Button onClick={clearAllAndReload} variant="destructive" className="w-full">
            Clear All Caches and Reload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
