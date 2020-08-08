import { downloadWebpageSimple } from "../mocks/DownloadWebpageSimple";
import { cleanupDownloadedWebpage } from "../DownloadWebpage";
import { indexWebpage } from "../IndexWebpage";
import { getEsConfig } from "../es_client";

export async function main() {
    const es = getEsConfig();

    for (let i = 0; i < 100; ++i) {

        console.log("Downloading...");

        const rawWebpage = await downloadWebpageSimple({
            url: "https://en.wikipedia.org/wiki/Special:Random"
        });

        const webpage = cleanupDownloadedWebpage(rawWebpage);

        console.log("Title:", webpage.title);
        console.log("Indexing...");
        await indexWebpage(es, {
            webpage: webpage
        });

        console.log(`${i + 1}/100`);
    }
    console.log("Done");
}

if (require.main === module) {
    main();
}
