import dotenv from 'dotenv';
dotenv.config();
import { markUrlAsDone, isUrlMarkedAsDone } from "../url-tracking";

async function main() {
  await markUrlAsDone('www.google.com');
  const item = await isUrlMarkedAsDone('www.google.com');
  const dontExist = await isUrlMarkedAsDone('www.google.com222');
  console.log(item);
  console.log(dontExist);


}

main().catch(console.error);