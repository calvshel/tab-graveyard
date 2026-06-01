const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadShared() {
  const source = fs.readFileSync(path.join(__dirname, "..", "shared.js"), "utf8");
  const context = {
    console,
    URL,
    globalThis: {},
  };
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: "shared.js" });
  return context.TabGraveyard;
}

test("normaliseSettings applies sane bounds", () => {
  const shared = loadShared();
  assert.deepEqual(JSON.parse(JSON.stringify(shared.normaliseSettings({ inactivityHours: "9.5", protectedDomains: [" GitHub.com ", "", "docs.google.com"] }))), {
    inactivityHours: 9.5,
    protectedDomains: ["github.com", "docs.google.com"],
  });
  assert.equal(shared.normaliseSettings({ inactivityHours: 999 }).inactivityHours, 168);
});

test("protectedDomainMatches protects browser internals and subdomains", () => {
  const shared = loadShared();
  assert.equal(shared.protectedDomainMatches("chrome://extensions", ["example.com"]), true);
  assert.equal(shared.protectedDomainMatches("https://mail.google.com", ["google.com"]), true);
  assert.equal(shared.protectedDomainMatches("https://example.com", ["google.com"]), false);
});

test("buildMarkdown renders an empty graveyard table", () => {
  const shared = loadShared();
  const markdown = shared.buildMarkdown([]);
  assert.match(markdown, /# Tab Graveyard/);
  assert.match(markdown, /\| - \| - \| - \|/);
});
