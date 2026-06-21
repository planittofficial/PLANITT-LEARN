import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { config } from "dotenv";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else if (existsSync(".env")) {
  config({ path: ".env" });
}

const args = process.argv.slice(2);
const result = spawnSync("prisma", args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
