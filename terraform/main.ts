import {Construct} from 'constructs';
import {App, TerraformStack, TerraformOutput} from 'cdktf';
import {SqsQueue, DataAwsSqsQueue, CloudwatchLogGroup, DynamodbTable} from './.gen/providers/aws';
import {sqsQueueName, cloudwatchLogGroup, dynamoDbTableName} from './consts';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new SqsQueue(this, sqsQueueName, {
      name: sqsQueueName,
      maxMessageSize: 64 * 1024,
      visibilityTimeoutSeconds: 120,
    });
    const queueData = new DataAwsSqsQueue(this, 'data_' + sqsQueueName, {name: sqsQueueName});

    new TerraformOutput(this, 'sqsQueueAddress', {
      value: queueData.url,
    });

    new CloudwatchLogGroup(this, cloudwatchLogGroup, {retentionInDays: 3, name: cloudwatchLogGroup});

    const dynamoDbTable = new DynamodbTable(this, dynamoDbTableName, {
      name: dynamoDbTableName,
      hashKey: 'urlHash',
      billingMode: 'PAY_PER_REQUEST',
      ttl: [{attributeName: 'expiredWhen', enabled: true}],
      attribute: [{name: 'urlHash', type: 'B'}],
    });

    new TerraformOutput(this, 'dynamoDbTableName', {
      value: dynamoDbTable.name,
    });
  }
}

const app = new App();
new MyStack(app, 'duckduckstay');
app.synth();
