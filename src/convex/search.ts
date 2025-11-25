"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { fetchOpenRouter } from "./lib/openrouter";
import { fetchGemini } from "./lib/gemini";
import { ModelResponse } from "./lib/types";
import { Id } from "./_generated/dataModel";

// Mapping from frontend model IDs to OpenRouter model IDs
const MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gemini-1.5-flash": "google/gemini-flash-1.5",
  "gemini-2.0-flash": "google/gemini-2.0-flash-exp",
  "llama-3.1-70b": "meta-llama/llama-3.1-70b-instruct",
  "mixtral-8x7b": "mistralai/mixtral-8x7b-instruct",
  "deepseek-r1": "deepseek/deepseek-r1",
};

const OPENROUTER_KEYS = [
  "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",
  "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",
];

const GOOGLE_KEY = "AIzaSyCESgbHlXlANYghs_agZpecFkYjbBTa9CM";

export const performSearch = action({
  args: {
    query: v.string(),
    models: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"searches">> => {
    const { query, models } = args;

    // 1. Create search entry
    const searchId: Id<"searches"> = await ctx.runMutation(internal.searchData.createSearch, {
      query,
      sources: models,
    });

    // 2. Run parallel requests
    const promises = models.map(async (modelId) => {
      let result: ModelResponse;
      
      // Route Gemini models to Google directly to distribute load
      if (modelId.includes("gemini")) {
        const googleModel = modelId === "gemini-2.0-flash" ? "gemini-2.0-flash-exp" : "gemini-1.5-flash";
        result = await fetchGemini(query, GOOGLE_KEY, googleModel);
      } else {
        // Use OpenRouter for others with key rotation
        const openRouterModelId = MODEL_MAP[modelId];
        
        if (!openRouterModelId) {
          await ctx.runMutation(internal.searchData.addResult, {
            searchId,
            modelId,
            content: "",
            latency: 0,
            status: "error",
            errorMessage: "Model not supported",
          });
          return null;
        }

        // Rotate OpenRouter keys
        const apiKey = OPENROUTER_KEYS[Math.floor(Math.random() * OPENROUTER_KEYS.length)];
        result = await fetchOpenRouter(query, apiKey, openRouterModelId);
      }

      // Store result
      await ctx.runMutation(internal.searchData.addResult, {
        searchId,
        modelId,
        content: result.content,
        latency: result.latency,
        tokens: result.tokens,
        status: result.error ? "error" : "success",
        errorMessage: result.error,
      });

      return result;
    });

    const results = (await Promise.all(promises)).filter((r): r is ModelResponse => r !== null && !r.error);

    // 3. Generate Fusion Answer
    if (results.length > 0) {
      const combinedText = results.map((r, i) => `Response ${i + 1}:\n${r.content}`).join("\n\n---\n\n");
      const fusionPrompt = `You are an expert synthesizer. Combine the following AI responses into a single, comprehensive, and accurate answer. Highlight the best parts of each. \n\nQuery: ${query}\n\n${combinedText}`;
      
      // Use OpenRouter (GPT-4o Mini) for fusion with key rotation
      const apiKey = OPENROUTER_KEYS[Math.floor(Math.random() * OPENROUTER_KEYS.length)];
      const fusionResult = await fetchOpenRouter(fusionPrompt, apiKey, "openai/gpt-4o-mini");
      
      // Calculate simple confidence score (mock logic)
      const confidenceScore = Math.min(95, 70 + (results.length * 5)); 

      await ctx.runMutation(internal.searchData.updateFusionAnswer, {
        searchId,
        fusionAnswer: fusionResult.content,
        confidenceScore,
      });
    }

    return searchId;
  },
});