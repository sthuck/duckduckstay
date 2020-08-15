import { downloadWebpage, cleanupDownloadedWebpage } from "./DownloadWebpage";
import { indexWebpage, EsConfig } from "./IndexWebpage";
import { sendMessages } from './sqs';
import { uniq } from 'lodash';
import { loggerFactory } from './logger';


export interface ProcessLinkInput {
  url: string;
}

export function processLinkFactory(workerId: number) {
  const logger = loggerFactory(`worker_${workerId}`);
  return async (es: EsConfig, input: ProcessLinkInput): Promise<void> => {
    logger.info(`got url: ${input.url}`);
    const rawWebpage = await downloadWebpage({
      url: input.url
    });

    const webpage = cleanupDownloadedWebpage(rawWebpage);

    await indexWebpage(es, {
      webpage: webpage
    });

    const linksToSqs: ProcessLinkInput[] = webpage.links.map(({ url }) => ({ url }));
    await sendMessages(linksToSqs);
  };
}
