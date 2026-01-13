/// <reference types="cypress" />
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface PluginConfig {
  elasticNode?: string;
  indexName?: string;
  ollamaUrl?: string;
  embeddingModel?: string;
  chatModel?: string;
  reportDir?: string;
}

export function cypressAiReporter(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions, pluginConfig: PluginConfig = {}) {
  // Load cypressAiReport.json if exists
  const reportJsonPath = path.resolve(config.projectRoot || process.cwd(), 'cypressAiReport.json');
  let fileConfig: PluginConfig = {};

  if (fs.existsSync(reportJsonPath)) {
    try {
      const fileContent = fs.readFileSync(reportJsonPath, 'utf-8');
      fileConfig = JSON.parse(fileContent);
      console.log(`Loaded configuration from ${reportJsonPath}`);
    } catch (e: any) {
      console.error('Error reading cypressAiReport.json:', e.message);
    }
  }

  const finalConfig = { ...pluginConfig, ...fileConfig };

  const esNode = finalConfig.elasticNode || 'http://localhost:9200';
  const indexName = finalConfig.indexName || 'cypress-test-logs';
  const ollamaUrl = finalConfig.ollamaUrl || 'http://localhost:11434';
  const embeddingModel = finalConfig.embeddingModel || 'nomic-embed-text';
  const chatModel = finalConfig.chatModel || 'gemma3';
  const reportDir = finalConfig.reportDir || 'cypress/reports';

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

  on('after:run', async (results: any) => {
    if (results.status === 'failed') {
      console.error('Cypress run failed with exit code:', results.failures);
      return;
    }

    const failedTests: any[] = [];
    const allTests: any[] = [];
    let aiAnalysis = '';

    if (results.runs) {
      results.runs.forEach((run: any) => {
        run.tests.forEach((test: any) => {
          const testInfo = {
            spec: run.spec.name,
            title: test.title.join(' > '),
            state: test.state,
            error: test.displayError,
            duration: test.duration
          };
          allTests.push(testInfo);
          if (test.state === 'failed') {
            failedTests.push(testInfo);
          }
        });
      });
    }

    if (failedTests.length > 0) {
      console.log('\n--- AI Analysis of Test Failures ---');
      const failuresContext = failedTests.map((t, i) =>
        `${i + 1}. [${t.spec}] ${t.title}\nError: ${t.error}`
      ).join('\n\n');

      try {
        const response = await axios.post(`${ollamaUrl}/api/chat`, {
          model: chatModel,
          messages: [
            { role: 'system', content: 'You are a QA automation expert. Analyze the test failures and provide a single sentence summary following this exact format: "On the [Page/Feature Name], when [Action or Condition], then [Error or Failure Description]". Do not add any other text.' },
            { role: 'user', content: `Here are the test failures from the run:\n\n${failuresContext}` }
          ],
          stream: false
        });

        aiAnalysis = response.data.message.content;
        console.log(aiAnalysis);
        console.log('------------------------------------\n');
      } catch (err: any) {
        console.error('Failed to generate AI report:', err.message);
        aiAnalysis = `Error generating AI analysis: ${err.message}`;
      }
    } else {
      console.log('\n--- AI Report: All tests passed! ---\n');
      aiAnalysis = 'All tests passed successfully.';
    }

    // Generate JSON Report
    try {
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = `ai-report-${timestamp}.json`;
      const reportPath = path.join(reportDir, reportFilename);

      const reportData = {
        timestamp: new Date().toISOString(),
        totalTests: results.totalTests,
        totalPassed: results.totalPassed,
        totalFailed: results.totalFailed,
        totalPending: results.totalPending,
        totalSkipped: results.totalSkipped,
        browserName: results.browserName,
        browserVersion: results.browserVersion,
        osName: results.osName,
        osVersion: results.osVersion,
        aiAnalysis: aiAnalysis,
        tests: allTests
      };

      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`AI JSON Report generated: ${reportPath}`);
    } catch (err: any) {
      console.error('Failed to generate JSON report:', err.message);
    }
  });
}
