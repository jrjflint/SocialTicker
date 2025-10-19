const root = document.body;
const handleRaw = (root.dataset.instagramHandle || 'jamesfollent').trim();
const handle = handleRaw.startsWith('@') ? handleRaw.slice(1) : handleRaw;
const apiBaseUrl = (root.dataset.apiBaseUrl || '').replace(/\/$/, '');
const pollInterval = Number.parseInt(root.dataset.pollIntervalMs || '8000', 10);
const minPollInterval = Number.isFinite(pollInterval) && pollInterval > 1000 ? pollInterval : 8000;

const digitsEl = document.querySelector('[data-role="digits"]');
const deltaEl = document.querySelector('[data-role="delta"]');
const lastRefreshedEl = document.querySelector('[data-role="last-refreshed"]');
const nextRefreshEl = document.querySelector('[data-role="next-refresh"]');
const alertEl = document.querySelector('[data-role="alert"]');
const alertTitleEl = document.querySelector('[data-role="alert-title"]');
const alertMessageEl = document.querySelector('[data-role="alert-message"]');
const statusPillEl = document.querySelector('[data-role="status-pill"]');
const statusTextEl = document.querySelector('[data-role="status-text"]');

const numberFormatter = new Intl.NumberFormat('en-US');
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

let previousTotal = null;
let nextPollAt = Date.now() + minPollInterval;
let countdownTimer = null;
let pollingTimer = null;

function setStatus(state) {
  if (!statusPillEl) return;
  statusPillEl.classList.remove('status-live', 'stale', 'offline');
  switch (state) {
    case 'offline':
      statusPillEl.classList.add('offline');
      if (statusTextEl) statusTextEl.textContent = 'Offline';
      break;
    case 'stale':
      statusPillEl.classList.add('stale');
      if (statusTextEl) statusTextEl.textContent = 'Stale cache';
      break;
    default:
      statusPillEl.classList.add('status-live');
      if (statusTextEl) statusTextEl.textContent = 'Live';
  }
}

function showAlert({ title, message, tone }) {
  if (!alertEl || !alertTitleEl || !alertMessageEl) return;
  alertEl.hidden = false;
  alertEl.classList.remove('is-stale', 'is-error');
  if (tone === 'stale') {
    alertEl.classList.add('is-stale');
  } else if (tone === 'error') {
    alertEl.classList.add('is-error');
  }
  alertTitleEl.textContent = title;
  alertMessageEl.textContent = message;
}

function hideAlert() {
  if (!alertEl) return;
  alertEl.hidden = true;
  alertEl.classList.remove('is-stale', 'is-error');
  if (alertTitleEl) alertTitleEl.textContent = '';
  if (alertMessageEl) alertMessageEl.textContent = '';
}

function updateCountdownDisplay() {
  const now = Date.now();
  const remainingMs = Math.max(0, nextPollAt - now);
  const seconds = Math.floor(remainingMs / 1000);
  const display = new Date(remainingMs).toISOString().substr(14, 5);
  if (nextRefreshEl) {
    nextRefreshEl.textContent = seconds === 0 ? 'Refreshing…' : display;
  }
}

function startCountdownTimer() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(updateCountdownDisplay, 500);
  updateCountdownDisplay();
}

function formatRelativeTime(timestamp) {
  const then = typeof timestamp === 'number' ? timestamp : Date.parse(timestamp);
  if (Number.isNaN(then)) return 'Unknown';
  const diffMs = then - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const units = [
    { unit: 'day', value: 86400 },
    { unit: 'hour', value: 3600 },
    { unit: 'minute', value: 60 },
    { unit: 'second', value: 1 },
  ];
  for (const { unit, value } of units) {
    if (absSeconds >= value || unit === 'second') {
      const delta = Math.round(diffSeconds / value);
      return relativeFormatter.format(delta, unit);
    }
  }
  return 'moments ago';
}

function updateDelta(newTotal) {
  if (!deltaEl) return;
  if (previousTotal === null) {
    deltaEl.hidden = true;
    return;
  }
  const delta = newTotal - previousTotal;
  if (delta === 0) {
    deltaEl.hidden = true;
    deltaEl.textContent = 'No change';
    deltaEl.classList.remove('positive', 'negative');
    return;
  }
  const direction = delta > 0 ? 'positive' : 'negative';
  deltaEl.hidden = false;
  deltaEl.textContent = `${delta > 0 ? '+' : ''}${numberFormatter.format(delta)} since last update`;
  deltaEl.classList.remove('positive', 'negative');
  deltaEl.classList.add(direction);
}

async function fetchFollowers() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(10000, minPollInterval));
  const endpoint = `${apiBaseUrl}/api/followers/instagram/${encodeURIComponent(handle)}`;
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const payload = await response.json();
    if (typeof payload.total !== 'number') {
      throw new Error('Invalid payload from API');
    }

    const fetchedAt = payload.fetchedAt || new Date().toISOString();
    const stale = Boolean(payload.stale);
    const cacheExpiresAt = payload.cacheExpiresAt ? Date.parse(payload.cacheExpiresAt) : null;

    if (digitsEl) {
      digitsEl.textContent = numberFormatter.format(payload.total);
    }

    updateDelta(payload.total);
    previousTotal = payload.total;

    if (lastRefreshedEl) {
      lastRefreshedEl.textContent = formatRelativeTime(fetchedAt);
    }

    nextPollAt = Date.now() + minPollInterval;
    startCountdownTimer();

    if (payload.error && payload.error.message) {
      showAlert({
        title: 'Served with warnings',
        message: payload.error.message,
        tone: stale ? 'stale' : 'error',
      });
    } else if (stale) {
      const refreshHint = cacheExpiresAt
        ? `Next refresh expected ${formatRelativeTime(cacheExpiresAt)}.`
        : 'Refreshing shortly.';
      showAlert({
        title: 'Cached data is stale',
        message: `Holding last known follower total while refreshing in the background. ${refreshHint}`,
        tone: 'stale',
      });
    } else {
      hideAlert();
    }

    setStatus(stale ? 'stale' : 'live');
  } catch (error) {
    console.error('Failed to refresh followers', error);
    setStatus('offline');
    showAlert({
      title: 'Connection lost',
      message: 'Unable to refresh follower total. Retrying shortly…',
      tone: 'error',
    });
    nextPollAt = Date.now() + minPollInterval;
    startCountdownTimer();
  } finally {
    clearTimeout(timeout);
    if (pollingTimer) clearTimeout(pollingTimer);
    pollingTimer = setTimeout(pollLoop, minPollInterval);
  }
}

function pollLoop() {
  nextPollAt = Date.now() + minPollInterval;
  startCountdownTimer();
  fetchFollowers();
}

function init() {
  startCountdownTimer();
  fetchFollowers();
}

init();
