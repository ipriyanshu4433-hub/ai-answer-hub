import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSearch = internalMutation({
  args: {
    query: v.string(),
    sources: v.array(v.string()),
    userId: v.optional(v.id("users")), // Optional, but we'll try to get it from auth
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("searches", {
      query: args.query,
      sources: args.sources,
      userId: userId || args.userId, // Use auth user if available
    });
  },
});

export const addResult = internalMutation({
  args: {
    searchId: v.id("searches"),
    modelId: v.string(),
    content: v.string(),
    latency: v.number(),
    tokens: v.optional(v.number()),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("loading")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("results", {
      searchId: args.searchId,
      modelId: args.modelId,
      content: args.content,
      latency: args.latency,
      tokens: args.tokens,
      status: args.status,
      errorMessage: args.errorMessage,
    });
  },
});

export const updateFusionAnswer = internalMutation({
  args: {
    searchId: v.id("searches"),
    fusionAnswer: v.string(),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.searchId, {
      fusionAnswer: args.fusionAnswer,
      confidenceScore: args.confidenceScore,
    });
  },
});

export const getSearch = query({
  args: { searchId: v.id("searches") },
  handler: async (ctx, args) => {
    const search = await ctx.db.get(args.searchId);
    if (!search) return null;
    const results = await ctx.db
      .query("results")
      .withIndex("by_search", (q) => q.eq("searchId", args.searchId))
      .collect();
    return { ...search, results };
  },
});

export const getUserHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  }
});

export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const searches = await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const search of searches) {
      await ctx.db.delete(search._id);
      // Note: We should also delete associated results, but for now we'll leave them orphaned or clean up later
      // Ideally we'd query results by searchId and delete them too
    }
  }
});