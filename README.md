# Codeforces Friend Solved Tracker

A compact Chrome extension for checking Codeforces friend solves without opening filters by hand.

![Codeforces Friend Solved Tracker preview](./assets/banner.png)

## The Idea

When you open a Codeforces problem, this extension adds a small sidebar widget that tells you how many of your friends have an accepted submission for that problem.

It keeps the page clean: no solution list, no preview panel, no clutter. Just the count and one `Open status` button that takes you to Codeforces' own friends-only accepted submissions page.

## Features

- Shows friend accepted count on Codeforces problem pages.
- Opens the official filtered Codeforces status page in one click.
- Works on problemset, contest, gym, and group contest problem URLs.
- Supports saved handles as a fallback.
- Can import your Codeforces friends through the official API.
- Uses no backend server.

## Install

1. Download the latest release zip.
2. Extract it.
3. Open `chrome://extensions`.
4. Turn on `Developer mode`.
5. Click `Load unpacked`.
6. Select the extracted folder containing `manifest.json`.

## Supported Pages

```text
https://codeforces.com/problemset/problem/<contestId>/<index>
https://codeforces.com/contest/<contestId>/problem/<index>
https://codeforces.com/gym/<contestId>/problem/<index>
https://codeforces.com/group/<groupCode>/contest/<contestId>/problem/<index>
```

## Privacy

- No tracking.
- No analytics.
- No external backend.
- API credentials, if used, stay in your browser storage.
- The extension only reads Codeforces pages/API responses needed for the widget.

## Notes

- You need to be logged in on Codeforces for the native `friends=on` filter to use your actual friend list.
- This extension intentionally does not show other people's solution code.
- Please avoid checking solutions during live contests or virtual participation.

## Built With

- Chrome Extension Manifest V3
- Vanilla JavaScript
- Codeforces status pages
- Codeforces public API

## Roadmap

- Add a real screenshot/GIF demo.
- Improve layout support for more Codeforces page variants.
- Add a small build/release workflow.
- Publish to the Chrome Web Store after more testing.
