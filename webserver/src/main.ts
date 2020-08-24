import { startServer } from "./server";

async function main() {
    startServer(3000);
}

if (require.main === module) {
    main();
}
