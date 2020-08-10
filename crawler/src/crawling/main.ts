
import {Cluster} from 'puppeteer-cluster';
import * as vanillaPuppeteer from 'puppeteer';

import {addExtra} from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';


async function main() {
    const puppeteer = addExtra(vanillaPuppeteer)
    puppeteer.use(Stealth())
    puppeteer.use(AdblockerPlugin({blockTrackers: true}))


    const cluster = await Cluster.launch({
        puppeteer,
        maxConcurrency: 10,
        puppeteerOptions: {headless: false},
        concurrency: Cluster.CONCURRENCY_PAGE
    })

    await cluster.task(async ({page, data: url}) => {
        await page.goto(url)

        const {hostname} = new URL(url)
        await page.screenshot({path: `${hostname}.png`, fullPage: true})
    })

    // Queue any number of tasks
    cluster.queue('https://www.google.com/')
    cluster.queue('http://www.wikipedia.org/')
    cluster.waitForOne
    await cluster.idle()
    await cluster.close()
    console.log(`All done, check the screenshots. ✨`)
}

main().catch(console.warn)