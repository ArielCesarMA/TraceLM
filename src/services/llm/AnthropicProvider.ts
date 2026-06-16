import { LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';
import { LLMProvider } from './LLMProvider';

export class AnthropicProvider implements LLMProvider {
  constructor(private readonly apiKey: string) {}

  public async complete(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is missing.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: 2000,
        temperature: request.temperature ?? 0.2,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };

    const text = data.content?.[0]?.text ?? '';
    return { text };
  }

  public async stream(request: LLMRequest, onChunk: StreamChunkHandler): Promise<LLMResponse> {
    const result = await this.complete(request);
    onChunk(result.text);
    return result;
  }
}
