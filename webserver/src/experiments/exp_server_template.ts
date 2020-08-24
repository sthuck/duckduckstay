import { renderSearchForm } from "../templates/searchForm";
import { stringify } from "../templates/jsx_string";

export async function main() {
    const x = stringify(renderSearchForm({}));
    console.log(x);
}

if (require.main === module) {
    main();
}
