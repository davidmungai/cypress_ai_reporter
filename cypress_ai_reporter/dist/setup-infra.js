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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const reportJsonPath = path.resolve(process.cwd(), '../example/cypressAiReport.json'); // Looking for cypressAiReport.json in example project for dev, or root for prod
const envFilePath = path.resolve(__dirname, '../.env');
let infraConfig = {};
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
    }
    catch (e) {
        console.error('Error reading report.json:', e.message);
    }
}
else {
    // defaults
    infraConfig = {
        elasticImage: 'docker.elastic.co/elasticsearch/elasticsearch:8.11.1',
        kibanaImage: 'docker.elastic.co/kibana/kibana:8.11.1',
        elasticPort: 9200,
        kibanaPort: 5601
    };
}
const envContent = `
ELASTIC_IMAGE=${infraConfig.elasticImage}
KIBANA_IMAGE=${infraConfig.kibanaImage}
ELASTIC_PORT=${infraConfig.elasticPort}
KIBANA_PORT=${infraConfig.kibanaPort}
`;
fs.writeFileSync(envFilePath, envContent.trim());
console.log(`Generated .env file at ${envFilePath}`);
