
import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
}

