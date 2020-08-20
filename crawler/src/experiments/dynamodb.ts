import dotenv from 'dotenv';
dotenv.config();
import { markUrlAsDone, getUrlStatus } from "../url-tracking";

async function main() {
  await markUrlAsDone('www.google.com');
  const item = await getUrlStatus('www.google.com');
  const dontExist = await getUrlStatus('www.google.com222');
  console.log(item);
  console.log(dontExist);


}

main().catch(console.error);