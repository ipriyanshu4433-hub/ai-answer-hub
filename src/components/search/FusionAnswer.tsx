import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface FusionAnswerProps {
  content: string;
  confidenceScore?: number;
  isLoading: boolean;
}

export function FusionAnswer({ content, confidenceScore, isLoading }: FusionAnswerProps) {
  if (!content && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8"
    >
      <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Sparkles className="w-5 h-5" />
              Fusion Answer
            </CardTitle>
            {confidenceScore && (
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20">
                <BrainCircuit className="w-3 h-3 mr-1" />
                {confidenceScore}% Confidence
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-primary/10 rounded w-3/4" />
              <div className="h-4 bg-primary/10 rounded w-full" />
              <div className="h-4 bg-primary/10 rounded w-5/6" />
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                {content}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
