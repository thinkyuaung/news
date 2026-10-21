// PostToolUse hook (Edit | Write | MultiEdit): runs right after Claude changes a file
// and formats that file with Prettier. Files Prettier doesn't know, or that are
// listed in .prettierignore, are skipped automatically (--ignore-unknown).
import { existsSync } from "node:fs";
import { prettierInstalled, readHookInput, runPrettier } from "./prettier.mjs";

const input = readHookInput();
const file = input.tool_input?.file_path;

if (!file || !existsSync(file) || !prettierInstalled()) process.exit(0);

const result = runPrettier([
  "--write",
  "--ignore-unknown",
  "--no-color",
  "--log-level",
  "warn",
  file,
]);

if (result.status !== 0) {
  // Usually a syntax error. Tell Claude (exit 2 sends stderr back) so it can fix it.
  console.error(`Prettier could not format ${file}:\n${result.stderr || result.stdout}`);
  process.exit(2);
}
