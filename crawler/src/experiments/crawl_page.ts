import { startPuppeteerCluster, shutdownCluster, crawlWebpage } from '../crawling';

async function main() {
    await startPuppeteerCluster();
    const output = await crawlWebpage({ url: 'https://en.wikipedia.org/wiki/Main_Page' });
    console.log(output);
    await shutdownCluster();
}

main().catch(console.error);