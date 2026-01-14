export interface AppConfig {
    elasticNode: string;
    indexName: string;
    ollamaUrl: string;
    embeddingModel: string;
    chatModel: string;
}
export declare function loadConfig(): AppConfig;
export declare const config: AppConfig;
