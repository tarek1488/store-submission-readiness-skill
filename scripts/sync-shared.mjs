#!/usr/bin/env node
// Copies shared/references/*.md into every skill's references/ folder.
//
// Skills are installed one folder at a time, so each one has to carry its own
// copy of the shared guidance. shared/references/ is the only place to edit;
// the copies under skills/ are generated.
//
//   node scripts/sync-shared.mjs          write the copies
//   node scripts/sync-shared.mjs --check  exit 1 if any copy is missing or stale

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharedDir = join(root, "shared", "references");
const skillsDir = join(root, "skills");
const checkOnly = process.argv.includes("--check");

const sharedFiles = readdirSync(sharedDir).filter((name) => name.endsWith(".md"));
const skills = readdirSync(skillsDir).filter(
  (name) =>
    statSync(join(skillsDir, name)).isDirectory() &&
    existsSync(join(skillsDir, name, "SKILL.md")),
);

const stale = [];

for (const skill of skills) {
  for (const file of sharedFiles) {
    const source = readFileSync(join(sharedDir, file), "utf8");
    const target = join(skillsDir, skill, "references", file);
    const current = existsSync(target) ? readFileSync(target, "utf8") : null;

    if (current === source) continue;

    if (checkOnly) {
      stale.push(`skills/${skill}/references/${file}`);
    } else {
      writeFileSync(target, source);
      console.log(`synced skills/${skill}/references/${file}`);
    }
  }
}

if (checkOnly && stale.length > 0) {
  console.error("Out of date — run `node scripts/sync-shared.mjs`:");
  for (const path of stale) console.error(`  ${path}`);
  process.exit(1);
}

console.log(
  checkOnly
    ? `ok: ${skills.length} skills x ${sharedFiles.length} shared references in sync`
    : "done",
);
