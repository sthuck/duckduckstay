import { Client } from '@elastic/elasticsearch';

const ES = process.env['ES'];
if (!ES) {
    throw new Error("ES env var required");
}

const client = new Client({ node: ES })

async function main() {
    // await client.index({
    //     index: 'game-of-thrones',
    //     body: {
    //         character: 'Ned Stark',
    //         quote: 'Winter is coming.'
    //     }
    // })

    // here we are forcing an index refresh, otherwise we will not
    // get any result in the consequent search
    await client.indices.refresh({ index: 'game-of-thrones' })

    // Let's search!
    const { body } = await client.search({
        index: 'game-of-thrones',
        body: {
            query: {
                match: { quote: 'Ned' }
            }
        }
    })

    console.log(body.hits.hits)
}

main();
