import AWS from 'aws-sdk';
import { envConfig } from '../env-config';

const { awsRegion } = envConfig;

export const config = new AWS.Config({
  region: awsRegion || 'us-east-1'
});