interface PluginConfig {
    elasticNode?: string;
    indexName?: string;
    ollamaUrl?: string;
    embeddingModel?: string;
}
export declare function cypressAiReporter(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions, pluginConfig?: PluginConfig): void;
export {};
