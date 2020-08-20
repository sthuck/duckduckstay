import { config } from '../aws-config';
import { DynamoDB } from 'aws-sdk';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { GetItemInput, GetItemOutput, PutItemInput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { envConfig } from '../env-config';

const tableName = envConfig.dynamoDbTable;

const sha1 = (s: string) => {
  const sha1Hash = createHash('sha1');
  return sha1Hash.update(s).digest();
};

const dynamoDb = new DynamoDB(config);
const getItem: (opts: GetItemInput) => Promise<GetItemOutput> = promisify(dynamoDb.getItem.bind(dynamoDb));
const putItem: (opts: PutItemInput) => Promise<PutItemOutput> = promisify(dynamoDb.putItem.bind(dynamoDb));

export const markUrlAsDone = async (url: string) => {
  const hashedUrl = sha1(url);
  const timestamp = Date.now();
  await putItem({
    TableName: tableName,
    Item: {
      urlHash: { B: hashedUrl }, timestamp: { N: timestamp.toString() }
    }
  });
};

export const getUrlStatus = async (url: string) => {
  const hashedUrl = sha1(url);
  const item = await getItem({ TableName: tableName, Key: { urlHash: { B: hashedUrl } }, AttributesToGet: ['timestamp'] });
  const timestamp = parseInt(item.Item?.timestamp?.N || '0', 10);
  return timestamp;
};