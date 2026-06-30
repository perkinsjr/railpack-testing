// Production server: serves the Vite build output in ./dist.
// Run `pnpm build` first to produce dist/. Uses only node builtins.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("./dist", import.meta.url));
const PORT = process.env.PORT || 3000;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".png": "image/png",
};

const server = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: "unkey-railpack-test" }));
    return;
  }

  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") pathname = "/index.html";

  const filePath = normalize(join(DIST, pathname));
  if (!filePath.startsWith(DIST)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    res.setHeader("Content-Type", CONTENT_TYPES[extname(filePath)] || "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`[web] serving ./dist on :${PORT}`);
});
