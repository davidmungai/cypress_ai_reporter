import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { config } from './config';

dotenv.config();

export const esClient = new Client({
  node: config.elasticNode || process.env.ES_URL || 'http://localhost:9200',
});

export const INDEX_NAME = config.indexName;
