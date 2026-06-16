export type LLMProviderName = 'OpenAI' | 'Anthropic' | 'Gemini';

export interface TraceLMSettings {
  llmProvider: LLMProviderName;
  llmModel: string;
  llmApiKey: string;
  jiraUrl: string;
  jiraProjectKey: string;
  jiraEmail: string;
  jiraApiToken: string;
  xrayClientId: string;
  xrayClientSecret: string;
}

export interface LLMRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface LLMResponse {
  text: string;
}

export type StreamChunkHandler = (chunk: string) => void;
