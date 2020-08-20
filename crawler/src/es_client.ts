import { Client } from "@elastic/elasticsearch";
import { EsConfig } from "./IndexWebpage";
import { envConfig } from "./env-config";
const { es: ES } = envConfig;

export function getEsConfig(): EsConfig {
  return {
    client: new Client({ node: ES }),
    index: "webpages"
  };
}
