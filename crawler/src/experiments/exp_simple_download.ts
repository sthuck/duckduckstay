import { downloadWebpageSimple } from "../mocks/DownloadWebpageSimple";
import { cleanupDownloadedWebpage } from "../DownloadWebpage";

export async function main() {
    console.log("Downloading...");

    const rawWebpage = await downloadWebpageSimple({
        url: "https://en.wikipedia.org/wiki/Special:Random"
    });

    const webpage = cleanupDownloadedWebpage(rawWebpage);

    console.log("URL", webpage.canonicalUrl);
    console.log("TITLE", webpage.title);
    console.log("HEADINGS", webpage.headings);
    console.log("LINKS", webpage.links);
}

if (require.main === module) {
    main();
}
