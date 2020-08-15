import { URL } from "url";
import { fixWebpageLinks } from "./WebpageLinks";
import { crawlWebpage } from './crawling';

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

export async function downloadWebpage(input: DownloadWebpageInput): Promise<DownloadWebpageOutput> {
    return crawlWebpage(input);
}

export function cleanupDownloadedWebpage(webpage: DownloadWebpageOutput): DownloadWebpageOutput {
    return {
        ...webpage,
        links: fixWebpageLinks(webpage.canonicalUrl, webpage.links)
    };
}
