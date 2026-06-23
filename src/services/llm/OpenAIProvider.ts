import { LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';
import { LLMProvider } from './LLMProvider';

export class OpenAIProvider implements LLMProvider {
  constructor(private readonly apiKey: string) {}

  private static readonly TIMEOUT_MS = 120_000;

  public async complete(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OpenAIProvider.TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: request.model,
          temperature: request.temperature ?? 0.2,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ]
        }),
        signal: controller.signal
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error('OpenAI request timed out after 120 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content ?? '';
    return { text };
  }

  public async stream(request: LLMRequest, onChunk: StreamChunkHandler): Promise<LLMResponse> {
    const result = await this.complete(request);
    onChunk(result.text);
    return result;
  }
}
