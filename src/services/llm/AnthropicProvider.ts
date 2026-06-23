import { LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';
import { LLMProvider } from './LLMProvider';

export class AnthropicProvider implements LLMProvider {
  constructor(private readonly apiKey: string) {}

  private static readonly TIMEOUT_MS = 120_000;

  public async complete(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is missing.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AnthropicProvider.TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: 4096,
          temperature: request.temperature ?? 0.2,
          system: request.systemPrompt,
          messages: [{ role: 'user', content: request.prompt }]
        }),
        signal: controller.signal
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error('Anthropic request timed out after 120 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

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
