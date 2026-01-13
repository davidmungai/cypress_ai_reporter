import * as fs from 'fs';
import * as path from 'path';

const reportJsonPath = path.resolve(process.cwd(), '../example/cypressAiReport.json'); // Looking for cypressAiReport.json in example project for dev, or root for prod
const envFilePath = path.resolve(__dirname, '../.env');

interface InfrastructureConfig {
    elasticImage?: string;
    kibanaImage?: string;
    elasticPort?: number;
    kibanaPort?: number;
}

let infraConfig: InfrastructureConfig = {};

if (fs.existsSync(reportJsonPath)) {
    try {
        const fileContent = fs.readFileSync(reportJsonPath, 'utf-8');
        const jsonConfig = JSON.parse(fileContent);
        // Extract infrastructure related configs if they exist
        infraConfig = {
            elasticImage: jsonConfig.elasticImage || 'docker.elastic.co/elasticsearch/elasticsearch:8.11.1',
            kibanaImage: jsonConfig.kibanaImage || 'docker.elastic.co/kibana/kibana:8.11.1',
            elasticPort: jsonConfig.elasticPort || 9200,
            kibanaPort: jsonConfig.kibanaPort || 5601
        };
        console.log(`Loaded infrastructure config from ${reportJsonPath}`);
    } catch (e: any) {
        console.error('Error reading report.json:', e.message);
    }
} else {
    // defaults
    infraConfig = {
        elasticImage: 'docker.elastic.co/elasticsearch/elasticsearch:8.11.1',
        kibanaImage: 'docker.elastic.co/kibana/kibana:8.11.1',
        elasticPort: 9200,
        kibanaPort: 5601
    }
}

const envContent = `
ELASTIC_IMAGE=${infraConfig.elasticImage}
KIBANA_IMAGE=${infraConfig.kibanaImage}
ELASTIC_PORT=${infraConfig.elasticPort}
KIBANA_PORT=${infraConfig.kibanaPort}
`;

fs.writeFileSync(envFilePath, envContent.trim());
console.log(`Generated .env file at ${envFilePath}`);
