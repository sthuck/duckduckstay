import { config } from '../aws-config';
import { DynamoDB } from 'aws-sdk';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { GetItemInput, GetItemOutput, PutItemInput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { envConfig } from '../env-config';
const DEFAULT_TTL_DAYS = 7;
const DEFAULT_TTL = 7 * 60 * 60 * 24;
const tableName = envConfig.dynamoDbTable;

const sha1 = (s: string) => {
  const sha1Hash = createHash('sha1');
  return sha1Hash.update(s).digest();
};

const dynamoDb = new DynamoDB(config);
const getItem: (opts: GetItemInput) => Promise<GetItemOutput> = promisify(dynamoDb.getItem.bind(dynamoDb));
const putItem: (opts: PutItemInput) => Promise<PutItemOutput> = promisify(dynamoDb.putItem.bind(dynamoDb));

export const markUrlAsDone = async (url: string, ttl = DEFAULT_TTL) => {
  const hashedUrl = sha1(url);
  const expireDate = Math.floor(new Date().getTime() / 1000) + (ttl);
  await putItem({
    TableName: tableName,
    Item: {
      urlHash: { B: hashedUrl }, expiredWhen: { N: expireDate.toString() }
    }
  });
};

export const isUrlMarkedAsDone = async (url: string) => {
  const hashedUrl = sha1(url);
  const item = await getItem({ TableName: tableName, Key: { urlHash: { B: hashedUrl } }, AttributesToGet: ['expiredWhen'] });
  const isDone = !!item.Item?.expiredWhen?.N;
  return isDone;
};