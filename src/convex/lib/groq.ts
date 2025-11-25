import { ModelResponse } from "./types";

export async function fetchGroq(
  query: string,
  apiKey: string,
  model: string = "llama3-8b-8192"
): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await response.json();
    const latency = Date.now() - start;

    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API Error");
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
