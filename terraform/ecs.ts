import {TerraformStack} from 'cdktf';
import {
  AutoscalingGroup,
  DataAwsSqsQueue, DynamodbTable, EcrRepository, EcsCapacityProvider, EcsCluster,

  EcsTaskDefinition, ElasticsearchDomain, IamInstanceProfile, IamRole, IamRolePolicyAttachment, LaunchConfiguration,
  SecurityGroup, SqsQueue, Subnet
} from './.gen/providers/aws';
import {ecsClusterName, s3ScreenShotBucketName} from './consts';
import {containerDefinition} from './container-definition';


export function RegisterECS(stack: TerraformStack, ecsWorkerRole: IamRole,
  ecsWorkerSg: SecurityGroup, subnets: Subnet[], sqs: SqsQueue, esCluster: ElasticsearchDomain,
  dynamoDbTable: DynamodbTable, ecrRepo: EcrRepository) {

  const ecsAmi = 'ami-00a35b04ab99b549a';
  const instanceProfile = new IamInstanceProfile(stack, 'ecsWorkers-iamProfile', {
    name: 'ecsWorkers-iamProfile',
    role: ecsWorkerRole.name,
  });

  const lg = new LaunchConfiguration(stack, 'ecsWorkers-lg', {
    instanceType: 't2.medium',
    associatePublicIpAddress: true,
    imageId: ecsAmi,
    name: 'ecsWorkers-lg',
    securityGroups: [ecsWorkerSg.id!],
    keyName: 'main-key',
    userData: `#!/bin/bash
echo ECS_CLUSTER=${ecsClusterName} >> /etc/ecs/ecs.config
`,
    iamInstanceProfile: instanceProfile.id!,
    rootBlockDevice: [{deleteOnTermination: true, volumeSize: 30, volumeType: 'gp2'}],
  });

  const asg = new AutoscalingGroup(stack, 'ecsWorkers', {
    maxSize: 10,
    minSize: 10,
    healthCheckType: 'EC2',
    vpcZoneIdentifier: subnets.map(s => s.id!),
    launchConfiguration: lg.name,
    dependsOn: [lg],
    name: 'ecsWorkers-asg'
  });
  const capacityProvider = new EcsCapacityProvider(stack, 'duckduckWorkers-cp', {
    name: 'duckduckWorkers-cp',
    autoScalingGroupProvider: [{autoScalingGroupArn: asg.arn, managedScaling: [{status: 'DISABLED'}]}],
    dependsOn: [asg],
  });
  const ecsCluster = new EcsCluster(stack, ecsClusterName, {
    name: ecsClusterName,
    setting: [{name: 'containerInsights', value: 'enabled'}],
    capacityProviders: [capacityProvider.name!],
    dependsOn: [capacityProvider]
  });

  const ecsServiceRole = new IamRole(stack, 'ecsServiceRole', {
    name: 'ecsServiceRole',
    assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ecs.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      }`,
  });
  new IamRolePolicyAttachment(stack, 'AttachToService_AmazonEC2ContainerServiceRole', {
    policyArn: 'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole',
    role: ecsServiceRole.id!,
  });

  const ecsTaskExecutionRole = new IamRole(stack, 'ecsTaskExecutionRole', {
    name: 'ecsTaskExecutionRole',
    assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
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
  new IamRolePolicyAttachment(stack, 'AttachToTaskExecution_AmazonECSTaskExecutionRolePolicy', {
    policyArn: 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
    role: ecsTaskExecutionRole.id!,
  });

  const dataSqs = new DataAwsSqsQueue(stack, 'dataSqs', {
    name: sqs.name!,
    dependsOn: [sqs]
  });

  const taskDefinition = new EcsTaskDefinition(stack, 'duckduckWorkerTask', {
    family: 'duckduckWorkerTask',
    containerDefinitions: JSON.stringify(
      containerDefinition(esCluster.endpoint, dataSqs.url, dynamoDbTable.name, s3ScreenShotBucketName, ecrRepo.repositoryUrl)),
    executionRoleArn: ecsTaskExecutionRole.arn,
    taskRoleArn: ecsWorkerRole.arn,
    requiresCompatibilities: ['EC2']
  });
}