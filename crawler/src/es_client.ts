import { Client } from "@elastic/elasticsearch";
import { EsConfig } from "./IndexWebpage";

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
