"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOllamaEmbedding = getOllamaEmbedding;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const OLLAMA_BASE_URL = config_1.config.ollamaUrl;
const EMBEDDING_MODEL = config_1.config.embeddingModel;
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
