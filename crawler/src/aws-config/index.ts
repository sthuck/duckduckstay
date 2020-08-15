import AWS from 'aws-sdk';
const aws_region = process.env.AWS_REGION;

export const config = new AWS.Config({
  region: aws_region || 'us-east-1'
});