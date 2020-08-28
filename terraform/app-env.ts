import {TerraformOutput, TerraformStack} from 'cdktf';
import {Construct} from "constructs";
import {
  CloudwatchLogGroup, DataAwsSqsQueue,
  DynamodbTable,
  IamRole, IamRolePolicy, IamRolePolicyAttachment, S3Bucket, SqsQueue
} from './.gen/providers/aws';
import {cloudwatchLogGroup, dynamoDbTableName, sqsQueueName, s3ScreenShotBucketName} from './consts';
import {registerElasticSearch} from './elastic-search';
import {registerNetwork} from './network';

export const registerAppEnv = (stack: TerraformStack, availabilityZones: string[]) => {
  const sqs = registerSqs(stack);

  new CloudwatchLogGroup(stack, cloudwatchLogGroup, {retentionInDays: 3, name: cloudwatchLogGroup});

  const dynamoDbTable = registerDynamoDb(stack);

  const {vpc, ecsWorkerSg, subnets, elasticSearchSg} = registerNetwork(stack, availabilityZones);

  const esCluster = registerElasticSearch(stack, subnets, elasticSearchSg);

  const ecsWorkerRole = new IamRole(stack, 'ecsWorkerRole', {
    name: 'ecsWorkerRole',
    assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          },
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ecs.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          },
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      }`,
  });
  new IamRolePolicyAttachment(stack, 'AttachToWorker_AmazonEC2ContainerServiceforEC2Role', {
    policyArn: 'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role',
    role: ecsWorkerRole.id!,
  });

  new IamRolePolicy(stack, 'ecsWorkerPolicy', {
    name: 'ecsWorkerPolicy',
    role: ecsWorkerRole.id!,
    policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "sqs:*",
              "s3:*",
              "dynamodb:*",
              "logs:*",
              "cloudwatch:*"
            ],
            "Resource": "*"
          }
        ]
      }`
  });

  const s3ScreenshotBucket = new S3Bucket(stack, 's3ScreenshotBucket', {
    bucket: s3ScreenShotBucketName,
    acl: 'private'
  });

  return {esCluster, vpc, ecsWorkerSg, subnets, dynamoDbTable, sqs, ecsWorkerRole, s3ScreenshotBucket};
};

function registerDynamoDb(scope: Construct) {
  const dynamoDbTable = new DynamodbTable(scope, dynamoDbTableName, {
    name: dynamoDbTableName,
    hashKey: 'urlHash',
    billingMode: 'PAY_PER_REQUEST',
    ttl: [{attributeName: 'expiredWhen', enabled: true}],
    attribute: [{name: 'urlHash', type: 'B'}],
  });

  new TerraformOutput(scope, 'dynamoDbTableName', {
    value: dynamoDbTable.name,
  });
  return dynamoDbTable;
}

function registerSqs(scope: Construct) {
  const queue = new SqsQueue(scope, sqsQueueName, {
    name: sqsQueueName,
    maxMessageSize: 64 * 1024,
    visibilityTimeoutSeconds: 120,
  });
  const queueData = new DataAwsSqsQueue(scope, 'data_' + sqsQueueName, {name: sqsQueueName, dependsOn: [queue]});

  new TerraformOutput(scope, 'sqsQueueAddress', {
    value: queueData.url,
  });
  return queue;
}