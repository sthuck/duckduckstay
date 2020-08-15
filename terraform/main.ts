import {Construct} from 'constructs';
import {App, TerraformStack, TerraformOutput} from 'cdktf';
import {SqsQueue, DataAwsSqsQueue} from './.gen/providers/aws';
import {sqsQueueName} from './consts';

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
  }
}

const app = new App();
new MyStack(app, 'duckduckstay');
app.synth();
