import {App, TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import {AwsProvider} from './.gen/providers/aws';
import {registerAppEnv} from './app-env';
import {registerBuildEnv} from './build-env';
import {RegisterECS} from './ecs';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: 'us-east-1'
    });
    const azs = ['us-east-1a', 'us-east-1e', 'us-east-1f'];

    /** APP ENV */
    const {sqs, dynamoDbTable, esCluster, subnets, ecsWorkerSg, ecsWorkerRole} = registerAppEnv(this, azs);

    /** BUILD ENV **/
    const {ecrRepo} = registerBuildEnv(this);

    RegisterECS(this, ecsWorkerRole, ecsWorkerSg, subnets, sqs, esCluster, dynamoDbTable, ecrRepo);
  }
}

const app = new App();
new MyStack(app, 'duckduckstay');
app.synth();
