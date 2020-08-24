import { Client } from "@elastic/elasticsearch";
import { envConfig } from "./env-config";
const { es: ES } = envConfig;

export interface EsConfig {
  client: Client;
  index: string;
}

export function getEsConfig(): EsConfig {
  return {
    client: new Client({ node: ES }),
    index: "webpages"
  };
}
