import { searchEs } from "../searchEs";
import { getEsConfig } from "../es_client";

export async function main() {
    const es = getEsConfig();

    console.log("Searching...");

    await searchEs(es, "snake");
}

if (require.main === module) {
    main();
}
