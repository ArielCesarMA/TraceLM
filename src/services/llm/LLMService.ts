import { LLMProviderName, LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { LLMProvider } from './LLMProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class LLMService {
  private readonly provider: LLMProvider;

  constructor(providerName: LLMProviderName, apiKey: string) {
    this.provider = LLMService.createProvider(providerName, apiKey);
  }

  public complete(request: LLMRequest): Promise<LLMResponse> {
    return this.provider.complete(request);
  }

  public stream(request: LLMRequest, onChunk: StreamChunkHandler): Promise<LLMResponse> {
    return this.provider.stream(request, onChunk);
  }

  private static createProvider(providerName: LLMProviderName, apiKey: string): LLMProvider {
    switch (providerName) {
      case 'OpenAI':
        return new OpenAIProvider(apiKey);
      case 'Anthropic':
        return new AnthropicProvider(apiKey);
      case 'Gemini':
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }
  }
}
