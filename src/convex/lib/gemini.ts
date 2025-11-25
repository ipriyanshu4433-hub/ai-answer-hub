import { ModelResponse } from "./types";

export async function fetchGemini(
  query: string,
  apiKey: string,
  model: string = "gemini-1.5-flash"
): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    });

    const data = await response.json().catch(() => null);
    const latency = Date.now() - start;

    if (!response.ok) {
      throw new Error(data?.error?.message || response.statusText || "Gemini API Error");
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!content && !data.error) {
       throw new Error("Empty response from Gemini");
    }
    
    return {
      content,
      latency,
      tokens: 0, // Gemini doesn't always return token usage in simple response
    };
  } catch (error) {
    return {
      content: "",
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
