import { Client as EsClient } from '@elastic/elasticsearch';
import { EventEmitter } from 'events';
import { range } from 'lodash';
import { shutdownCluster, startPuppeteerCluster } from './crawling';
import { DownloadWebpageInput } from './DownloadWebpage';
import { envConfig } from './env-config';
import { EsConfig } from './IndexWebpage';
import { loggerFactory } from './logger';
import { CachedMetricReporter } from './metrics';
import { processLinkFactory } from './ProcessLink';
import { initSqs, waitUntilReceiveMessage } from './sqs';
const { maxConcurrency, es: ES } = envConfig;

const ES_INDEX = 'webpages';

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
    const client = new EsClient({ node: ES });
    this.esConfig = {
      client,
      index: ES_INDEX
    };
  }

  async init() {
    await startPuppeteerCluster(maxConcurrency);
    initSqs();
    this.emit(DriverEvents.INIT);
    process.on('SIGINT', this.shutdown.bind(this));
  }

  start() {
    this.logger.info(`starting ${maxConcurrency} workers`);
    range(maxConcurrency).forEach((i) =>
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
