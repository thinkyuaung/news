// Shared helpers for the Prettier hooks.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const PRETTIER_BIN = join(PROJECT_DIR, "node_modules", "prettier", "bin", "prettier.cjs");

export function prettierInstalled() {
  return existsSync(PRETTIER_BIN);
}

/** Run the project's own Prettier with `node`, so it works the same on Windows, macOS and Linux. */
export function runPrettier(args) {
  return spawnSync(process.execPath, [PRETTIER_BIN, ...args], {
    cwd: PROJECT_DIR,
    encoding: "utf8",
  });
}

/** Claude Code sends the tool call as JSON on stdin. */
export function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}
