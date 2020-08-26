import { SQS } from 'aws-sdk';
import { config } from '../aws-config';
import { v4 } from 'uuid';
import { chunk, flatten, result } from 'lodash';
import util from 'util';
import { envConfig } from '../env-config';
import { loggerFactory } from '../logger';
const logger = loggerFactory('sqs');

const QueueUrl = envConfig.sqsUrl;
const sqs = new SQS(config);

let sendMessagesFlag = true;

export const initSqs = () => {
  setInterval(async () => {
    const queueSize = await getQueueSize();
    if (queueSize >= envConfig.maxSqsQueueSize) {
      logger.warn(`logger size ${queueSize} above threshold ${envConfig.maxSqsQueueSize}`);
    }
    sendMessagesFlag = queueSize < envConfig.maxSqsQueueSize;
  }, envConfig.checkSqsSizeInterval * 1000 * 60);
};


export const sendMessages = async (msgs: any[]) => {
  if (sendMessagesFlag) {
    const entries: SQS.SendMessageBatchRequestEntry[] = msgs.map(msg => ({
      Id: v4(),
      MessageBody: JSON.stringify(msg)
    }));

    const batches = chunk(entries, 10);
    const results = await Promise.all(
      batches.map(batch =>
        sqs.sendMessageBatch({ QueueUrl, Entries: batch }).promise()
      ));

    const totalResults = results.reduce((total, result) => {
      total.Failed.push(...result.Failed);
      total.Successful.push(...result.Successful);
      return total;
    }, { Failed: [], Successful: [] } as SQS.Types.SendMessageBatchResult);
    return totalResults;
  }
  return Promise.resolve();
};

const deleteMessage = (ReceiptHandle: string | undefined) => new Promise<{}>((resolve, reject) => {
  if (ReceiptHandle) {
    sqs.deleteMessage({ QueueUrl, ReceiptHandle }, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  }
  resolve();
});

export const receiveMessage = <T = Object>() => new Promise<T | null>((resolve, reject) => {
  sqs.receiveMessage({ QueueUrl, MaxNumberOfMessages: 1 }, (err, data) => {
    if (err) {
      reject(err);
    }
    else {
      if (data.Messages) {
        const ReceiptHandle = data.Messages?.[0]?.ReceiptHandle;
        deleteMessage(ReceiptHandle).catch(console.error);
        resolve(JSON.parse(data.Messages[0].Body || 'null'));
      } else {
        resolve(null);
      }
    }
  });
});

export const getQueueSize = async () => {
  const result = await sqs.getQueueAttributes({ QueueUrl, AttributeNames: ['ApproximateNumberOfMessages'] }).promise();
  const numberOfMessages = result.Attributes?.['ApproximateNumberOfMessages'] || '0';
  return parseInt(numberOfMessages, 10);
};

export const purgeQueue: () => Promise<any> = util.promisify((sqs.purgeQueue as any).bind(sqs, { QueueUrl }));
const resolveIn = (n: number) => new Promise(resolve => setTimeout(resolve, n * 1000));

export const waitUntilReceiveMessage = async <T = Object>({ shortInterval = 5, longInterval = 60 } = {}) => {
  let data: T | null = null;
  let shortIntervalLimit = 5;
  let counter = 0;
  while (true) {
    data = await receiveMessage<T>();
    if (data) {
      return data;
    }
    await resolveIn(counter++ < shortIntervalLimit ? shortInterval : longInterval);
  }
};