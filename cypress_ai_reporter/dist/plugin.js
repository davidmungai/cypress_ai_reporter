"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypressAiReporter = cypressAiReporter;
/// <reference types="cypress" />
const elasticsearch_1 = require("@elastic/elasticsearch");
const axios_1 = __importDefault(require("axios"));
function cypressAiReporter(on, config, pluginConfig = {}) {
    const esNode = pluginConfig.elasticNode || 'http://localhost:9200';
    const indexName = pluginConfig.indexName || 'cypress-test-logs';
    const ollamaUrl = pluginConfig.ollamaUrl || 'http://localhost:11434';
    const embeddingModel = pluginConfig.embeddingModel || 'nomic-embed-text';
    const esClient = new elasticsearch_1.Client({ node: esNode });
    on('after:spec', async (spec, results) => {
        var _a;
        if (results && results.tests) {
            for (const test of results.tests) {
                const doc = {
                    specName: spec.name,
                    testTitle: test.title.join(' > '),
                    status: test.state,
                    errorMessage: test.displayError || '',
                    stackTrace: test.stack || '',
                    video: results.video,
                    timestamp: new Date().toISOString(),
                    screenshotPath: results.screenshots && ((_a = results.screenshots.find((s) => s.path.includes(test.title[test.title.length - 1]))) === null || _a === void 0 ? void 0 : _a.path) || ''
                };
                // Generate embedding for error message to allow querying by failure semantics
                if (doc.errorMessage) {
                    try {
                        const embeddingResp = await axios_1.default.post(`${ollamaUrl}/api/embeddings`, {
                            model: embeddingModel,
                            prompt: doc.errorMessage + " " + doc.testTitle
                        });
                        doc.embedding = embeddingResp.data.embedding;
                    }
                    catch (err) {
                        console.error('Failed to generate embedding for test failure:', err.message);
                    }
                }
                else if (doc.testTitle) {
                    // Also embed title for passed tests or generic search
                    try {
                        const embeddingResp = await axios_1.default.post(`${ollamaUrl}/api/embeddings`, {
                            model: embeddingModel,
                            prompt: doc.testTitle
                        });
                        doc.embedding = embeddingResp.data.embedding;
                    }
                    catch (err) {
                        console.error('Failed to generate embedding for test title:', err.message);
                    }
                }
                try {
                    await esClient.index({
                        index: indexName,
                        document: doc
                    });
                    console.log(`Indexed test result: ${doc.testTitle}`);
                }
                catch (err) {
                    console.error('Failed to index test result to Elastic:', err.message);
                }
            }
        }
    });
}
