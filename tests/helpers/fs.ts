export { readdirSync };
import { readdirSync, readFileSync as fsReadFileSync, statSync as fsStatSync } from "node:fs";
import { join } from "node:path";

export function readFileSync(path: string): string {
  return fsReadFileSync(join(process.cwd(), path), "utf8");
}

export function statSync(path: string) {
  return fsStatSync(join(process.cwd(), path));
}

export function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}
