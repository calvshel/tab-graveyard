# Tab Graveyard

A privacy-first Chrome extension that closes stale tabs, keeps a local record of what it buried, and lets you export the whole graveyard as Markdown.

Tab Graveyard is for people who open research tabs with good intentions and then slowly turn Chrome into a museum. It watches tab activity in the background, closes tabs that have been inactive for more than four hours, and stores the title, URL, and burial timestamp locally so useful links are not lost.

## Features

- Manifest V3 Chrome extension with a lightweight service worker
- Tracks tab activity through Chrome tab events and scheduled alarms
- Automatically closes eligible tabs after four hours of inactivity
- Skips pinned tabs, active tabs, and internal browser pages
- Stores buried-tab metadata in `chrome.storage.local`
- Dark popup with a live buried-tab count
- One-click Markdown export to `graveyard.md`
- Clears the local graveyard after export
- Options page for inactivity threshold and protected domains
- Custom extension icons generated from the repository source
- Restore buried tabs directly from the popup

## Install From Source

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `tab-graveyard` directory.
6. Pin the extension from the toolbar if you want quick access to the graveyard count.

## Usage

Tab Graveyard starts working as soon as the unpacked extension is loaded. Keep browsing normally; inactive tabs are reviewed on a recurring alarm and closed only after they pass the four-hour threshold.

Open the extension popup to see how many tabs have been buried. Click `Exhume Graveyard` to download a Markdown archive and clear the stored graveyard.

Open the extension options page to adjust the inactivity threshold or protect domains that should never be buried.

The popup now also shows a small list of buried tabs with a `Restore` button for each entry.

## Markdown Export

Exports are written as a simple table:

```markdown
# Tab Graveyard

| Title | URL | Buried Timestamp |
| --- | --- | --- |
| Example | https://example.com | 2026-06-01T07:30:00.000Z |
```

## Privacy

Tab Graveyard does not use a server, analytics, tracking pixels, or external APIs. Tab metadata is stored only in local Chrome extension storage until you export and clear it.

## Development

This project intentionally has no build step. Edit the source files, then reload the unpacked extension from `chrome://extensions`.

```text
manifest.json   Extension metadata and permissions
background.js   Inactivity tracking and burial logic
popup.html      Popup layout and styling
popup.js        Graveyard count, Markdown export, and storage clearing
options.html    Settings UI
options.js      Settings persistence and validation
icons/          Extension icon source and generated PNGs
shared.js       Shared settings, markdown, and URL helpers
test/           Node-based helper tests
NOTES.md        Manual test notes and rough edges
```

## Roadmap

- Import previous Markdown exports
- Per-window burial rules
- Better search and filtering for large graveyards

## License

MIT License

Copyright (c) 2026 Calvin Shelwell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
