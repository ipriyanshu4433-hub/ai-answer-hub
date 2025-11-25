import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface HistorySidebarProps {
  onSelectSearch: (searchId: Id<"searches">) => void;
  currentSearchId: Id<"searches"> | null;
}

export function HistorySidebar({ onSelectSearch, currentSearchId }: HistorySidebarProps) {
  const history = useQuery(api.searchData.getUserHistory);
  const clearHistory = useMutation(api.searchData.clearHistory);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast.success("History cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:static">
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Search History</SheetTitle>
            {history && history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-2">
            {!history ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No history yet</div>
            ) : (
              history.map((item) => (
                <Button
                  key={item._id}
                  variant={currentSearchId === item._id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto py-3 px-4 text-left"
                  onClick={() => onSelectSearch(item._id)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 mt-1 shrink-0 opacity-50" />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="truncate font-medium">{item.query}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item._creationTime, { addSuffix: true })}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
