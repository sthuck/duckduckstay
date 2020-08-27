import { DownloadWebpageInput, DownloadWebpageOutput, WebpageLink } from "../DownloadWebpage";
import got from "got";
import * as cheerio from "cheerio";

export async function downloadWebpageSimple(input: DownloadWebpageInput): Promise<DownloadWebpageOutput> {
    const rsp = await got(input.url);

    return parseBody(rsp.url, rsp.body);
}

function parseBody(url: string, body: string): DownloadWebpageOutput {
    const $ = cheerio.load(body, {
        normalizeWhitespace: true
    });

    const title = $("title").text();

    const bodyText = $("body").text();

    const headings: string[] = [];
    for (const h of $("h1, h2, h3, h4, h5, h6").toArray()) {
        headings.push($(h).text());
    }

    const links: WebpageLink[] = []
    for (const a of $("a[href]").toArray()) {
        const anchorText = $(a).text();
        const url = a.attribs["href"];
        links.push({
            anchorText: anchorText,
            url: url
        });
    }

    return {
        canonicalUrl: url,
        title: title,
        headings: headings,
        links: links,
        bodyText: bodyText,
        html: body,
        screenshot: null
    };
}
