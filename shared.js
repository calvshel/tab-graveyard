const TabGraveyard = (() => {
  const DEFAULT_SETTINGS = {
    inactivityHours: 4,
    protectedDomains: [],
  };

  function normaliseSettings(settings) {
    const inactivityHours = Number(settings?.inactivityHours);
    const protectedDomains = Array.isArray(settings?.protectedDomains) ? settings.protectedDomains : [];
    return {
      inactivityHours: Number.isFinite(inactivityHours) ? Math.min(Math.max(inactivityHours, 0.25), 168) : DEFAULT_SETTINGS.inactivityHours,
      protectedDomains: protectedDomains
        .map((domain) => String(domain).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 100),
    };
  }

  function protectedDomainMatches(url, protectedDomains) {
    if (!url) return true;
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) return true;
    try {
      const host = new URL(url).hostname.toLowerCase();
      return protectedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return true;
    }
  }

  function markdownEscape(value) {
    return String(value || "")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");
  }

  function buildMarkdown(entries) {
    const lines = [
      "# Tab Graveyard",
      "",
      `Exported: ${new Date().toISOString()}`,
      "",
      "| Title | URL | Buried Timestamp |",
      "| --- | --- | --- |",
    ];

    for (const entry of entries) {
      lines.push(
        `| ${markdownEscape(entry.title)} | ${markdownEscape(entry.url)} | ${markdownEscape(entry.buriedAt)} |`
      );
    }

    if (entries.length === 0) {
      lines.push("| - | - | - |");
    }

    return lines.join("\n");
  }

  function parseMarkdown(markdown) {
    const lines = String(markdown || "").split(/\r?\n/);
    const rows = [];
    let inTable = false;

    for (const line of lines) {
      if (line.startsWith("| Title | URL | Buried Timestamp |")) {
        inTable = true;
        continue;
      }
      if (!inTable) {
        continue;
      }
      if (!line.startsWith("|")) {
        if (rows.length > 0) {
          break;
        }
        continue;
      }
      if (/^\|[-\s|]+\|$/.test(line)) {
        continue;
      }
      const cells = [];
      let current = "";
      let escaped = false;
      for (let i = 1; i < line.length - 1; i += 1) {
        const char = line[i];
        if (escaped) {
          current += char;
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === "|") {
          cells.push(current.trim());
          current = "";
          continue;
        }
        current += char;
      }
      cells.push(current.trim());
      if (cells.length !== 3 || cells[0] === "Title") {
        continue;
      }
      rows.push({
        title: cells[0],
        url: cells[1],
        buriedAt: cells[2],
      });
    }

    return rows.filter((entry) => entry.url);
  }

  return {
    DEFAULT_SETTINGS,
    normaliseSettings,
    protectedDomainMatches,
    markdownEscape,
    buildMarkdown,
    parseMarkdown,
  };
})();

globalThis.TabGraveyard = TabGraveyard;
