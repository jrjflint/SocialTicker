/// <reference types="@cloudflare/workers-types" />

interface Env {
  INSTAGRAM_CACHE: KVNamespace;
  INSTAGRAM_SESSION_ID?: string;
  CACHE_TTL_SECONDS?: string;
  IG_APP_ID?: string;
}

type InstagramProfile = {
  fullName: string | null;
  biography: string | null;
  profilePictureUrl: string | null;
  isPrivate: boolean;
  isVerified: boolean;
};

type CacheRecord = {
  total: number;
  username: string;
  fetchedAt: string;
  profile: InstagramProfile;
  source: string;
  ttlSeconds: number;
};

type Payload = {
  total: number;
  username: string;
  fetchedAt: string;
  cacheExpiresAt: string;
  stale: boolean;
  profile: InstagramProfile;
  source: string;
  error?: { message: string };
};

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36';
const DEFAULT_TTL_SECONDS = 90;
const CACHE_KEY_PREFIX = 'instagram:followers:';

function buildCorsHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = buildCorsHeaders(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

function sanitizeHandle(input: string | null): string | null {
  if (!input) return null;
  return input.trim().replace(/^@/, '').toLowerCase();
}

function getCacheKey(username: string): string {
  return `${CACHE_KEY_PREFIX}${username}`;
}

function parseTtl(env: Env): number {
  const raw = env.CACHE_TTL_SECONDS;
  if (!raw) return DEFAULT_TTL_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_SECONDS;
}

function computeCacheExpiresAt(record: CacheRecord): string {
  const ttlMs = record.ttlSeconds * 1000;
  return new Date(Date.parse(record.fetchedAt) + ttlMs).toISOString();
}

async function readCache(env: Env, username: string): Promise<CacheRecord | null> {
  const cached = await env.INSTAGRAM_CACHE.get(getCacheKey(username), { type: 'json' });
  if (!cached) return null;
  const record = cached as Partial<CacheRecord>;
  if (typeof record.total !== 'number' || typeof record.fetchedAt !== 'string') {
    return null;
  }
  return {
    total: record.total,
    username: record.username ?? username,
    fetchedAt: record.fetchedAt,
    profile: {
      fullName: record.profile?.fullName ?? null,
      biography: record.profile?.biography ?? null,
      profilePictureUrl: record.profile?.profilePictureUrl ?? null,
      isPrivate: Boolean(record.profile?.isPrivate),
      isVerified: Boolean(record.profile?.isVerified),
    },
    source: record.source ?? 'instagram-web-profile',
    ttlSeconds: record.ttlSeconds ?? DEFAULT_TTL_SECONDS,
  };
}

async function writeCache(env: Env, username: string, record: CacheRecord): Promise<void> {
  const body = JSON.stringify(record);
  const expirationTtl = Math.max(record.ttlSeconds * 2, record.ttlSeconds + 30);
  await env.INSTAGRAM_CACHE.put(getCacheKey(username), body, { expirationTtl });
}

async function fetchInstagramFollowers(username: string, env: Env): Promise<CacheRecord> {
  const ttlSeconds = parseTtl(env);
  const requestUrl = new URL('https://www.instagram.com/api/v1/users/web_profile_info/');
  requestUrl.searchParams.set('username', username);

  const headers = new Headers({
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
    'X-IG-App-ID': env.IG_APP_ID ?? '936619743392459',
    Referer: `https://www.instagram.com/${encodeURIComponent(username)}/`,
    'X-Requested-With': 'XMLHttpRequest',
  });

  if (env.INSTAGRAM_SESSION_ID) {
    headers.set('Cookie', `sessionid=${env.INSTAGRAM_SESSION_ID}`);
  }

  const response = await fetch(requestUrl.toString(), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Instagram responded with status ${response.status}`);
  }

  const data = await response.json();
  const user = data?.data?.user;
  const total = user?.edge_followed_by?.count;

  if (typeof total !== 'number') {
    throw new Error('Follower count missing from Instagram response');
  }

  const record: CacheRecord = {
    total,
    username,
    fetchedAt: new Date().toISOString(),
    profile: {
      fullName: user?.full_name ?? null,
      biography: user?.biography ?? null,
      profilePictureUrl: user?.profile_pic_url_hd ?? user?.profile_pic_url ?? null,
      isPrivate: Boolean(user?.is_private),
      isVerified: Boolean(user?.is_verified),
    },
    source: 'instagram-web-profile',
    ttlSeconds,
  };

  return record;
}

function fromCache(record: CacheRecord, overrides: Partial<Payload> = {}): Payload {
  const payload: Payload = {
    total: record.total,
    username: record.username,
    fetchedAt: record.fetchedAt,
    cacheExpiresAt: computeCacheExpiresAt(record),
    stale: false,
    profile: record.profile,
    source: record.source,
  };

  if (overrides.error) {
    payload.error = overrides.error;
  }

  payload.stale = overrides.stale ?? payload.stale;

  return payload;
}

async function handleInstagramRequest(username: string, env: Env): Promise<Response> {
  const sanitized = sanitizeHandle(username);
  if (!sanitized) {
    return jsonResponse({ error: { message: 'Instagram handle is required' } }, { status: 400 });
  }

  const cached = await readCache(env, sanitized);

  if (cached) {
    const cachedAt = Date.parse(cached.fetchedAt);
    if (!Number.isNaN(cachedAt)) {
      const ageMs = Date.now() - cachedAt;
      if (ageMs <= cached.ttlSeconds * 1000) {
        return jsonResponse(fromCache(cached));
      }
    }
  }

  try {
    const record = await fetchInstagramFollowers(sanitized, env);
    await writeCache(env, sanitized, record);
    return jsonResponse(fromCache(record));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while contacting Instagram';

    if (cached) {
      const payload = fromCache(cached, {
        stale: true,
        error: { message },
      });
      return jsonResponse(payload, { status: 200 });
    }

    return jsonResponse({
      error: { message },
    }, { status: 502 });
  }
}

const worker: ExportedHandler<Env> = {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders() });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: { message: 'Method not allowed' } }, { status: 405 });
    }

    if (url.pathname === '/api/healthz') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    const instagramMatch = url.pathname.match(/^\/api\/followers\/instagram\/(.+)$/i);
    if (instagramMatch) {
      const handle = decodeURIComponent(instagramMatch[1]);
      return handleInstagramRequest(handle, env);
    }

    return jsonResponse({ error: { message: 'Not found' } }, { status: 404 });
  },
};

export default worker;
