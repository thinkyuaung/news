// PreToolUse hook (Bash): runs before Claude runs a shell command.
// If the command is a `git commit`, check formatting first and BLOCK the commit
// when any file isn't formatted. Exit code 2 = block, and stderr goes back to Claude.
import { prettierInstalled, readHookInput, runPrettier } from "./prettier.mjs";

const input = readHookInput();
const command = input.tool_input?.command ?? "";

// Matches `git commit` at the start of the command or after ; && || | ( or a newline,
// so text like `echo "git commit"` doesn't trigger it.
// Also allows options before `commit`, including ones that take a value (git -C dir commit).
const isCommit = /(^|[;&|(\n])\s*git\s+(-[cC]\s+\S+\s+|-\S+\s+)*commit\b/.test(command);

if (!isCommit) process.exit(0); // not a commit: allow
if (!prettierInstalled()) process.exit(0); // nothing to check with yet (run npm install)

// --list-different prints just the names of files that need formatting.
const result = runPrettier(["--list-different", "."]);
const files = result.stdout.split(/\r?\n/).filter(Boolean);

if (result.status !== 0 || files.length > 0) {
  console.error(
    "Commit blocked by the Prettier pre-commit hook. These files are not formatted:\n" +
      (files.length ? files.map((f) => `  ${f}`).join("\n") : result.stderr) +
      "\nRun `npm run format`, review the changes, then commit again.",
  );
  process.exit(2);
}
