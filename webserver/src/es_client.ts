import { Client } from "@elastic/elasticsearch";

export interface EsConfig {
    client: Client;
    index: string;
  }
  
  export function getEsConfig(): EsConfig {
    const ES = process.env['ES'];
    if (!ES) {
        throw new Error("ES env var required");
    }

    return {
        client: new Client({ node: ES }),
        index: "webpages"
    };
}
