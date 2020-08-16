import { shutdownCluster, startPuppeteerCluster } from './crawling';
import { waitUntilReceiveMessage, sendMessages, purgeQueue } from './sqs';
import { DownloadWebpageInput } from './DownloadWebpage';
import { processLinkFactory } from './ProcessLink';
import { EsConfig } from './IndexWebpage';
import { range } from 'lodash';
import { loggerFactory } from './logger';
import { EventEmitter } from 'events';
import { Client as EsClient } from '@elastic/elasticsearch';
import { CachedMetricReporter } from './metrics';

const ES_INDEX = 'webpages';
const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY ? parseInt(process.env.MAX_CONCURRENCY, 10) : 4;

export enum DriverEvents {
  INIT = 'INIT',
  SHUTDOWN = 'SHUTDOWN'
}

export class Driver extends EventEmitter {
  private logger = loggerFactory('driver');
  private esConfig: EsConfig;
  private cachedMetricReporter = new CachedMetricReporter();

  constructor() {
    super();
    const ES = process.env['ES'];
    if (!ES) {
      throw new Error("ES env var required");
    }

    const client = new EsClient({ node: ES });
    this.esConfig = {
      client,
      index: ES_INDEX
    };
  }

  async init() {
    await startPuppeteerCluster(MAX_CONCURRENCY);
    this.emit(DriverEvents.INIT);
    process.on('SIGINT', this.shutdown.bind(this));
  }

  start() {
    this.logger.info(`starting ${MAX_CONCURRENCY} workers`);
    range(MAX_CONCURRENCY).forEach((i) =>
      this.worker(i));
  }

  private async worker(workerId: number) {
    const processLink = processLinkFactory(workerId, this.cachedMetricReporter);

    while (true) {
      try {
        const msg = await waitUntilReceiveMessage<DownloadWebpageInput>();
        await processLink(this.esConfig, msg);
      } catch (e) {
        this.logger.error(e);
      }
    }

  }

  async shutdown() {
    this.logger.info('shutting down...');

    await shutdownCluster();
    await this.cachedMetricReporter.flush();

    const listeners = this.rawListeners(DriverEvents.SHUTDOWN);
    await Promise.all(listeners.map(fn => fn()));
    process.exit();
  }
}
