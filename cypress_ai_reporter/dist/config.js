"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.loadConfig = loadConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_CONFIG = {
    elasticNode: 'http://localhost:9200',
    indexName: 'cypress-test-logs',
    ollamaUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    chatModel: 'llava',
};
function loadConfig() {
    const potentialPaths = [
        process.env.CYPRESS_AI_CONFIG_PATH,
        path.resolve(process.cwd(), 'cypressAiReport.json'),
        path.resolve(process.cwd(), '../example/cypressAiReport.json'), // For local dev
        path.resolve(process.cwd(), '../cypressAiReport.json')
    ];
    for (const p of potentialPaths) {
        if (p && fs.existsSync(p)) {
            try {
                const content = fs.readFileSync(p, 'utf-8');
                const userConfig = JSON.parse(content);
                console.log(`Loaded configuration from ${p}`);
                return { ...DEFAULT_CONFIG, ...userConfig };
            }
            catch (err) {
                console.warn(`Failed to parse config at ${p}: ${err.message}`);
            }
        }
    }
    console.log('Using default configuration');
    return DEFAULT_CONFIG;
}
exports.config = loadConfig();
