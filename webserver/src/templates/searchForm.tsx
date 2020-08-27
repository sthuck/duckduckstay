import { React, Elem } from "./jsx_string";
import { SearchResults, WebpageResult } from "../searchEs";

export interface SearchFormContext {
}

export function renderSearchForm(ctx: SearchFormContext): JSX.Element {
    return (
        <html>
            <head>
                <title>Search the Web</title>
            </head>
            <body>
                <h1><a href="/">Search the Web</a></h1>
                <form action="/search">
                    <div>
                        <input name="search" type="search" width="300" placeholder="Search" autoFocus />
                    </div>
                    <div>
                        <input type="submit" value="Search" />
                    </div>
                </form>
            </body>
        </html>
    );
}

export interface SearchResultsContext {
    searchQuery: string;
    searchResults: SearchResults<string>;
}

export function renderSearchResults(ctx: SearchResultsContext): JSX.Element {
    return (
        <html>
            <head>
                <title>Search the Web</title>
            </head>
            <body>
                <h1><a href="/">Search the Web</a></h1>
                <form action="/search">
                    <div>
                        <input name="search" type="search" width="300" placeholder="Search" autoFocus value={ctx.searchQuery} />
                    </div>
                    <div>
                        <input type="submit" value="Search" />
                    </div>
                </form>
                <hr />
                <h2>Search results for: <em>{ctx.searchQuery}</em></h2>
                {ctx.searchResults.results.map((result, index: number) =>
                    renderWebpageResult(index + 1, result))}
            </body>
        </html>
    );
}

function renderWebpageResult(rank: number, result: WebpageResult<string>): JSX.Element {
    return (
        <table cellPadding="4">
            <tr>
                <td valign="top">
                    <a href={result.url}><img src={result.screenshotUrl} /></a>
                </td>
                <td valign="top">
                    <h3>{rank}. <a href={result.url}>{result.title}</a></h3>
                    <small><pre>{result.url}</pre></small>
                    <ul>
                        {result.snippets.map(snippet => (
                            <li>{snippet}</li>
                        ))}
                    </ul>
                </td>
            </tr>
        </table>
    );
}
