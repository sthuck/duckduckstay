import express from "express";
import {stringify} from "./templates/jsx_string";
import {renderSearchForm, renderSearchResults} from "./templates/searchForm";
import {searchEs, SearchResults} from "./searchEs";
import {getEsConfig} from "./es_client";
import {fillScreenshotUrls} from "./result_screenshots";
import {getScreenshotsS3Bucket} from "./cfg";
import cors from 'cors';

export function startServer(port: number): void {
    process.on('unhandledRejection', (e) => {
        console.error('promise rejection', e);
    });
    const es = getEsConfig();

    const app = express();

    app.get('/', async (req, res) => {
        try {
            res.send(stringify(renderSearchForm({})));
        } catch (err) {
            internalServerError(res, err);
        }
    });

    async function performSearch(searchQuery: string): Promise<SearchResults<string>> {
        const searchResults = await searchEs(es, searchQuery);
        const searchResultsWithScreenshots = await fillScreenshotUrls(getScreenshotsS3Bucket(), searchResults);
        return searchResultsWithScreenshots;
    }

    app.get('/search', async (req, res) => {
        try {
            const searchQuery = req.query["search"];

            if (typeof searchQuery !== "string") {
                res.status(307).location("/");
                return;
            }

            const searchResults = await performSearch(searchQuery);

            res.send(stringify(renderSearchResults({
                searchQuery: searchQuery,
                searchResults: searchResults
            })));
        } catch (err) {
            internalServerError(res, err);
        }
    });
    app.get('/api/search', cors(), async (req, res) => {
        try {
            const searchQuery = req.query["search"];

            if (typeof searchQuery !== "string") {
                res.status(307).location("/");
                return;
            }

            const searchResults = await performSearch(searchQuery);
            res.json(searchResults);
        } catch (err) {
            internalServerError(res, err);
        }
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
}

function internalServerError(res: express.Response<unknown>, err: any): void {
    console.error(err);
    res.status(500).contentType("text/plain").send(`Internal server error:\n\n${err.message}\n\n${err.stack}`);
}
