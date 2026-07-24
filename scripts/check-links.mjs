import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const errors = [];

async function findHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findHtml(path);
    return entry.isFile() && extname(entry.name) === ".html" ? [path] : [];
  }));
  return nested.flat().sort();
}

const htmlFiles = await findHtml(root);
const idsByFile = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value);
}

async function resolveTarget(sourcePath, pathname) {
  if (!pathname) return sourcePath;
  let targetPath = pathname.startsWith("/")
    ? join(root, pathname.slice(1))
    : join(dirname(sourcePath), pathname);
  targetPath = normalize(targetPath);
  try {
    if ((await stat(targetPath)).isDirectory()) targetPath = join(targetPath, "index.html");
  } catch {
    if (!extname(targetPath) && pathname.endsWith("/")) targetPath = join(targetPath, "index.html");
  }
  return targetPath;
}

for (const sourcePath of htmlFiles) {
  const html = await readFile(sourcePath, "utf8");
  const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of references) {
    if (!reference || isExternal(reference)) continue;
    const [pathname, fragment] = reference.split("#", 2);
    const targetPath = await resolveTarget(sourcePath, pathname);
    if (!(targetPath === root || targetPath.startsWith(`${root}${sep}`))) {
      errors.push(`${relative(root, sourcePath)}: path escapes dist/: ${reference}`);
      continue;
    }
    try {
      await access(targetPath);
    } catch {
      errors.push(`${relative(root, sourcePath)}: missing target ${reference}`);
      continue;
    }
    if (fragment && extname(targetPath) === ".html") {
      const ids = idsByFile.get(targetPath);
      if (!ids?.has(fragment)) {
        errors.push(`${relative(root, sourcePath)}: missing fragment #${fragment} in ${relative(root, targetPath)}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files: internal links and assets are valid.`);
}
