import {Construct} from "constructs";
import {InternetGateway, RouteTable, RouteTableAssociation, SecurityGroup, Subnet, Vpc} from './.gen/providers/aws';

export function registerNetwork(scope: Construct, availabilityZones: string[]) {
  const vpc = new Vpc(scope, 'duckduckNetwork', {
    cidrBlock: "10.0.0.0/20",
    tags: {Name: 'duckduckNetwork'}
  });
  const subnets = availabilityZones.map((az, index) => {
    const subnet = new Subnet(scope, `duckduckSubnet${index + 1}`, {
      vpcId: vpc.id!,
      availabilityZone: az,
      cidrBlock: `10.0.${index}.0/24`,
      mapPublicIpOnLaunch: true,
      tags: {'Name': `duckduckSubnet${index + 1}`}
    });
    return subnet;
  });

  const elasticSearchSg = new SecurityGroup(scope, 'elasticSearchSg', {
    vpcId: vpc.id!,
    name: 'elasticSearchSg',
    egress: [{
      cidrBlocks: ["0.0.0.0/0"],
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      description: 'outgoing',
    }],
    ingress: [{
      cidrBlocks: [vpc.cidrBlock],
      protocol: 'tcp',
      fromPort: 9300,
      toPort: 9300,
      description: 'es comm',
    },
    {
      cidrBlocks: [vpc.cidrBlock],
      protocol: 'tcp',
      fromPort: 9200,
      toPort: 9200,
      description: 'es http',
    },
    {
      cidrBlocks: [vpc.cidrBlock],
      protocol: 'tcp',
      fromPort: 80,
      toPort: 80,
      description: 'es http',
    }
    ]
  });

  ['egress.0', 'ingress.1', 'ingress.2', 'ingress.0'].forEach(key => {
    elasticSearchSg.addOverride(key + '.ipv6_cidr_blocks', null);
    elasticSearchSg.addOverride(key + '.prefix_list_ids', null);
    elasticSearchSg.addOverride(key + '.security_groups', null);
    elasticSearchSg.addOverride(key + '.self', null);
  });
  const ecsWorkerSg = new SecurityGroup(scope, 'ecsWorkerSg', {
    vpcId: vpc.id!,
    name: 'ecsWorkerSg',
    egress: [{
      cidrBlocks: ["0.0.0.0/0"],
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      description: 'outgoing',
    }],
    ingress: [{
      cidrBlocks: ['0.0.0.0/0'],
      protocol: 'tcp',
      fromPort: 22,
      toPort: 22,
      description: 'ssh',
    }, {
      cidrBlocks: ['0.0.0.0/0'],
      protocol: 'tcp',
      fromPort: 2376,
      toPort: 2376,
      description: 'docker',
    }],
  });
  ['egress.0', 'ingress.1', 'ingress.0'].forEach(key => {
    ecsWorkerSg.addOverride(key + '.ipv6_cidr_blocks', null);
    ecsWorkerSg.addOverride(key + '.prefix_list_ids', null);
    ecsWorkerSg.addOverride(key + '.security_groups', null);
    ecsWorkerSg.addOverride(key + '.self', null);
  });

  const igw = new InternetGateway(scope, 'igw', {
    vpcId: vpc.id!,
  });

  const rt = new RouteTable(scope, 'igw-rt', {
    vpcId: vpc.id!,
    route: [{
      cidrBlock: '0.0.0.0/0',
      gatewayId: igw.id,
      egressOnlyGatewayId: '',
    }]
  });
  ["egress_only_gateway_id", "instance_id", "ipv6_cidr_block", "nat_gateway_id",
    "network_interface_id", "transit_gateway_id", "vpc_peering_connection_id"].forEach(key => rt.addOverride(`route.0.${key}`, null));

  subnets.forEach((subnet, index) =>
    new RouteTableAssociation(scope, `igw-rt-assoc-${index}`, {
      routeTableId: rt.id!,
      subnetId: subnet.id,
    }));

  return {vpc, subnets, elasticSearchSg, ecsWorkerSg};
}