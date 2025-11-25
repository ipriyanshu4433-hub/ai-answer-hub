import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ResultCardProps {
  modelName: string;
  content?: string;
  latency?: number;
  status: "loading" | "success" | "error" | "idle";
  errorMessage?: string;
}

export function ResultCard({ modelName, content, latency, status, errorMessage }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-muted-foreground/20 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 bg-muted/30 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {modelName}
            </CardTitle>
            {status === "success" && latency && (
              <Badge variant="secondary" className="text-xs font-normal h-5">
                <Clock className="w-3 h-3 mr-1" />
                {latency}ms
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 min-h-[200px] relative">
          <ScrollArea className="h-[300px] w-full pr-4">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs">Generating response...</span>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-destructive">
                <AlertCircle className="w-8 h-8 mb-2" />
                <span className="text-sm text-center">{errorMessage || "Failed to generate response"}</span>
              </div>
            )}

            {status === "success" && (
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              </div>
            )}
            
            {status === "idle" && (
              <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground/50">
                <Zap className="w-8 h-8 mb-2 opacity-20" />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
