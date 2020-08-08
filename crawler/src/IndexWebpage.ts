import { Client } from '@elastic/elasticsearch';
import { DownloadWebpageOutput } from './DownloadWebpage';

export interface EsConfig {
    client: Client;
    index: string;
}

export interface IndexWebpageInput {
    webpage: DownloadWebpageOutput
}

export async function indexWebpage(es: EsConfig, input: IndexWebpageInput): Promise<void> {
    await es.client.index({
        index: es.index,
        body: {
            "@timestamp": new Date(),
            url: input.webpage.canonicalUrl,
            title: input.webpage.title,
            bodyText: input.webpage.bodyText,
        }
    });
}
