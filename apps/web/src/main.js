// Client entry — bundled by Vite at build time.
// Imports the shared `@repo/reference` workspace package so the workspace
// dependency is exercised during the build (Vite bundles it into dist/).
import { listKeys, greeting, SERVICE_NAME } from "@repo/reference";

document.title = SERVICE_NAME;

const rows = listKeys()
  .map(
    (k) =>
      `<tr><td>${k.id}</td><td>${k.name}</td><td>${
        k.enabled ? "✅" : "⛔️"
      }</td><td>${k.requests}</td></tr>`
  )
  .join("");

document.querySelector("#app").innerHTML = `
  <h1>${greeting()}</h1>
  <p>Mocked API keys served from the <code>@repo/reference</code> workspace package,
     bundled at build time by Vite.</p>
  <table>
    <thead>
      <tr><th>ID</th><th>Name</th><th>Enabled</th><th>Requests</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
`;
