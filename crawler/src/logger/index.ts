import {createLogger, format, transports, transport} from 'winston';
const {combine, timestamp, label, json, colorize, align, errors, simple, } = format;

const stackToMsg = format((info) => {
  if (info.stack) {
    info.message += ('\n' + info.stack);
    delete info.stack;
  }
  return info;
});

export const loggerFactory = (area: string) => createLogger({
  format: errors({stack: true}),
  transports: [
    new transports.Console({
      format: combine(
        label({label: area, message: true}),
        stackToMsg(),
        colorize(),
        align(),
        simple()
      ),
    }),
    new transports.File({
      filename: './error.log', format: combine(
        label({label: area, message: true}),
        timestamp(),
        json(),
      )
    })
  ]
});
