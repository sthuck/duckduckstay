import { downloadWebpage } from "./DownloadWebpage";

export interface ProcessLinkInput {
    url: string;
}

export async function processLink(input: ProcessLinkInput): Promise<void> {
    const webpage = await downloadWebpage({
        url: input.url
    });

    webpage.html
}
