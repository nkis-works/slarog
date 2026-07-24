import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const htmlFiles = (await readdir(root))
  .filter((file) => extname(file) === ".html")
  .sort();
const errors = [];
const idsByFile = new Map();

for (const file of htmlFiles) {
  const html = await readFile(join(root, file), "utf8");
  idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value);
}

for (const file of htmlFiles) {
  const sourcePath = join(root, file);
  const html = await readFile(sourcePath, "utf8");
  const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of references) {
    if (!reference || isExternal(reference)) continue;
    const [pathname, fragment] = reference.split("#", 2);
    const targetName = pathname || file;
    const targetPath = normalize(join(dirname(sourcePath), targetName));
    if (!(targetPath === root || targetPath.startsWith(`${root}${sep}`))) {
      errors.push(`${file}: path escapes dist/: ${reference}`);
      continue;
    }
    try {
      await access(targetPath);
    } catch {
      errors.push(`${file}: missing target ${reference}`);
      continue;
    }
    if (fragment && extname(targetPath) === ".html") {
      const targetFile = targetPath.slice(root.length + 1);
      const ids = idsByFile.get(targetFile);
      if (!ids?.has(fragment)) {
        errors.push(`${file}: missing fragment #${fragment} in ${targetFile}`);
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
