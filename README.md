# Tab Graveyard

Tab Graveyard is a Manifest V3 Chrome extension that quietly buries tabs you forgot about. If a tab stays inactive for more than four hours, it is closed, catalogued, and stored in a local graveyard so you can export the whole archive later as Markdown.

## Features

- Automatically tracks tab activity with Chrome alarms and tab events
- Bury tabs that have been inactive for more than four hours
- Store title, URL, and burial timestamp locally in the browser
- Dark-mode popup with live buried-tab count
- One-click Markdown export to `graveyard.md`
- Clears local extension storage after export

## Installation

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `tab-graveyard` folder.
5. Pin the extension if you want quick access from the toolbar.

## Usage

- Let the extension run in the background.
- Open the popup to see how many tabs are in the graveyard.
- Click `Exhume Graveyard` to download a Markdown archive and clear local storage.

## Notes

- The extension uses only local browser storage.
- It is designed for personal productivity and does not sync data across devices.
- Tabs that are pinned, internal browser pages, or currently active are ignored.

## MIT License

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
