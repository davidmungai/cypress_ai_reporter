import axios from 'axios';
import { config } from './config';

const OLLAMA_BASE_URL = config.ollamaUrl;
const EMBEDDING_MODEL = config.embeddingModel;

export async function getOllamaEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: EMBEDDING_MODEL,
      prompt: text,
    });
    return response.data.embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}
