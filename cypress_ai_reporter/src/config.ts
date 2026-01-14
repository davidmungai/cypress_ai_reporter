import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
    elasticNode: string;
    indexName: string;
    ollamaUrl: string;
    embeddingModel: string;
    chatModel: string;
}

const DEFAULT_CONFIG: AppConfig = {
    elasticNode: 'http://localhost:9200',
    indexName: 'cypress-test-logs',
    ollamaUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    chatModel: 'gemma3',
};

export function loadConfig(): AppConfig {
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
            } catch (err: any) {
                console.warn(`Failed to parse config at ${p}: ${err.message}`);
            }
        }
    }

    console.log('Using default configuration');
    return DEFAULT_CONFIG;
}

export const config = loadConfig();
