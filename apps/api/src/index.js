import { createServer } from "node:http";
import { listKeys, verifyKey, greeting, SERVICE_NAME } from "@repo/reference";

const PORT = process.env.PORT || 3001;

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader("Content-Type", "application/json");

  if (url.pathname === "/health") {
    res.end(JSON.stringify({ status: "ok", service: SERVICE_NAME }));
    return;
  }

  if (url.pathname === "/keys") {
    res.end(JSON.stringify({ keys: listKeys() }));
    return;
  }

  if (url.pathname === "/verify") {
    const id = url.searchParams.get("id") || "";
    res.end(JSON.stringify(verifyKey(id)));
    return;
  }

  res.end(JSON.stringify({ message: greeting() }));
});

server.listen(PORT, () => {
  console.log(`[api] ${greeting()} — listening on :${PORT}`);
});
