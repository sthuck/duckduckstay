import {TerraformOutput} from 'cdktf';
import {Construct} from 'constructs';
import {
  CodebuildProject, Codepipeline,
  CodepipelineWebhook,
  EcrRepository, IamRole, IamRolePolicy, S3Bucket
} from './.gen/providers/aws';


export const registerBuildEnv = (scope: Construct) => {
  function BuildEnv(this: Construct) {
    const ecrRepo = new EcrRepository(this, 'duckduckdocker', {
      name: 'duckduckdocker',
    });

    const buildRole = new IamRole(this, 'duckduckBuildRole', {
      name: 'duckduckBuildRole',
      assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "codepipeline.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          },
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "codebuild.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      }`
    });

    const s3Bucket = new S3Bucket(this, 'duckduckBuildBucket', {
      bucket: 'duckduck-build-bucket',
      acl: 'private'
    });

    new IamRolePolicy(this, 'duckduckBuildPolicy', {
      name: 'duckduckBuildPolicy',
      role: buildRole.id!,
      policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect":"Allow",
            "Action": [
              "s3:GetObject",
              "s3:GetObjectVersion",
              "s3:GetBucketVersioning",
              "s3:PutObject"
            ],
            "Resource": [
              "${s3Bucket.arn}",
              "${s3Bucket.arn}/*"
            ]
          },
          {
            "Effect": "Allow",
            "Action": [
              "codebuild:*",
              "ec2:*",
              "ecr:*",
              "logs:*"
            ],
            "Resource": "*"
          }
        ]
      }`
    });

    const buildProject = new CodebuildProject(this, 'duckduckBuildProject', {
      name: 'DuckDuckBuild',
      source: [{type: 'CODEPIPELINE'}],
      artifacts: [{type: 'CODEPIPELINE'}],
      serviceRole: buildRole.arn,
      environment: [{
        computeType: 'BUILD_GENERAL1_SMALL',
        image: 'aws/codebuild/standard:2.0',
        type: 'LINUX_CONTAINER',
        privilegedMode: true,
      }]
    });

    const pipeline = new Codepipeline(this, 'duckduckBuildPipeline', {
      name: 'duckduckBuild',
      dependsOn: [buildProject],
      artifactStore: [{type: 'S3', location: s3Bucket.bucket!}],
      roleArn: buildRole.arn,
      stage: [
        {
          name: 'Source', action: [{
            name: 'source',
            category: 'Source',
            provider: 'GitHub',
            owner: 'ThirdParty',
            version: '1',
            outputArtifacts: ['source_output']
          }]
        },
        {
          name: 'Build',
          action: [{
            name: 'Build',
            category: 'Build',
            owner: 'AWS',
            provider: 'CodeBuild',
            inputArtifacts: ["source_output"],
            version: "1",
          }]
        }
      ]
    });
    //Workaround because cdk is still buggy
    pipeline.addOverride('stage.0.action.0.configuration', {
      Owner: 'sthuck',
      Repo: 'duckduckstay',
      Branch: 'master',
      OAuthToken: process.env.GITHUB_TOKEN || '',
      PollForSourceChanges: 'False'
    });
    pipeline.addOverride('stage.1.action.0.configuration', {
      ProjectName: buildProject.name,
      EnvironmentVariables: JSON.stringify([
        {name: 'IMAGE_TAG', value: 'latest', },
        {name: 'IMAGE_REPO_NAME', value: ecrRepo.name, },
        {name: 'REPO_URL', value: ecrRepo.repositoryUrl},
      ])
    });

    const webhook = new CodepipelineWebhook(this, 'pipelineWebHook', {
      name: 'onPushHook',
      targetPipeline: pipeline.name,
      targetAction: 'Source',
      authentication: 'GITHUB_HMAC',
      filter: [{
        jsonPath: '$.ref',
        matchEquals: 'refs/heads/master',
      }],
      authenticationConfiguration: [{secretToken: process.env.GITHUB_HMAC || ''}]
    });

    new TerraformOutput(this, 'webhookUrl', {
      value: webhook.url,
    });
    return {ecrRepo};
  }
  return BuildEnv.call(scope);
};