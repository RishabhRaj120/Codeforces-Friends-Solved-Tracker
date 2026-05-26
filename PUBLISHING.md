# Publishing

## Chrome Web Store

Chrome Web Store publishing requires a registered developer account and a one-time $5 registration fee.

### Before Uploading

1. Test the extension locally via `chrome://extensions`.
2. Zip only the required files: `manifest.json`, `content.js`, `content.css`, `popup.html`, `popup.js`, `popup.css`.
3. Make sure `manifest.json` is at the root of the ZIP.

### Store Listing Draft

**Name:** `Codeforces Friend Solved Tracker`

**Short description:**
`Shows how many Codeforces friends have solved the current problem, directly on the problem page.`

**Detailed description:**
`Codeforces Friend Solved Tracker adds a small sidebar widget to every Codeforces problem page showing the number of your friends with an accepted submission. One button opens the official Codeforces status page filtered to friends-only accepted submissions. It supports problemset, contest, gym, and group contest URLs. No backend, no data collection, no solution code is ever shown.`

**Single purpose:**
`Display the number of accepted friend submissions for the currently viewed Codeforces problem.`

**Privacy declaration:**
`The extension stores only user-provided handles and optional API credentials in Chrome local storage. It does not collect, sell, transmit, or share any user data.`

**Suggested category:** `Productivity`

### Upload Steps

1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with the Google account that will own the extension.
3. Click **Add new item**.
4. Upload the ZIP file.
5. Complete the Store Listing, Privacy, Distribution, and Test Instructions tabs.
6. Submit for review.

### Updating Later

Increment the `version` field in `manifest.json`, rebuild the ZIP, upload the new package, and submit for review again.

---

## Free GitHub Option

No fee required. Users install manually:

1. Go to the [Releases page](../../releases).
2. Download the latest ZIP.
3. Extract it.
4. Open `chrome://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked** and select the extracted folder.

> Note: manual install requires Developer mode. One-click install is only available through the Chrome Web Store.

---

## Notes

- Keep permissions minimal. This extension uses `storage`, `scripting`, and a Codeforces content script only.
- Do not load remote JavaScript. Manifest V3 review rejects extensions that fetch and execute remote code.
- If you add features that collect or transmit data, update the privacy declaration before publishing.
