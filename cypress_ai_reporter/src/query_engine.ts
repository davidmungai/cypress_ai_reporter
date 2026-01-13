import { esClient, INDEX_NAME } from './client';
import { getOllamaEmbedding } from './embeddings';
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const LLM_MODEL = 'gemma3'; // Or whatever model you have

export async function retrieveAndAnswer(query: string) {
  // 1. Embed query
  const queryVector = await getOllamaEmbedding(query);

  // 2. Search Elastic
  const response = await esClient.search({
    index: INDEX_NAME,
    knn: {
      field: 'embedding',
      query_vector: queryVector,
      k: 5,
      num_candidates: 50
    },
    _source: ['specName', 'testTitle', 'errorMessage', 'status', 'timestamp']
  });

  const hits = response.hits.hits;
  if (hits.length === 0) {
    return "No relevant test data found.";
  }

  // 3. Construct Context
  const context = hits.map((hit: any) => {
    const s = hit._source;
    return `Test: ${s.testTitle}
Status: ${s.status}
Spec: ${s.specName}
Error: ${s.errorMessage}
Timestamp: ${s.timestamp}
---`;
  }).join('\n');

  // 4. Chat with LLM
  try {
    const chatResponse = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are a QA assistant. Analyze the following Cypress test failures and answer the user question.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
      ],
      stream: false
    });
    return chatResponse.data.message.content;
  } catch (err) {
    console.error("LLM Error:", err);
    return "Error generating answer from LLM.";
  }
}
