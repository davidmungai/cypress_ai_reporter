"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_index_1 = require("./setup_index");
console.log("AI Reporter Backend Loaded.");
console.log("Run 'npm run query' to ask questions about tests.");
console.log("Ensure ElasticSearch and Ollama are running.");
// Optional: Run setup on start
if (require.main === module) {
    (0, setup_index_1.setupIndex)();
}
