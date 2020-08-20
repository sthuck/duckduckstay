import { SQS } from 'aws-sdk';
import { config } from '../aws-config';
import { v4 } from 'uuid';
import { chunk, flatten } from 'lodash';
import util from 'util';
import { envConfig } from '../env-config';

const QueueUrl = envConfig.sqsUrl;
const sqs = new SQS(config);


const sendMessageBatch = (params: SQS.Types.SendMessageBatchRequest) =>
  new Promise<SQS.Types.SendMessageBatchResult>((resolve, reject) => {
    sqs.sendMessageBatch(params, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });


export const sendMessages = async (msgs: any[]) => {
  const entries: SQS.SendMessageBatchRequestEntry[] = msgs.map(msg => ({
    Id: v4(),
    MessageBody: JSON.stringify(msg)
  }));

  const batches = chunk(entries, 10);
  const results = await Promise.all(
    batches.map(batch =>
      sendMessageBatch({ QueueUrl, Entries: batch })
    ));

  const totalResults = results.reduce((total, result) => {
    total.Failed.push(...result.Failed);
    total.Successful.push(...result.Successful);
    return total;
  }, { Failed: [], Successful: [] } as SQS.Types.SendMessageBatchResult);
  return totalResults;
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