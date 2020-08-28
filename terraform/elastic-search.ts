import {Construct} from "constructs";
import {IamServiceLinkedRole, ElasticsearchDomain, Subnet, SecurityGroup, ElasticsearchDomainPolicy} from "./.gen/providers/aws";

export function registerElasticSearch(stack: Construct, subnets: Subnet[], elasticSearchSg: SecurityGroup) {
  const esRole = new IamServiceLinkedRole(stack, 'esIAMRole', {
    awsServiceName: 'es.amazonaws.com',
  });

  const esCluster = new ElasticsearchDomain(stack, 'esDomain', {
    domainName: 'foo',
    ebsOptions: [{ebsEnabled: true, volumeType: 'gp2', volumeSize: 10}],
    clusterConfig: [{
      instanceType: 't2.small.elasticsearch', zoneAwarenessEnabled: false, instanceCount: 2,
      dedicatedMasterCount: 0,
      warmEnabled: false,
    }],
    elasticsearchVersion: '7.7',
    vpcOptions: [{subnetIds: [subnets[1].id!], securityGroupIds: [elasticSearchSg.id!]}],
    dependsOn: [esRole],
  });
  const policy = new ElasticsearchDomainPolicy(stack, 'esPolicy', {
    accessPolicies: `
    {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Action": "es:*",
              "Principal": {
                "AWS": "*"
              },
              "Effect": "Allow",
              "Resource": "${esCluster.arn}/*"
          }
      ]
  }`,
    domainName: esCluster.domainName,
  });
  return esCluster;
}
