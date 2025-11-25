export interface ModelResponse {
  content: string;
  latency: number;
  tokens?: number;
  error?: string;
}

export interface ModelConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
}
