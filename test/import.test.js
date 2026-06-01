const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadShared() {
  const source = fs.readFileSync(path.join(__dirname, "..", "shared.js"), "utf8");
  const context = { URL, globalThis: {} };
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: "shared.js" });
  return context.TabGraveyard;
}

test("parseMarkdown reads the exported graveyard table", () => {
  const shared = loadShared();
  const markdown = [
    "# Tab Graveyard",
    "",
    "| Title | URL | Buried Timestamp |",
    "| --- | --- | --- |",
    "| Example \\| One | https://example.com | 2026-06-01T07:30:00.000Z |",
  ].join("\n");

  assert.deepEqual(JSON.parse(JSON.stringify(shared.parseMarkdown(markdown))), [
    {
      title: "Example | One",
      url: "https://example.com",
      buriedAt: "2026-06-01T07:30:00.000Z",
    },
  ]);
});

test("parseMarkdown ignores unrelated text", () => {
  const shared = loadShared();
  assert.equal(shared.parseMarkdown("nothing useful here").length, 0);
});
