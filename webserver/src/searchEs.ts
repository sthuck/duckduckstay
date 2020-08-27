import { EsConfig } from "./es_client";

export interface SearchResults {
    results: WebpageResult[];
}

export interface WebpageResult {
    url: string;
    title: string;
    screenshotUrl: string;
    snippets: string[];
}

export const exampleSearchResults: SearchResults = {
    results: [
        {
            url: "http://foo",
            title: "foo",
            screenshotUrl: "https://placekitten.com/144/144",
            snippets: ["foo1 foo1", "foo2 foo2"]
        },
        {
            url: "http://blah",
            title: "blah",
            screenshotUrl: "https://placekitten.com/144/144",
            snippets: ["blah1 blah1", "blah2 blah2"]
        }
    ]
};

export async function searchEs(es: EsConfig, query: string): Promise<SearchResults> {
    const rsp = await es.client.search({
        body: {
            query: {
                "multi_match": {
                    query: query,
                    fields: ["title^5", "bodyText"],
                    operator: "and"
                }
            },
            highlight: {
                pre_tags: [""],
                post_tags: [""],
                fields: {
                    "bodyText": {}
                }
            }
        }
    });

    return {
        results: rsp.body.hits.hits.map(processHit)
    }
}

/**
 * Same structure used in `indexWebpage` function
 */
interface IndexedDocument {
    url: string;
    title: string;
    bodyText: string;
}

interface SearchHit {
    doc: IndexedDocument;
    highlight: { [index: string]: string[] };
}

function parseHit(hit: any): SearchHit {
    return {
        doc: hit._source,
        highlight: hit.highlight
    }
}

function processHit(hitRaw: any): WebpageResult {
    const hit = parseHit(hitRaw);

    let snippets: string[] = [];
    if (hit.highlight) {
    for (const key of Object.keys(hit.highlight)) {
        snippets = snippets.concat(hit.highlight[key]);
    }
    }

    return {
        url: hit.doc.url,
        title: hit.doc.title,
        screenshotUrl: "https://placekitten.com/144/144", // TODO !!!
        snippets: snippets
    };
}
