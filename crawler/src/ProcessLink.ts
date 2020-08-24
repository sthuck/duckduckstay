import { downloadWebpage, cleanupDownloadedWebpage } from "./DownloadWebpage";
import { indexWebpage, EsConfig } from "./IndexWebpage";
import { sendMessages } from './sqs';
import { uniq } from 'lodash';
import { loggerFactory } from './logger';
import { CachedMetricReporter } from "./metrics";
import { isUrlMarkedAsDone, markUrlAsDone } from './url-tracking';

export type ProcessLinkInput = {
  url: string;
};

export function processLinkFactory(workerId: number, metricReporter: CachedMetricReporter) {
  const logger = loggerFactory(`worker_${workerId}`);

  return async (es: EsConfig, input: ProcessLinkInput): Promise<void> => {
    logger.info(`got url: ${input.url}`);
    const isDone = await isUrlMarkedAsDone(input.url);

    if (isDone) {
      return;
    }

    const rawWebpage = await downloadWebpage({
      url: input.url
    }).catch(e => {
      logger.error(`error in worker ${workerId}, url: ${input.url}`);
      throw e;
    });

    metricReporter.reportCrawl(input.url);

    const webpage = cleanupDownloadedWebpage(rawWebpage);

    await indexWebpage(es, {
      webpage: webpage
    });

    const linksToSqs: ProcessLinkInput[] = uniq(webpage.links.map(({ url }) => url)).map(url => ({ url }));
    await Promise.all([markUrlAsDone(input.url), sendMessages(linksToSqs)]);
  };
}
