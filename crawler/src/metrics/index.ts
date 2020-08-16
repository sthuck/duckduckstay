import { config } from '../aws-config';
import { CloudWatch } from 'aws-sdk';
import { promisify } from 'util';
import { chunk } from 'lodash';
import os from 'os';

const cloudWatch = new CloudWatch(config);
const Namespace = 'Crawler';
const reportMetricEveryXSeconds = 60;
const hostName = os.hostname();

const putMetricData: (opts: CloudWatch.Types.PutMetricDataInput) => Promise<{}> =
  promisify(cloudWatch.putMetricData.bind(cloudWatch));

export class CachedMetricReporter {
  // private cache = new Map<string, number>();
  private cache = 0;
  private timer: NodeJS.Timeout;

  constructor() {
    this.timer = setInterval(this.sendToCloudWatch.bind(this), reportMetricEveryXSeconds * 1000);
  }

  reportCrawl(url: string) {
    // const domain = new URL(url).host.replace(/^www\./, '');
    // this.cache.set(domain, (this.cache.get(domain) || 0) + 1);
    this.cache += 1;
  }

  flush() {
    clearInterval(this.timer);
    return this.sendToCloudWatch();
  }

  private async sendToCloudWatch() {
    const Value = this.cache;
    this.cache = 0;
    await putMetricData(
      {
        Namespace,
        MetricData: [
          {
            MetricName: 'crawled',
            Dimensions: [{ Name: 'workerHostName', Value: hostName }],
            Value
          }
        ],
      });
    //   if (this.cache.size > 0) {
    //     const entires = Array.from(this.cache.entries());
    //     this.cache = new Map();

    //     const metrics: CloudWatch.MetricData = entires.map(([domain, count]) => {
    //       return {
    //         MetricName: 'crawled',
    //         Dimensions: [
    //           { Name: 'domainName', Value: domain },
    //           { Name: 'workerHostName', Value: hostName }
    //         ]
    //         ,
    //         Value: count
    //       };
    //     });
    //     const chunks = chunk(metrics, 20);

    //     for (const chunk of chunks) {
    //       await putMetricData({ Namespace, MetricData: chunk });
    //     }
    //   }
  }


}