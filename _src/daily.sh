#!/usr/bin/env bash
# Rebuild Robot Ninja from _src/content.json into the repo root, then check links.
# Usage (from the repo root): bash _src/daily.sh
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
node _src/build.js _src/content.json "$tmp"
cp -a "$tmp"/. ./
rm -rf "$tmp"
node -e '
const fs=require("fs");let bad=0;
for(const f of fs.readdirSync(".").filter(f=>f.endsWith(".html"))){
  const h=fs.readFileSync(f,"utf8");
  for(const m of h.matchAll(/href="\/?([^"#:?]+\.(?:html|xml))"/g)){ if(!fs.existsSync(m[1])){console.error("Broken link in "+f+": "+m[1]);bad++;} }
}
if(fs.readFileSync("CNAME","utf8").trim()!=="robot-ninja.com"){console.error("CNAME is wrong");bad++;}
if(bad){process.exit(1)}console.log("Links OK, CNAME OK");'
