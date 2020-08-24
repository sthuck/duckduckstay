import express from "express";
import { stringify } from "./templates/jsx_string";
import { renderSearchForm, renderSearchResults } from "./templates/searchForm";
import { searchEs } from "./searchEs";
import { getEsConfig } from "./es_client";

export function startServer(port: number): void {
    const es = getEsConfig();

    const app = express();

    app.get('/', async (req, res) => {
        try {
            res.send(stringify(renderSearchForm({})));
        } catch (err) {
            internalServerError(res, err);
        }
    })

    app.get('/search', async (req, res) => {
        try {
            const searchQuery = req.query["search"];

            if (typeof searchQuery !== "string") {
                res.status(307).location("/");
                return;
            }

            const searchResults = await searchEs(es, searchQuery);

            res.send(stringify(renderSearchResults({
                searchQuery: searchQuery,
                searchResults: searchResults
            })));
        } catch (err) {
            internalServerError(res, err);
        }
    })

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

function internalServerError(res: express.Response<unknown>, err: any): void {
    res.status(500).contentType("text/plain").send(`Internal server error:\n\n${err.message}\n\n${err.stack}`);
}