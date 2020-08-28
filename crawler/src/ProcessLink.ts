import { downloadWebpage, cleanupDownloadedWebpage } from "./DownloadWebpage";
import { indexWebpage, EsConfig } from "./IndexWebpage";
import { sendMessages, getQueueSize } from './sqs';
import { uniq, shuffle } from 'lodash';
import { loggerFactory } from './logger';
import { CachedMetricReporter } from "./metrics";
import { isUrlMarkedAsDone, markUrlAsDone } from './url-tracking';
import { envConfig } from './env-config';
import { saveWebpageScreenshot } from "./SaveWebpageScreenshot";

export type ProcessLinkInput = {
  url: string;
};

export function processLinkFactory(workerId: number, metricReporter: CachedMetricReporter) {
  const logger = loggerFactory(`worker_${workerId}`);

  return async (es: EsConfig, s3Bucket: string, input: ProcessLinkInput): Promise<void> => {
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

    const saveWebpageScreenAction: Promise<void> = webpage.screenshot !== null
      ? saveWebpageScreenshot(s3Bucket, webpage.canonicalUrl, webpage.screenshot)
      : Promise.resolve();

    const indexWebpageAction: Promise<void> = indexWebpage(es, {
      webpage: webpage
    });

    await Promise.all([saveWebpageScreenAction, indexWebpageAction]);

    const linksToSqs: ProcessLinkInput[] = shuffle(uniq(webpage.links.map(({ url }) => url).map(url => ({ url }))))
      .slice(0, envConfig.maxLinksFromPage);
    await markUrlAsDone(input.url);
    await sendMessages(linksToSqs);
  };
}
