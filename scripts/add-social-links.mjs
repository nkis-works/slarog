import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const pagePaths = [
  "index.html",
  "ja/index.html",
  "en/index.html",
  "products/slarog/index.html",
  "products/playlist-toolkit/index.html",
  "products/playlist-toolkit/ja/index.html",
  "products/playlist-toolkit/de/index.html",
  "products/playlist-toolkit/es/index.html",
  "products/playlist-toolkit/fr/index.html",
  "products/playlist-toolkit/it/index.html",
  "products/playlist-toolkit/pt-br/index.html",
  "products/playlist-toolkit/pt-BR/index.html",
];

const roots = [process.cwd(), resolve(process.cwd(), "dist")];

function socialLinks(relativePath) {
  const japanese =
    relativePath === "index.html" ||
    relativePath.startsWith("ja/") ||
    relativePath.includes("/ja/") ||
    relativePath.includes("/slarog/");
  const xLabel = japanese ? "NKIS Works 公式X" : "NKIS Works on X";
  const noteLabel = japanese ? "NKIS Works 公式note" : "NKIS Works on note";

  return `\n          <a data-nkis-social="x" href="https://x.com/NKIS_Works" target="_blank" rel="noopener noreferrer">${xLabel}</a>\n          <a data-nkis-social="note" href="https://note.com/nkisworks" target="_blank" rel="noopener noreferrer">${noteLabel}</a>`;
}

function addLinks(html, relativePath) {
  if (html.includes('data-nkis-social="x"')) return html;

  const footerStart = html.lastIndexOf("<footer");
  const footerEnd = html.indexOf("</footer>", footerStart);
  if (footerStart < 0 || footerEnd < 0) {
    throw new Error(`Footer not found: ${relativePath}`);
  }

  const navEnd = html.lastIndexOf("</nav>", footerEnd);
  const links = socialLinks(relativePath);
  if (navEnd > footerStart) {
    return `${html.slice(0, navEnd)}${links}\n        ${html.slice(navEnd)}`;
  }

  return `${html.slice(0, footerEnd)}\n        <nav aria-label="NKIS Works social links">${links}\n        </nav>\n      ${html.slice(footerEnd)}`;
}

for (const root of roots) {
  for (const relativePath of pagePaths) {
    const path = resolve(root, relativePath);
    try {
      const html = await readFile(path, "utf8");
      const updated = addLinks(html, relativePath);
      if (updated !== html) await writeFile(path, updated);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}
