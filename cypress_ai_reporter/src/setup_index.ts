import { esClient, INDEX_NAME } from './client';

export async function setupIndex() {
  const exists = await esClient.indices.exists({ index: INDEX_NAME });

  if (!exists) {
    console.log(`Creating index ${INDEX_NAME}...`);
    await esClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          specName: { type: 'keyword' },
          testTitle: { type: 'text' },
          status: { type: 'keyword' },
          errorMessage: { type: 'text' },
          stackTrace: { type: 'text' },
          screenshotPath: { type: 'keyword' },
          timestamp: { type: 'date' },
          embedding: {
            type: 'dense_vector',
            dims: 768, // Match nomic-embed-text dimensions
            index: true,
            similarity: 'cosine'
          },
          image_embedding: {
            type: 'dense_vector',
            dims: 768, // Histogram: 256 * 3 = 768
            index: true,
            similarity: 'cosine'
          }
        }
      }
    });
    console.log('Index created.');
  } else {
    console.log(`Index ${INDEX_NAME} already exists. Updating mapping...`);
    try {
      await esClient.indices.putMapping({
        index: INDEX_NAME,
        properties: {
          image_embedding: {
            type: 'dense_vector',
            dims: 768,
            index: true,
            similarity: 'cosine'
          }
        }
      });
      console.log('Mapping updated.');
    } catch (e: any) {
      console.log('Mapping update failed (might already exist): ' + e.message);
    }
  }
}

if (require.main === module) {
  setupIndex().catch(console.error);
}
