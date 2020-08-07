import { URL } from "url";

export interface DownloadWebpageInput {
    url: string;
}

export interface WebpageLink {
    anchorText: string;
    url: string;
}

export interface DownloadWebpageOutput {
    canonicalUrl: string;
    title: string;
    html: string;
    headings: string[];
    links: WebpageLink[];
    bodyText: string;
}

export type DownloadWebpage = (input: DownloadWebpageInput) => Promise<DownloadWebpageOutput>;

export function downloadWebpage(input: DownloadWebpageInput): Promise<DownloadWebpageOutput> {
    // TODO Use pupeteer to download the webpage
    throw new Error("TODO");
}
