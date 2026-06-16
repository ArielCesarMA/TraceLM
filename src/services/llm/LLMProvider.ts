import { LLMRequest, LLMResponse, StreamChunkHandler } from '../../types';

export interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
  stream(request: LLMRequest, onChunk: StreamChunkHandler): Promise<LLMResponse>;
}
