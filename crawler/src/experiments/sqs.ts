import dotenv from 'dotenv';
dotenv.config();
import { range, random, uniqueId } from 'lodash';

import { receiveMessage, sendMessages, purgeQueue } from '../sqs';

async function main() {
  // const msgs = range(15).map(i => ({someData: random(), id: i.toString()}));
  // await sendMessages(msgs);

  // let msg = await receiveMessage();
  // console.log(msg);
  // msg = await receiveMessage();
  // console.log(msg);
  // msg = await receiveMessage();
  // console.log(msg);

  await purgeQueue();
  // msg = await receiveMessage();
  // console.log({msg});
}

main().catch(console.error);