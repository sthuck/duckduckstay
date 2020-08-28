// MAX_CONCURRENCY=4
// HEADLESS=
// ES="https://search-crawler-jnojsuarddk7yflkhek5svm7um.us-east-1.es.amazonaws.com"
// SQS_URL="https://sqs.us-east-1.amazonaws.com/031794236270/urlQueue"
// AWS_REGION="us-east-1"
// DYNAMO_DB_TABLE=urlHashTable

import { config } from "aws-sdk";



type ParseFn<T> = (s: string | undefined) => T | undefined;
const parseNumber = (s: string | undefined) => s ? parseInt(s, 10) : undefined;
const parseBoolean = (s: string | undefined) => s ? ['1', 'true', 'True'].some(value => value === s) : undefined;
const parseString: ParseFn<string> = (s: string | undefined) => s;

const parseOne = <T>(key: string, parseFn: ParseFn<T>, defaultValue?: T): T => {
  const value = process.env[key];
  let parsedValue = parseFn(value);
  parsedValue = parsedValue ?? defaultValue;
  if (parsedValue === undefined) {
    throw new Error(`Missing env var ${key}`);
  }
  return parsedValue;
};


export const envConfig = {
  maxConcurrency: parseOne('MAX_CONCURRENCY', parseNumber, 4),
  headless: parseOne('HEADLESS', parseBoolean, false),
  es: parseOne('ES', parseString),
  screenshotsS3Bucket: parseOne('SCREENSHOTS_S3_BUCKET', parseString),
  sqsUrl: parseOne('SQS_URL', parseString),
  awsRegion: parseOne('AWS_REGION', parseString),
  dynamoDbTable: parseOne('DYNAMO_DB_TABLE', parseString),
  maxLinksFromPage: parseOne('MAX_LINKS_FROM_PAGE', parseNumber, 10),
  maxSqsQueueSize: parseOne('MAX_SQS_QUEUE_SIZE', parseNumber, 50000),
  checkSqsSizeInterval: parseOne('CHECK_SQS_SIZE_INTERVAL_MINUTES', parseNumber, 5),
};
