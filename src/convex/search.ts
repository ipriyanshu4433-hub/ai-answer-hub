"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { fetchOpenAI } from "./lib/openai";
import { fetchGemini } from "./lib/gemini";
import { fetchGroq } from "./lib/groq";
import { ModelResponse } from "./lib/types";
import { Id } from "./_generated/dataModel";

export const performSearch = action({
  args: {
    query: v.string(),
    models: v.array(v.string()),
    apiKeys: v.optional(v.record(v.string(), v.string())), // For BYOK
  },
  handler: async (ctx, args): Promise<Id<"searches">> => {
    const { query, models, apiKeys } = args;

    // 1. Create search entry
    const searchId: Id<"searches"> = await ctx.runMutation(internal.searchData.createSearch, {
      query,
      sources: models,
      // userId: ... (can be added if we get auth context)
    });

    // 2. Define model handlers
    const modelHandlers: Record<string, (q: string, k: string) => Promise<ModelResponse>> = {
      "gpt-4o-mini": (q, k) => fetchOpenAI(q, k || process.env.OPENAI_API_KEY || "", "gpt-4o-mini"),
      "gemini-1.5-flash": (q, k) => fetchGemini(q, k || process.env.GEMINI_API_KEY || "", "gemini-1.5-flash"),
      "llama-3.1-70b": (q, k) => fetchGroq(q, k || process.env.GROQ_API_KEY || "", "llama-3.1-70b-versatile"),
      "mixtral-8x7b": (q, k) => fetchGroq(q, k || process.env.GROQ_API_KEY || "", "mixtral-8x7b-32768"),
      "deepseek-r1": (q, k) => fetchGroq(q, k || process.env.GROQ_API_KEY || "", "llama-3.1-70b-versatile"), // Placeholder using Groq for now as DeepSeek API varies
    };

    // 3. Run parallel requests
    const promises = models.map(async (modelId) => {
      const handler = modelHandlers[modelId];
      if (!handler) {
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

      // Get API key from args (BYOK) or env
      const key = apiKeys?.[modelId] || "";
      
      // Execute
      const result = await handler(query, key);

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

    // 4. Generate Fusion Answer
    if (results.length > 0) {
      const combinedText = results.map((r, i) => `Response ${i + 1}:\n${r.content}`).join("\n\n---\n\n");
      const fusionPrompt = `You are an expert synthesizer. Combine the following AI responses into a single, comprehensive, and accurate answer. Highlight the best parts of each. \n\nQuery: ${query}\n\n${combinedText}`;
      
      const fusionResult = await fetchOpenAI(fusionPrompt, process.env.OPENAI_API_KEY || "", "gpt-4o-mini");
      
      // Calculate simple confidence score (mock logic for now)
      // In a real app, we'd compare semantic similarity
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