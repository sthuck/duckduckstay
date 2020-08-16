import { createLogger, format, transports, transport, level } from 'winston';
const { combine, timestamp, label, json, colorize, align, errors, simple, } = format;
import { config } from '../aws-config';
import os from 'os';
import WinstonCloudWatch from 'winston-cloudwatch';

const hostname = os.hostname();

const stackToMsg = format((info) => {
  if (info.stack) {
    info.message += ('\n' + info.stack);
    delete info.stack;
  }
  return info;
});

export const loggerFactory = (area: string) => createLogger({
  format: errors({ stack: true }),
  transports: [
    new transports.Console({
      format: combine(
        label({ label: area, message: true }),
        stackToMsg(),
        colorize(),
        align(),
        simple()
      ),
      level: 'silly'
    }),
    new transports.File({
      filename: './error.log', format: combine(
        label({ label: area, message: true }),
        timestamp(),
        json(),
      ),
      level: 'warn'
    }),
    new WinstonCloudWatch({
      logGroupName: 'crawlers',//TODO: put in var
      logStreamName: hostname,
      awsRegion: config.region,
      // level: 'warn'
    })
  ]
});
