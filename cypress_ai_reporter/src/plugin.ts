/// <reference types="cypress" />
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';

interface PluginConfig {
  elasticNode?: string;
  indexName?: string;
  ollamaUrl?: string;
  embeddingModel?: string;
}

export function cypressAiReporter(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions, pluginConfig: PluginConfig = {}) {
  const esNode = pluginConfig.elasticNode || 'http://localhost:9200';
  const indexName = pluginConfig.indexName || 'cypress-test-logs';
  const ollamaUrl = pluginConfig.ollamaUrl || 'http://localhost:11434';
  const embeddingModel = pluginConfig.embeddingModel || 'nomic-embed-text';

  const esClient = new Client({ node: esNode });

  on('after:spec', async (spec: any, results: any) => {
    if (results && results.tests) {
      for (const test of results.tests) {
        const doc: any = {
          specName: spec.name,
          testTitle: test.title.join(' > '),
          status: test.state,
          errorMessage: test.displayError || '',
          stackTrace: test.stack || '',
          video: results.video,
          timestamp: new Date().toISOString(),
          screenshotPath: results.screenshots && results.screenshots.find((s: any) => s.path.includes(test.title[test.title.length - 1]))?.path || ''
        };

        // Generate embedding for error message to allow querying by failure semantics
        if (doc.errorMessage) {
          try {
            const embeddingResp = await axios.post(`${ollamaUrl}/api/embeddings`, {
              model: embeddingModel,
              prompt: doc.errorMessage + " " + doc.testTitle
            });
            doc.embedding = embeddingResp.data.embedding;
          } catch (err: any) {
            console.error('Failed to generate embedding for test failure:', err.message);
          }
        } else if (doc.testTitle) {
          // Also embed title for passed tests or generic search
          try {
            const embeddingResp = await axios.post(`${ollamaUrl}/api/embeddings`, {
              model: embeddingModel,
              prompt: doc.testTitle
            });
            doc.embedding = embeddingResp.data.embedding;
          } catch (err: any) {
            console.error('Failed to generate embedding for test title:', err.message);
          }
        }

        try {
          await esClient.index({
            index: indexName,
            document: doc
          });
          console.log(`Indexed test result: ${doc.testTitle}`);
        } catch (err: any) {
          console.error('Failed to index test result to Elastic:', err.message);
        }
      }
    }
  });
}
