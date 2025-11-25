import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gemini-1.5-flash", name: "Gemini Flash 2.0", provider: "Google" },
  { id: "llama-3.1-70b", name: "Llama 3.1", provider: "Groq" },
  { id: "mixtral-8x7b", name: "Mixtral 8x7b", provider: "Groq" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek" },
];

interface ModelSelectorProps {
  selectedModels: string[];
  onModelToggle: (modelId: string) => void;
}

export function ModelSelector({ selectedModels, onModelToggle }: ModelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {AVAILABLE_MODELS.map((model) => {
        const isSelected = selectedModels.includes(model.id);
        return (
          <Badge
            key={model.id}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
              isSelected ? "hover:opacity-90" : "hover:bg-muted"
            }`}
            onClick={() => onModelToggle(model.id)}
          >
            {isSelected ? <Check className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
            {model.name}
          </Badge>
        );
      })}
    </div>
  );
}
