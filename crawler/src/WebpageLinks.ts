import { WebpageLink } from "./DownloadWebpage";

export function fixWebpageLinks(url: string, links: WebpageLink[]): WebpageLink[] {
    return removeLinksHashes(filterQueryParamLinks(normalizeLinks(url, links))).filter(link => link.url !== url);
}

function removeLinksHashes(links: WebpageLink[]): WebpageLink[] {
    return links.map(link => {
        return {
            ...link,
            url: link.url.substring(0, link.url.length - new URL(link.url).hash.length)
        };
    });
}

function filterQueryParamLinks(links: WebpageLink[]): WebpageLink[] {
    return links.filter(link => new URL(link.url).search === "");
}

function normalizeLinks(url: string, links: WebpageLink[]): WebpageLink[] {
    return links.map(link => normalizeLink(url, link));
}

function normalizeLink(url: string, link: WebpageLink): WebpageLink {
    return {
        ...link,
        url: new URL(link.url, url).href
    };
}
