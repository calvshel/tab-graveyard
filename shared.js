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

  return {
    DEFAULT_SETTINGS,
    normaliseSettings,
    protectedDomainMatches,
    markdownEscape,
    buildMarkdown,
  };
})();

globalThis.TabGraveyard = TabGraveyard;
