import {startPupeteerCluster, shutdownCluster, processWebpage} from '../crawling';

async function main() {
    await startPupeteerCluster();
    const output = await processWebpage({url: 'https://en.wikipedia.org/wiki/Main_Page'});
    console.log(output);
    await shutdownCluster();
}

main().catch(console.error);