import dotenv from 'dotenv';
import { Driver, DriverEvents } from './driver';
import { loggerFactory } from './logger';
dotenv.config();

const logger = loggerFactory('main');
async function main() {
  const driver = new Driver();

  driver.on(DriverEvents.SHUTDOWN, async () => {
    // await purgeQueue();
  });

  await driver.init();
  driver.start();
}

main().catch(logger.error.bind(logger));