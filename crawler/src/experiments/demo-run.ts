import dotenv from 'dotenv';
dotenv.config();

import { Driver, DriverEvents } from '../driver';
import { sendMessages, purgeQueue } from '../sqs';
import { loggerFactory } from '../logger';
import { DownloadWebpageInput } from '../DownloadWebpage';


const logger = loggerFactory('demo');
async function main() {
  const driver = new Driver();
  driver.on(DriverEvents.INIT, async () => {
    await purgeQueue();
    const input: DownloadWebpageInput = { url: 'https://www.ynet.co.il' };
    logger.info(`sending crawl request on url`, input);
    sendMessages([input]);
  });

  driver.on(DriverEvents.SHUTDOWN, async () => {
    await purgeQueue();
  });

  await driver.init();
  driver.start();
}

main().catch(logger.error.bind(logger));