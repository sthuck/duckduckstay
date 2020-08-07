import { downloadWebpageSimple } from "../mocks/DownloadWebpageSimple";
import { DownloadWebpageOutput } from "../DownloadWebpage";
import { fixWebpageLinks } from "../WebpageLinks";

export async function main() {
    console.log("Downloading...");

    const rawWebpage = await downloadWebpageSimple({
        url: "https://en.wikipedia.org/wiki/Special:Random"
    });

    const webpage: DownloadWebpageOutput = {
        ...rawWebpage,
        links: fixWebpageLinks(rawWebpage.canonicalUrl, rawWebpage.links)
    };

    console.log("URL", webpage.canonicalUrl);
    console.log("TITLE", webpage.title);
    console.log("HEADINGS", webpage.headings);
    console.log("LINKS", webpage.links);
}

if (require.main === module) {
    main();
}
