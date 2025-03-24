import { Client } from "@elastic/elasticsearch";
import config from "@/config/index";
const fs = require('fs');

export const esClient = new Client({
  node: config.elasticsearch.url,
  auth: {
    username: config.elasticsearch.username,  
    password: config.elasticsearch.password,
  },
  tls: {
    ca: fs.readFileSync('./src/config/http_ca.crt'),
    rejectUnauthorized: false,
}
});

export const checkElasticsearchConnection = async () => {
  try {
    const health = await esClient.cluster.health();
    console.log("Elasticsearch :", health.status);
  } catch (error) {
    console.error("❌ Elasticsearch connection error:", error);
  }
};
