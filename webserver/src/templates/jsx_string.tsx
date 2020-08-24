export namespace React {
    export function createElement(tag: string, attrs: {[index: string]: string;} | null, ...children: Child[]): Elem {
        let html: string = "";

        if (attrs === null) {
            html += `<${escapeHtml(tag)}>`;
        } else {
            html += `<${escapeHtml(tag)} `;

            for (const key of Object.keys(attrs)) {
                html += `${key}="${attrs[key]}" `;
            }

            html += ">";
        }

        for (const child of children) {
            html += renderChild(child);
        }

        html += `</${escapeHtml(tag)}>`;

        return new Elem(html);
    }
}

function renderChild(child: Child): string {
    if (child instanceof Elem) {
        return child.html;
    } else if (child === null || child === undefined) {
        return "";
    } else if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") {
        return escapeHtml(`${child}`);
    } else {
        return child.map(renderChild).join("");
    }
}

type Child = Elem | string | number | boolean | null | undefined | Child[];

export class Elem {
    constructor(public readonly html: string) {}
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function stringify(tmpl: JSX.Element): string {
    return ((tmpl as any) as Elem).html;
}
