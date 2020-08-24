import { Client } from '@elastic/elasticsearch';
import { DownloadWebpageOutput } from './DownloadWebpage';
import { EsConfig } from './es_client';

export interface IndexWebpageInput {
  webpage: DownloadWebpageOutput;
}

export async function indexWebpage(es: EsConfig, input: IndexWebpageInput): Promise<void> {
  if (es) { //TODO: remove me
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
}
