import { downloadWebpage, cleanupDownloadedWebpage } from "./DownloadWebpage";
import { indexWebpage, EsConfig } from "./IndexWebpage";

export interface ProcessLinkInput {
    url: string;
}

export async function processLink(es: EsConfig, input: ProcessLinkInput): Promise<void> {
    const rawWebpage = await downloadWebpage({
        url: input.url
    });

    const webpage = cleanupDownloadedWebpage(rawWebpage);

    await indexWebpage(es, {
        webpage: webpage
    });
}
