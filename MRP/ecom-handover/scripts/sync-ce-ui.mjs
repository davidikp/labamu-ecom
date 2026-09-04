#!/usr/bin/env node
/**
 * sync-ce-ui.mjs
 * --------------
 * Vendors the source of the shared design-system package
 * `@scvcashenable/ce_libraries_web_ui` into this project so its components can be
 * used (and duplicated/customized) locally without pulling from the private
 * GitHub npm registry.
 *
 * The library is TypeScript/React; Vite + esbuild compile the copied `.tsx`
 * files natively, so no build step is needed here — the synced files are
 * imported directly.
 *
 * Usage:
 *   node scripts/sync-ce-ui.mjs [options]
 *   npm run sync:ce-ui -- [options]
 *
 * Options:
 *   --source <path>  Path to the ce_libraries_web_ui repo
 *                    (default: ../ce_libraries_web_ui relative to project root)
 *   --dest <path>    Destination inside this project
 *                    (default: src/ce-ui)
 *   --pull           Run `git pull` in the source repo first (get latest)
 *   --clean          Remove the destination dir before copying (default: true)
 *   --no-clean       Keep existing files in the destination (overlay copy)
 *   --dry-run        Print what would happen without writing anything
 */

import { cp, rm, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---- args ------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    source: "../ce_libraries_web_ui",
    dest: "src/ce-ui",
    pull: false,
    clean: true,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--source") opts.source = argv[++i];
    else if (a === "--dest") opts.dest = argv[++i];
    else if (a === "--pull") opts.pull = true;
    else if (a === "--clean") opts.clean = true;
    else if (a === "--no-clean") opts.clean = false;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "-h" || a === "--help") {
      console.log(
        "Usage: node scripts/sync-ce-ui.mjs [--source <path>] [--dest <path>] [--pull] [--no-clean] [--dry-run]"
      );
      process.exit(0);
    } else {
      console.warn(`⚠️  Unknown option: ${a}`);
    }
  }
  return opts;
}

// ---- what gets copied ------------------------------------------------------
// Source paths are relative to the ce_libraries_web_ui repo root.
// `src/*` lands under <dest>/; root assets land alongside as listed.
const SOURCE_ITEMS = [
  // component source (folders + barrel)
  { from: "src/ui", to: "ui" },
  { from: "src/lib", to: "lib" },
  { from: "src/locale", to: "locale" },
  { from: "src/icons", to: "icons" },
  { from: "src/index.ts", to: "index.ts" },
  { from: "src/components.css", to: "components.css" },
  // root-level styles + tailwind preset the library ships with
  { from: "global.css", to: "styles/global.css" },
  { from: "labamu-token.css", to: "styles/labamu-token.css" },
  { from: "components.css", to: "styles/library-components.css" },
  { from: "labamu-tailwind-config.ts", to: "labamu-tailwind-config.ts" },
];

// Files/dirs never worth vendoring (tests, stories, specs, snapshots).
const EXCLUDE_RE = /(^|\/)(__tests__|__snapshots__)(\/|$)|\.(test|spec|stories)\.[tj]sx?$/;

function shouldSkip(absPath, sourceRoot) {
  const rel = relative(sourceRoot, absPath);
  return EXCLUDE_RE.test(rel);
}

// ---- helpers ---------------------------------------------------------------
async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

let copiedFiles = 0;

async function copyItem(from, to, sourceRoot, dryRun) {
  const src = resolve(sourceRoot, from);
  const dst = resolve(to);
  if (!(await exists(src))) {
    console.warn(`  ⚠️  skip (missing in source): ${from}`);
    return;
  }
  const info = await stat(src);
  if (dryRun) {
    console.log(`  would copy ${from} -> ${relative(PROJECT_ROOT, dst)}`);
    return;
  }
  await mkdir(dirname(dst), { recursive: true });
  await cp(src, dst, {
    recursive: true,
    force: true,
    filter: (s) => !shouldSkip(s, sourceRoot),
  });
  if (info.isDirectory()) {
    copiedFiles += await countFiles(dst);
    console.log(`  ✓ ${from}/  ->  ${relative(PROJECT_ROOT, dst)}/`);
  } else {
    copiedFiles += 1;
    console.log(`  ✓ ${from}  ->  ${relative(PROJECT_ROOT, dst)}`);
  }
}

async function countFiles(dir) {
  let n = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) n += await countFiles(p);
    else n += 1;
  }
  return n;
}

function tryGit(repo, args) {
  try {
    const out = execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
    });
    return out.trim();
  } catch (e) {
    return null;
  }
}

// ---- main ------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const sourceRoot = resolve(PROJECT_ROOT, opts.source);
  const destRoot = resolve(PROJECT_ROOT, opts.dest);

  console.log("🔄 Syncing ce_libraries_web_ui");
  console.log(`   source: ${sourceRoot}`);
  console.log(`   dest:   ${destRoot}`);
  if (opts.dryRun) console.log("   (dry run — no files written)\n");
  else console.log("");

  if (!existsSync(sourceRoot)) {
    console.error(
      `❌ Source not found: ${sourceRoot}\n` +
        `   Pass --source <path> to point at your ce_libraries_web_ui checkout.`
    );
    process.exit(1);
  }

  // Optionally refresh the source repo first.
  if (opts.pull) {
    const branch = tryGit(sourceRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
    console.log(`⬇️  git pull (${branch ?? "?"}) ...`);
    if (!opts.dryRun) {
      const res = tryGit(sourceRoot, ["pull", "--ff-only"]);
      console.log(res ? `   ${res}` : "   (pull skipped or failed)");
    }
    console.log("");
  }

  // Record the source commit for traceability.
  const commit = tryGit(sourceRoot, ["rev-parse", "--short", "HEAD"]);
  const branch = tryGit(sourceRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  let version = "unknown";
  try {
    const pkg = JSON.parse(
      await import("node:fs").then((fs) =>
        fs.readFileSync(join(sourceRoot, "package.json"), "utf8")
      )
    );
    version = pkg.version ?? "unknown";
  } catch {
    /* ignore */
  }

  // Clean destination.
  if (opts.clean && (await exists(destRoot))) {
    console.log(`🧹 Cleaning ${relative(PROJECT_ROOT, destRoot)}/`);
    if (!opts.dryRun) await rm(destRoot, { recursive: true, force: true });
  }
  if (!opts.dryRun) await mkdir(destRoot, { recursive: true });

  // Copy everything.
  console.log("\n📦 Copying:");
  for (const item of SOURCE_ITEMS) {
    await copyItem(item.from, join(destRoot, item.to), sourceRoot, opts.dryRun);
  }

  // Stamp a manifest so we know exactly what was vendored and from where.
  if (!opts.dryRun) {
    const manifest =
      `// AUTO-GENERATED by scripts/sync-ce-ui.mjs — do not edit by hand.\n` +
      `// Re-run \`npm run sync:ce-ui\` to refresh.\n` +
      JSON.stringify(
        {
          package: "@scvcashenable/ce_libraries_web_ui",
          version,
          gitBranch: branch,
          gitCommit: commit,
          source: sourceRoot,
        },
        null,
        2
      ) +
      "\n";
    await writeFile(join(destRoot, "SYNC_MANIFEST.json"), manifest);
  }

  console.log("\n✅ Done.");
  console.log(
    `   ${opts.dryRun ? "(would copy)" : copiedFiles + " files copied"}` +
      `  •  v${version}  •  ${branch ?? "?"}@${commit ?? "?"}`
  );
  console.log("\nNext steps:");
  console.log(
    `   • Import components, e.g.  import { MainBtn } from "@/ce-ui";`
  );
  console.log(
    `     (or relative:  import { MainBtn } from "./ce-ui";  from src/)`
  );
  console.log(
    `   • Add the library styles to src/index.css:\n` +
      `       @import "./ce-ui/styles/labamu-token.css";\n` +
      `       @import "./ce-ui/components.css";`
  );
  console.log(
    `   • Note: the library targets lucide-react ^1.x; this project has ^0.344.\n` +
      `     If icon imports break, bump lucide-react or adjust the icon imports.`
  );
}

main().catch((e) => {
  console.error("❌ sync failed:", e);
  process.exit(1);
});
