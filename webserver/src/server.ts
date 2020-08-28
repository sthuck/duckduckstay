import express from "express";
import {stringify} from "./templates/jsx_string";
import {renderSearchForm, renderSearchResults} from "./templates/searchForm";
import {searchEs, SearchResults} from "./searchEs";
import {getEsConfig} from "./es_client";
import {fillScreenshotUrls} from "./result_screenshots";
import {getScreenshotsS3Bucket, getRedisUrl} from "./cfg";
import cors from 'cors';
import {searchCache, cacheResults} from "./redis";
import * as redis from "redis";

export function startServer(port: number): void {
    process.on('unhandledRejection', (e) => {
        console.error('promise rejection', e);
    });
    const es = getEsConfig();


    const REDIS_URL = getRedisUrl();

    const redisClient = REDIS_URL !== null
        ? redis.createClient(REDIS_URL)
        : null;

    const app = express();

    app.get('/', async (req, res) => {
        try {
            res.send(stringify(renderSearchForm({})));
        } catch (err) {
            internalServerError(res, err);
        }
    });

    async function performSearch(searchQuery: string): Promise<SearchResults<string>> {
        let searchResults = redisClient !== null
            ? await searchCache(redisClient, searchQuery)
            : null;

        if (searchResults === null) {
            searchResults = await searchEs(es, searchQuery);
            if (redisClient !== null) {
                cacheResults(redisClient, searchQuery, searchResults);
            }
        }

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
