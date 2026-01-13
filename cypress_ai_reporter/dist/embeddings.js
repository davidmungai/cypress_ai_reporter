"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOllamaEmbedding = getOllamaEmbedding;
const axios_1 = __importDefault(require("axios"));
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text'; // Ensure you have this model pulled in Ollama
async function getOllamaEmbedding(text) {
    try {
        const response = await axios_1.default.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
            model: EMBEDDING_MODEL,
            prompt: text,
        });
        return response.data.embedding;
    }
    catch (error) {
        console.error('Error getting embedding:', error);
        throw error;
    }
}
