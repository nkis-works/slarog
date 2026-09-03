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
  const slarog = relativePath.includes("/slarog/");
  const japanese =
    relativePath === "index.html" ||
    relativePath.startsWith("ja/") ||
    relativePath.includes("/ja/") ||
    slarog;
  const xUrl = slarog ? "https://x.com/slarog_app" : "https://x.com/NKIS_Works";
  const xLabel = slarog
    ? "スラログ公式X"
    : japanese
      ? "NKIS Works 公式X"
      : "NKIS Works on X";
  const xLink = `<a data-nkis-social="x" href="${xUrl}" target="_blank" rel="noopener noreferrer">${xLabel}</a>`;

  if (!slarog) return `\n          ${xLink}`;
  return `\n          ${xLink}\n          <a data-nkis-social="note" href="https://note.com/nkisworks" target="_blank" rel="noopener noreferrer">スラログ公式note</a>`;
}

function addLinks(html, relativePath) {
  const cleaned = html.replace(
    /\n?\s*<a data-nkis-social="(?:x|note)"[^>]*>.*?<\/a>/g,
    "",
  );

  const footerStart = cleaned.lastIndexOf("<footer");
  const footerEnd = cleaned.indexOf("</footer>", footerStart);
  if (footerStart < 0 || footerEnd < 0) {
    throw new Error(`Footer not found: ${relativePath}`);
  }

  const navEnd = cleaned.lastIndexOf("</nav>", footerEnd);
  const links = socialLinks(relativePath);
  if (navEnd > footerStart) {
    return `${cleaned.slice(0, navEnd)}${links}\n        ${cleaned.slice(navEnd)}`;
  }

  return `${cleaned.slice(0, footerEnd)}\n        <nav aria-label="NKIS Works social links">${links}\n        </nav>\n      ${cleaned.slice(footerEnd)}`;
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
