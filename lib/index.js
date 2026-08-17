import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
//#region src/index.ts
/**
* rc.6 resolves client packages from the in-box module registry's dependency
* base, so an out-of-tree profile dependency may not enter __DSH_BOOT__. This
* host bridge uses the public WebServer route/index taps to provide the same
* graph row. The browser script is duplicate-safe for future native support.
*/
const CLIENT_ID = "dsh-message-navigator";
const CLIENT_PATH = fileURLToPath(new URL("./client.js", import.meta.url));
const MAP_PATH = `${CLIENT_PATH}.map`;
const CLIENT_ROUTE = `/plugins/${CLIENT_ID}/client.js`;
const MAP_ROUTE = `${CLIENT_ROUTE}.map`;
const CLIENT_INJECT = [
	"@deepseek-ai/dsh-client-runtime",
	"@deepseek-ai/dsh-client-ui-layout",
	"@deepseek-ai/dsh-client-ui-conversation"
];
const inject = ["webServer"];
function bundleRevision() {
	return createHash("sha1").update(readFileSync(CLIENT_PATH)).digest("hex").slice(0, 12);
}
function serveFile(path, contentType) {
	return async (req, res) => {
		if (req.method !== "GET" && req.method !== "HEAD") {
			res.writeHead(405, { Allow: "GET, HEAD" });
			res.end();
			return;
		}
		try {
			const body = await readFile(path);
			res.writeHead(200, {
				"Content-Type": contentType,
				"Content-Length": String(body.byteLength),
				"Cache-Control": "public, max-age=31536000, immutable"
			});
			res.end(req.method === "HEAD" ? void 0 : body);
		} catch {
			res.writeHead(404);
			res.end();
		}
	};
}
function injectBootEntry(html, revision) {
	const entry = JSON.stringify({
		id: CLIENT_ID,
		url: `${CLIENT_ROUTE}?rev=${revision}`,
		rev: revision,
		inject: CLIENT_INJECT
	}).replaceAll("<", "\\u003c");
	const script = [
		"<script data-dsh-message-navigator-boot>",
		"(()=>{const b=window.__DSH_BOOT__;if(!b||!Array.isArray(b.entries))return;",
		`if(!b.entries.some(e=>e.id===${JSON.stringify(CLIENT_ID)})){b.entries.push(${entry});b.rev+='-mn-${revision}';}})();`,
		"<\/script>"
	].join("");
	const headEnd = html.indexOf("</head>");
	return headEnd === -1 ? `${html}${script}` : `${html.slice(0, headEnd)}${script}${html.slice(headEnd)}`;
}
function apply(ctx) {
	const revision = bundleRevision();
	ctx.effect(() => {
		const disposeClient = ctx.webServer.register({
			kind: "exact",
			path: CLIENT_ROUTE,
			handler: serveFile(CLIENT_PATH, "text/javascript; charset=utf-8")
		});
		const disposeMap = ctx.webServer.register({
			kind: "exact",
			path: MAP_ROUTE,
			handler: serveFile(MAP_PATH, "application/json; charset=utf-8")
		});
		const disposeIndex = ctx.webServer.tapIndex((html) => injectBootEntry(html, revision));
		return () => {
			disposeIndex();
			disposeMap();
			disposeClient();
		};
	}, "message-navigator: out-of-tree client bridge");
}
//#endregion
export { apply, inject };
