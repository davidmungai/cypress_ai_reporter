import { setupIndex } from './setup_index';

console.log("AI Reporter Backend Loaded.");
console.log("Run 'npm run query' to ask questions about tests.");
console.log("Ensure ElasticSearch and Ollama are running.");

// Optional: Run setup on start
if (require.main === module) {
    setupIndex();
}
