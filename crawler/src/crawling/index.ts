
import { Cluster } from 'puppeteer-cluster';
import vanillaPuppeteer, { Page } from 'puppeteer';

import { addExtra } from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { DownloadWebpageInput, DownloadWebpageOutput } from '../DownloadWebpage';
import { isDefined } from '../utils';
import { envConfig } from '../env-config';

const { maxConcurrency: maxConcurrencyDefault, headless } = envConfig;

let cluster: Cluster;

interface Wrapped {
  input: DownloadWebpageInput,
  output: DownloadWebpageOutput,
}

export async function startPuppeteerCluster(maxConcurrency: number = maxConcurrencyDefault) {
  const puppeteer = addExtra(vanillaPuppeteer);
  puppeteer.use(Stealth());
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


  cluster = await Cluster.launch({
    puppeteer,
    maxConcurrency,
    puppeteerOptions: {
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    },
    concurrency: Cluster.CONCURRENCY_PAGE
  });

  await cluster.task(async ({ page, data }: { page: Page, data: Wrapped; }) => {
    const { input, output } = data;
    await page.goto(input.url, { waitUntil: 'domcontentloaded' }); //TODO - maybe change this?
    output.title = await page.title();
    output.headings = (await page.$$eval('h1, h2, h3',
      hElements => hElements.map(el => el.textContent))).filter(isDefined);

    output.links = (await page.$$eval('a',
      aElements => aElements.map(el => {
        const anchorText = el.textContent || '';
        const nofollow = el.attributes.getNamedItem('rel')?.value?.includes('nofollow');
        const url = (el as HTMLAnchorElement).href;
        const isJsAction = (url.includes('javascript:void(0)'));

        if (!nofollow && !isJsAction) {
          return { anchorText, url };
        }
      }))).filter(<T>(e: T | undefined): e is T => !!e);

    output.html = await page.evaluate(() => document.body.innerHTML);
    output.bodyText = await page.evaluate(() => document.body.innerText);
    output.canonicalUrl = page.url();

    output.screenshot = await page.screenshot({
      encoding: "binary",
      type: "png"
    });

    //  const el = await page.$eval("link[rel='canonical']", el => el.getAttribute('href'));
  });
}

export const crawlWebpage = async (input: DownloadWebpageInput): Promise<DownloadWebpageOutput> => {
  const wrapped: Wrapped = { input, output: {} as any };
  await cluster.execute(wrapped);
  return wrapped.output;
};

export const shutdownCluster = async () => {
  await cluster.idle();
  await cluster.close();
};;

// main().catch(console.warn)