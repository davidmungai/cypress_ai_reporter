"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIndex = setupIndex;
const client_1 = require("./client");
async function setupIndex() {
    const exists = await client_1.esClient.indices.exists({ index: client_1.INDEX_NAME });
    if (!exists) {
        console.log(`Creating index ${client_1.INDEX_NAME}...`);
        await client_1.esClient.indices.create({
            index: client_1.INDEX_NAME,
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
                    }
                }
            }
        });
        console.log('Index created.');
    }
    else {
        console.log(`Index ${client_1.INDEX_NAME} already exists.`);
    }
}
if (require.main === module) {
    setupIndex().catch(console.error);
}
