(() => {
  const PANEL_ID = "cf-friend-solves-panel";
  const REFRESH_MESSAGE = "CF_FRIEND_SOLVES_REFRESH";
  const API_DELAY_MS = 2100;

  const DEFAULT_SETTINGS = {
    autoCheck: true,
    useCodeforcesFriends: true,
    manualFallback: false,
    friendHandles: [],
    scanCount: 50
  };

  let activeRun = null;
  let panelState = null;

  function parseProblemFromUrl() {
    const path = decodeURIComponent(window.location.pathname);
    const patterns = [
      { source: "problemset", re: /^\/problemset\/problem\/(\d+)\/([^/]+)\/?$/ },
      { source: "contest", re: /^\/contest\/(\d+)\/problem\/([^/]+)\/?$/ },
      { source: "gym", re: /^\/gym\/(\d+)\/problem\/([^/]+)\/?$/ },
      { source: "group", re: /^\/group\/([^/]+)\/contest\/(\d+)\/problem\/([^/]+)\/?$/ }
    ];

    for (const pattern of patterns) {
      const match = path.match(pattern.re);
      if (!match) {
        continue;
      }

      if (pattern.source === "group") {
        return {
          source: pattern.source,
          groupCode: match[1],
          contestId: Number(match[2]),
          index: match[3]
        };
      }

      return {
        source: pattern.source,
        contestId: Number(match[1]),
        index: match[2]
      };
    }

    return null;
  }

  function collapseText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeHandles(value) {
    const raw = Array.isArray(value) ? value.join("\n") : String(value || "");
    const seen = new Set();
    return raw
      .split(/[\s,;]+/)
      .map((handle) => handle.trim())
      .filter(Boolean)
      .filter((handle) => {
        const key = handle.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function normalizeSettings(values) {
    const settings = { ...DEFAULT_SETTINGS, ...(values || {}) };
    settings.friendHandles = normalizeHandles(settings.friendHandles);
    settings.scanCount = Math.max(1, Math.min(500, Number(settings.scanCount) || DEFAULT_SETTINGS.scanCount));
    settings.autoCheck = Boolean(settings.autoCheck);
    settings.useCodeforcesFriends = Boolean(settings.useCodeforcesFriends);
    settings.manualFallback = Boolean(settings.manualFallback);
    return settings;
  }

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (values) => {
        resolve(normalizeSettings(values));
      });
    });
  }

  function isLoggedIntoCodeforces() {
    const links = Array.from(document.querySelectorAll("a[href]"));
    return !links.some((link) => {
      try {
        const url = new URL(link.getAttribute("href"), window.location.origin);
        return url.pathname === "/enter" && collapseText(link.textContent).toLowerCase() === "enter";
      } catch (error) {
        return false;
      }
    });
  }

  function buildFriendsStatusUrl(problem) {
    const index = encodeURIComponent(problem.index);
    const query = "friends=on&verdict=OK&locale=en";

    if (problem.source === "gym") {
      return `${window.location.origin}/gym/${problem.contestId}/status/${index}?${query}`;
    }

    if (problem.source === "group") {
      return `${window.location.origin}/group/${problem.groupCode}/contest/${problem.contestId}/status/${index}?${query}`;
    }

    return `${window.location.origin}/problemset/status/${problem.contestId}/problem/${index}?${query}`;
  }

  function sameProblem(submission, problem) {
    const submittedProblem = submission && submission.problem ? submission.problem : {};
    return (
      Number(submittedProblem.contestId) === Number(problem.contestId) &&
      String(submittedProblem.index || "").toUpperCase() === String(problem.index || "").toUpperCase()
    );
  }

  function createPanel(problem) {
    const existing = document.getElementById(PANEL_ID);
    if (existing) {
      existing.remove();
    }

    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "cf-friend-solves-panel";

    const header = document.createElement("div");
    header.className = "cf-friend-solves-header";

    const mark = document.createElement("div");
    mark.className = "cf-friend-solves-mark";
    mark.textContent = "AC";

    const headerText = document.createElement("div");
    const title = document.createElement("div");
    title.className = "cf-friend-solves-title";
    title.textContent = "Friend solves";
    const subtitle = document.createElement("div");
    subtitle.className = "cf-friend-solves-subtitle";
    subtitle.textContent = `${problem.contestId}${problem.index}`;
    headerText.append(title, subtitle);

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "cf-friend-solves-button";
    refreshButton.dataset.action = "refresh";
    refreshButton.textContent = "Refresh";

    header.append(mark, headerText, refreshButton);

    const body = document.createElement("div");
    body.className = "cf-friend-solves-body";

    const status = document.createElement("div");
    status.className = "cf-friend-solves-status";
    status.dataset.role = "status";
    status.textContent = "Ready.";

    const footer = document.createElement("div");
    footer.className = "cf-friend-solves-footer";

    const statusLink = document.createElement("a");
    statusLink.className = "cf-friend-solves-link-button";
    statusLink.href = buildFriendsStatusUrl(problem);
    statusLink.target = "_blank";
    statusLink.rel = "noopener noreferrer";
    statusLink.textContent = "Open status";

    footer.append(statusLink);
    body.append(status, footer);
    panel.append(header, body);

    refreshButton.addEventListener("click", () => {
      refreshPanel({ force: true });
    });

    insertPanel(panel);
    return panel;
  }

  function insertPanel(panel) {
    const sidebar = document.querySelector("#sidebar, .sidebar");
    if (sidebar) {
      sidebar.prepend(panel);
      return;
    }

    const problemStatement = document.querySelector(".problem-statement");
    if (problemStatement && problemStatement.parentElement) {
      problemStatement.parentElement.insertBefore(panel, problemStatement);
      return;
    }

    const pageContent = document.querySelector("#pageContent") || document.body;
    pageContent.prepend(panel);
  }

  function setStatus(text, tone = "") {
    if (!panelState || !panelState.panel) {
      return;
    }

    const status = panelState.panel.querySelector('[data-role="status"]');
    if (status) {
      status.textContent = text;
      status.dataset.tone = tone;
    }
  }

  function setBusy(isBusy) {
    if (!panelState || !panelState.panel) {
      return;
    }

    const button = panelState.panel.querySelector('[data-action="refresh"]');
    if (button) {
      button.disabled = isBusy;
    }
  }

  function renderSummary(items) {
    if (!panelState) {
      return;
    }
    panelState.results = items;
  }

  function parseStatusPage(html, problem) {
    const documentFromHtml = new DOMParser().parseFromString(html, "text/html");
    const rows = Array.from(documentFromHtml.querySelectorAll("tr[data-submission-id], table.status-frame-datatable tr"));
    const byHandle = new Map();

    for (const row of rows) {
      const cells = Array.from(row.children).filter((child) => child.tagName === "TD");
      if (cells.length < 6) {
        continue;
      }

      const submissionId = row.getAttribute("data-submission-id") || extractFirstNumber(cells[0].textContent);
      if (!submissionId) {
        continue;
      }

      const verdict = collapseText(cells[5].textContent);
      if (!/^(Accepted|OK)$/i.test(verdict)) {
        continue;
      }

      const problemText = collapseText(cells[3].textContent);
      if (!looksLikeCurrentProblem(problemText, problem)) {
        continue;
      }

      const handleLink = cells[2].querySelector('a[href*="/profile/"]');
      const handle = handleLink ? collapseText(handleLink.textContent) : collapseText(cells[2].textContent);
      if (!handle || byHandle.has(handle.toLowerCase())) {
        continue;
      }

      byHandle.set(handle.toLowerCase(), {
        source: "friends-status",
        handle
      });
    }

    return Array.from(byHandle.values());
  }

  function extractFirstNumber(value) {
    const match = String(value || "").match(/\d+/);
    return match ? match[0] : "";
  }

  function looksLikeCurrentProblem(problemText, problem) {
    const compact = problemText.replace(/\s+/g, "").toUpperCase();
    const fullId = `${problem.contestId}${problem.index}`.toUpperCase();
    const indexOnly = `${problem.index}-`.toUpperCase();

    return compact.startsWith(fullId) || compact.startsWith(indexOnly) || compact.includes(`${fullId}-`);
  }

  async function fetchFriendStatus(problem, signal) {
    const response = await fetch(buildFriendsStatusUrl(problem), {
      credentials: "include",
      signal
    });

    if (!response.ok) {
      throw new Error(`Status page returned ${response.status}.`);
    }

    const html = await response.text();
    return parseStatusPage(html, problem);
  }

  async function scanManualHandles(problem, settings, signal) {
    const results = [];
    const errors = [];

    for (let index = 0; index < settings.friendHandles.length; index += 1) {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      if (index > 0) {
        await sleep(API_DELAY_MS, signal);
      }

      const handle = settings.friendHandles[index];
      setStatus(`Checking ${index + 1}/${settings.friendHandles.length}: ${handle}`);

      try {
        const item = await scanOneHandle(problem, handle, settings.scanCount, signal);
        if (item) {
          results.push(item);
        }
      } catch (error) {
        errors.push(`${handle}: ${error.message || "request failed"}`);
      }
    }

    return { results, errors };
  }

  async function scanOneHandle(problem, handle, scanCount, signal) {
    const params = new URLSearchParams({
      contestId: String(problem.contestId),
      handle,
      from: "1",
      count: String(scanCount)
    });
    const url = `${window.location.origin}/api/contest.status?${params.toString()}`;
    const response = await fetch(url, { credentials: "include", signal });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const payload = await response.json();
    if (payload.status !== "OK") {
      throw new Error(payload.comment || "Codeforces API failed");
    }

    const accepted = payload.result.find((submission) => {
      return submission.verdict === "OK" && sameProblem(submission, problem);
    });

    if (!accepted) {
      return null;
    }

    return {
      source: "manual-api",
      handle
    };
  }

  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(resolve, ms);
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    });
  }

  function mergeResults(primary, secondary) {
    const merged = new Map();
    for (const item of [...primary, ...secondary]) {
      const key = item.handle.toLowerCase();
      if (!merged.has(key)) {
        merged.set(key, item);
      }
    }
    return Array.from(merged.values()).sort((a, b) => a.handle.localeCompare(b.handle));
  }

  async function refreshPanel(options = {}) {
    if (!panelState) {
      return;
    }

    if (activeRun) {
      activeRun.abort();
    }

    const controller = new AbortController();
    activeRun = controller;
    setBusy(true);
    renderSummary([]);
    setStatus("Checking...", "");

    try {
      const settings = await loadSettings();
      panelState.settings = settings;

      const notes = [];
      let friendStatusResults = [];
      let manualResults = [];
      let manualErrors = [];

      if (settings.useCodeforcesFriends) {
        if (isLoggedIntoCodeforces()) {
          friendStatusResults = await fetchFriendStatus(panelState.problem, controller.signal);
        } else {
          notes.push("Log in for friends filter.");
        }
      }

      const shouldRunManualFallback =
        settings.manualFallback &&
        settings.friendHandles.length > 0 &&
        (options.force || friendStatusResults.length === 0);

      if (shouldRunManualFallback) {
        const manual = await scanManualHandles(panelState.problem, settings, controller.signal);
        manualResults = manual.results;
        manualErrors = manual.errors;
      }

      const results = mergeResults(friendStatusResults, manualResults);
      if (manualErrors.length) {
        notes.push("Some saved handles failed.");
      }

      renderSummary(results);
      if (results.length) {
        setStatus(`${results.length} friend AC${results.length === 1 ? "" : "s"} found.`, "good");
      } else {
        setStatus(notes.length ? notes[0] : "No friend ACs found.", notes.length ? "warn" : "");
      }
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
      renderSummary([]);
      setStatus(error.message || "Could not check status.", "bad");
    } finally {
      if (activeRun === controller) {
        activeRun = null;
      }
      setBusy(false);
    }
  }

  async function init() {
    const problem = parseProblemFromUrl();
    if (!problem) {
      return;
    }

    const settings = await loadSettings();
    const panel = createPanel(problem);
    panelState = {
      panel,
      problem,
      settings,
      results: []
    };

    if (settings.autoCheck) {
      refreshPanel();
    } else {
      setStatus("Open friends status.");
      renderSummary([]);
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === REFRESH_MESSAGE) {
      refreshPanel({ force: true });
    }
  });

  init();
})();
