import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { ModelSelector, AVAILABLE_MODELS } from "./ModelSelector";
import { ResultCard } from "./ResultCard";
import { FusionAnswer } from "./FusionAnswer";
import { HistorySidebar } from "./HistorySidebar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function SearchInterface() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<Id<"searches"> | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o-mini", "gemini-2.0-flash", "llama-3.1-70b"]);
  
  const { isAuthenticated } = useAuth();
  const performSearch = useAction(api.search.performSearch);
  const searchResult = useQuery(api.searchData.getSearch, currentSearchId ? { searchId: currentSearchId } : "skip");

  // Load query from history if selected
  useEffect(() => {
    if (searchResult && searchResult.query !== query && !isSearching) {
      setQuery(searchResult.query);
    }
  }, [searchResult]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (selectedModels.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    setIsSearching(true);
    
    try {
      const id = await performSearch({
        query,
        models: selectedModels,
      });
      setCurrentSearchId(id);
    } catch (error) {
      toast.error("Search failed: " + (error as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col min-h-[calc(100vh-4rem)] relative">
      {/* Top Bar */}
      
      {isAuthenticated && (
        <div className="absolute top-4 left-4">
          <HistorySidebar 
            onSelectSearch={setCurrentSearchId} 
            currentSearchId={currentSearchId} 
          />
        </div>
      )}

      {/* Search Header */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col items-center ${currentSearchId ? "py-4 mt-8" : "py-20 mt-12"}`}>
        <h1 className={`font-bold tracking-tight text-center mb-8 transition-all ${currentSearchId ? "text-2xl" : "text-4xl md:text-6xl"}`}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AI Meta Search
          </span>
        </h1>
        
        <div className="w-full max-w-2xl space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className="h-14 pl-6 pr-14 text-lg rounded-full shadow-lg border-muted-foreground/10 focus-visible:ring-primary/20"
              disabled={isSearching}
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-2 top-2 h-10 w-10 rounded-full"
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : <ArrowRight className="h-5 w-5" />}
            </Button>
          </form>
          
          <div className="flex justify-center">
            <ModelSelector selectedModels={selectedModels} onModelToggle={toggleModel} />
          </div>
        </div>
      </div>

      {/* Results Area */}
      {currentSearchId && (
        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
          
          {/* Fusion Answer */}
          <FusionAnswer 
            content={searchResult?.fusionAnswer || ""} 
            confidenceScore={searchResult?.confidenceScore}
            isLoading={!searchResult?.fusionAnswer}
          />

          {/* Individual Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedModels.map((modelId) => {
              const result = searchResult?.results?.find(r => r.modelId === modelId);
              const modelInfo = AVAILABLE_MODELS.find(m => m.id === modelId);
              
              return (
                <ResultCard
                  key={modelId}
                  modelName={modelInfo?.name || modelId}
                  content={result?.content}
                  latency={result?.latency}
                  status={result?.status || (isSearching ? "loading" : "idle")}
                  errorMessage={result?.errorMessage}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}