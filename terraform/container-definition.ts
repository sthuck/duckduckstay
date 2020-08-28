export const containerDefinition = (esUrl: string, sqsUrl: string, dynamoDbTable: string, screenshotsBucket: string, ecrRepo: string) => [
  {
    dnsSearchDomains: null,
    environmentFiles: null,
    logConfiguration: {
      logDriver: "awslogs",
      secretOptions: null,
      options: {
        "awslogs-group": "/ecs/duckduckWorkers",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    entryPoint: null,
    portMappings: [],
    command: null,
    linuxParameters: null,
    cpu: 0,
    environment: [
      {
        name: "AWS_REGION",
        value: "us-east-1"
      },
      {
        name: "DYNAMO_DB_TABLE",
        value: dynamoDbTable,
      },
      {
        name: "ES",
        value: `http://${esUrl}`,
      },
      {
        name: "HEADLESS",
        value: "true"
      },
      {
        name: "SQS_URL",
        value: sqsUrl,
      },
      {
        name: "SCREENSHOTS_S3_BUCKET",
        value: screenshotsBucket,
      }
    ],
    resourceRequirements: null,
    ulimits: null,
    dnsServers: [
      "8.8.8.8",
      "1.1.1.1"
    ],
    mountPoints: [],
    workingDirectory: null,
    secrets: null,
    dockerSecurityOptions: null,
    memory: 3000,
    memoryReservation: null,
    volumesFrom: [],
    stopTimeout: null,
    image: `${ecrRepo}:latest`,
    startTimeout: null,
    firelensConfiguration: null,
    dependsOn: null,
    disableNetworking: null,
    interactive: null,
    healthCheck: null,
    essential: true,
    links: null,
    hostname: null,
    extraHosts: null,
    pseudoTerminal: null,
    user: null,
    readonlyRootFilesystem: null,
    dockerLabels: null,
    systemControls: null,
    privileged: false,
    name: "crawler"
  }
]