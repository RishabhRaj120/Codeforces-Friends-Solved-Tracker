<div align="center">

<img src="banner.png" alt="Codeforces Friend Solved Tracker" width="100%" />

<br/>
<br/>

# Codeforces Friend Solved Tracker

**A Chrome extension that tells you how many friends cracked a problem — without touching a single filter.**

<br/>

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-1565C0?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Backend](https://img.shields.io/badge/No_Backend-00C853?style=flat-square&logo=serverless&logoColor=white)](#privacy)
[![Codeforces](https://img.shields.io/badge/Codeforces-1F8ACB?style=flat-square&logo=codeforces&logoColor=white)](https://codeforces.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

<br/>

[**Install**](#-install) · [**Features**](#-features) · [**Supported Pages**](#-supported-pages) · [**Privacy**](#-privacy) · [**Roadmap**](#️-roadmap)

</div>

---

## The Problem

You're grinding Codeforces. You open a problem. You want to know — *did any of my friends solve this already?*

The official way: manually navigate to the status page, filter by friends, filter by accepted. That's five clicks and a page load every single time.

**This extension does it in zero.**

---

## ✦ Features

| | |
|---|---|
| 🟢 **Friend count on every problem** | See accepted friend submissions directly on the problem page — no navigation required. |
| 🔗 **One-click status page** | The `Open status` button jumps straight to Codeforces' official friends-only accepted submissions page. |
| 🗂️ **All page types supported** | Works on problemset, contest, gym, and group contest URLs. |
| 👤 **Saved handle fallback** | No API key? No problem. Add handles manually and it still works. |
| 📥 **API friend import** | Sync your full Codeforces friend list automatically using the official public API. |
| 🔒 **Zero backend** | Everything runs in your browser. No server. No middleman. |

---

## 📦 Install

> **Note:** Not yet on the Chrome Web Store. Install manually in developer mode — it takes under a minute.

1. Download the latest release `.zip` from the [Releases page](../../releases).
2. Extract the zip to a folder.
3. Open **`chrome://extensions`** in your browser.
4. Enable **Developer mode** (toggle in the top right).
5. Click **Load unpacked**.
6. Select the extracted folder that contains `manifest.json`.

Done. The widget will appear the next time you open any Codeforces problem page.

---

## 🌐 Supported Pages

The extension activates automatically on any of these URL patterns:

```
https://codeforces.com/problemset/problem/<contestId>/<index>
https://codeforces.com/contest/<contestId>/problem/<index>
https://codeforces.com/gym/<contestId>/problem/<index>
https://codeforces.com/group/<groupCode>/contest/<contestId>/problem/<index>
```

---

## 🔒 Privacy

This extension was built with a strict no-surveillance policy.

- **No tracking** — your usage is never recorded.
- **No analytics** — no event pings, no telemetry.
- **No external backend** — your data never leaves your browser.
- **Credentials stay local** — API keys (if used) live in your browser's storage only.
- **Read-only** — the extension only reads Codeforces pages and API responses required to render the widget. Nothing else.

---

## ⚠️ Notes

- You must be **logged in on Codeforces** for the `friends=on` filter to reflect your actual friend list.
- This extension **intentionally does not display solution code**. It only shows counts and links to the official filtered page.
- Please **avoid using this during live contests or virtual participation** — it's a practice tool, not a competitive advantage.

---

## 🛠️ Built With

- **Chrome Extension Manifest V3** — modern, secure extension platform
- **Vanilla JavaScript** — no frameworks, no bloat
- **Codeforces Public API** — for friend list import
- **Codeforces Status Pages** — native `friends=on` filter under the hood

---

## 🗺️ Roadmap

- [ ] Add real screenshot / GIF demo to this README
- [ ] Improve layout support for more Codeforces page variants
- [ ] Add a build and release workflow (GitHub Actions)
- [ ] Publish to the Chrome Web Store

---

## 🤝 Contributing

Issues and PRs are welcome. If you find a URL pattern that isn't handled, or a layout that breaks the widget, please open an issue with the full URL.

---

<div align="center">

Made for competitive programmers who hate clicking through filters.

</div>
