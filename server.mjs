import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT) || 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, safePath);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = MIME_TYPES[extname(filePath)] ?? "application/octet-stream";
  response.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(response);
}).listen(PORT, () => {
  console.log(`Snake server running at http://localhost:${PORT}`);
});
