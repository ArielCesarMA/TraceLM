import { LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';
import { LLMProvider } from './LLMProvider';

export class GeminiProvider implements LLMProvider {
  constructor(private readonly apiKey: string) {}

  private normalizeModel(model: string): string {
    return model.trim().replace(/^models\//i, '');
  }

  private async listAvailableModels(): Promise<string[]> {
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this.apiKey)}`,
      `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(this.apiKey)}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as {
          models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
        };

        const names = (data.models ?? [])
          .filter((model) => (model.supportedGenerationMethods ?? []).includes('generateContent'))
          .map((model) => (model.name ?? '').replace(/^models\//i, '').trim())
          .filter((name) => name.length > 0);

        if (names.length > 0) {
          return names;
        }
      } catch {
        // Ignore and try the next endpoint.
      }
    }

    return [];
  }

  private async parseErrorDetail(response: Response): Promise<string> {
    try {
      const errorBody = (await response.json()) as {
        error?: { message?: string; status?: string };
      };
      return errorBody.error?.message ?? errorBody.error?.status ?? '';
    } catch {
      return '';
    }
  }

  public async complete(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is missing.');
    }

    const model = this.normalizeModel(request.model);
    if (!model) {
      throw new Error('Gemini model is required.');
    }

    const endpointCandidates = [
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
      `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(this.apiKey)}`
    ];

    const prompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    let lastStatus = 0;
    let lastDetail = '';

    for (const endpoint of endpointCandidates) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: request.temperature ?? 0.2
          }
        })
      });

      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return { text };
      }

      lastStatus = response.status;
      lastDetail = await this.parseErrorDetail(response);

      // If model was not found in this API version, try the next endpoint candidate.
      if (response.status === 404) {
        continue;
      }

      throw new Error(
        `Gemini request failed with status ${response.status}${
          lastDetail ? `: ${lastDetail}` : '.'
        }`
      );
    }

    const availableModels = await this.listAvailableModels();
    const suggestion =
      availableModels.length > 0
        ? ` Available models for this key include: ${availableModels.slice(0, 8).join(', ')}.`
        : '';
    throw new Error(
      `Gemini request failed with status ${lastStatus || 404}${
        lastDetail ? `: ${lastDetail}` : '.'
      } Model '${model}' may be unavailable for this API key.${suggestion}`
    );
  }

  public async stream(request: LLMRequest, onChunk: StreamChunkHandler): Promise<LLMResponse> {
    const result = await this.complete(request);
    onChunk(result.text);
    return result;
  }
}
