import { createServer } from "node:http";
import { listKeys, greeting, SERVICE_NAME } from "@repo/reference";

const PORT = process.env.PORT || 3000;

function renderPage() {
  const rows = listKeys()
    .map(
      (k) =>
        `<tr><td>${k.id}</td><td>${k.name}</td><td>${
          k.enabled ? "✅" : "⛔️"
        }</td><td>${k.requests}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SERVICE_NAME}</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 640px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
      th { background: #f5f5f5; }
    </style>
  </head>
  <body>
    <h1>${greeting()}</h1>
    <p>Mocked API keys served from the <code>@repo/reference</code> workspace package.</p>
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Enabled</th><th>Requests</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: SERVICE_NAME }));
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(renderPage());
});

server.listen(PORT, () => {
  console.log(`[web] ${greeting()} — listening on :${PORT}`);
});
