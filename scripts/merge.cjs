// scripts/merge.cjs
const fs = require("fs");
const path = require("path");

const topicsPath = path.join(__dirname, "..", "src/data/topics.json");
const claudePath = path.join(__dirname, "claude_topics.json");

if (!fs.existsSync(claudePath)) {
  console.error("Error: claude_topics.json not found next to this script.");
  process.exit(1);
}

const localList = JSON.parse(fs.readFileSync(topicsPath, "utf8"));
const claudeList = JSON.parse(fs.readFileSync(claudePath, "utf8"));

const map = new Map();

// Seed with existing list
for (const item of localList) {
  map.set(item.id, item);
}

// Merge Claude items
let addedCount = 0;
for (const item of claudeList) {
  if (!map.has(item.id)) {
    map.set(item.id, {
      ...item,
      box: item.box || 1,
      streak: 0,
      nextEligibleTrial: 0,
      status: item.status || "locked",
    });
    addedCount++;
  }
}

const merged = Array.from(map.values());
fs.writeFileSync(topicsPath, JSON.stringify(merged, null, 2));

console.log(
  `Merge complete! Added ${addedCount} novel topics. Total topics: ${merged.length}`,
);
