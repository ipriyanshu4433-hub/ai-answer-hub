import { ModelResponse } from "./types";

export async function fetchOpenRouter(
  query: string,
  apiKey: string,
  model: string
): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vly.ai", // Required by OpenRouter
        "X-Title": "AI Answer Hub", // Optional
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await response.json();
    const latency = Date.now() - start;

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenRouter API Error");
    }

    return {
      content: data.choices[0].message.content,
      latency,
      tokens: data.usage?.total_tokens,
    };
  } catch (error) {
    return {
      content: "",
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
