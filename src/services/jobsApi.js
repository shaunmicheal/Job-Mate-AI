/**
 * Job data service (Phase 2C)
 *
 * ONE service that hides provider differences from the UI. Every function returns
 * normalized JobMate job objects, so screens never need to know which provider
 * supplied a job. The provider name is still kept on every job for attribution.
 *
 * Providers (all public, no API keys, no .env, no dependencies):
 *
 * 1. Zim JobHunters - GET https://api.jobhunters.co.zw/api/jobs/      (Zimbabwe jobs)
 * 2. Remotive       - GET https://remotive.com/api/remote-jobs        (remote jobs worldwide)
 * 3. Arbeitnow      - GET https://www.arbeitnow.com/api/job-board-api (international, Europe-focused)
 *
 * Geographic coverage differs per provider: Zim JobHunters is Zimbabwe-only,
 * Remotive is remote-only (worldwide), Arbeitnow is mainly European.
 * Do not assume the providers offer the same coverage.
 *
 * Attribution rules (do NOT remove or hide provider identity):
 * - Remotive requires attribution: link back to remotive.com and mention Remotive
 *   as the source. Their feed is delayed by 24 hours and the public API advises
 *   a maximum of roughly 4 GET requests per day. Keep `job.provider === 'remotive'`
 *   and `job.sourceUrl` (the Remotive listing) intact wherever jobs are displayed.
 * - Arbeitnow asks users to link back to arbeitnow.com (see `meta.terms`).
 *
 * Uses the native fetch() that ships with React Native and Node 18+.
 * Every failure throws a readable Error, so callers never get undefined.
 */

const ZIM_JOBHUNTERS_API_BASE_URL = 'https://api.jobhunters.co.zw/api';
const REMOTIVE_API_BASE_URL = 'https://remotive.com/api';
const ARBEITNOW_API_BASE_URL = 'https://www.arbeitnow.com';

// Headers for every request. No Authorization headers - none of these providers
// need credentials for their public job feeds.
const REQUEST_HEADERS = {
  Accept: 'application/json',
};

// Query parameters documented by the Zim JobHunters API. A whitelist keeps us
// from ever sending undocumented parameters.
const ZIM_JOBHUNTERS_QUERY_PARAMS = [
  'page',
  'page_size',
  'search',
  'sector',
  'sector_id',
  'location',
  'location_id',
  'country',
  'province',
  'city',
  'is_remote',
  'employment_type',
  'experience_level',
  'salary_min',
  'salary_max',
];

/* ------------------------------------------------------------------ */
/* Small internal helpers                                              */
/* ------------------------------------------------------------------ */

/**
 * Returns the value as a trimmed string, or null when it is missing/empty.
 */
function toStringOrNull(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

/**
 * Returns the value as a finite number, or null when it is missing/not numeric.
 * Handles empty strings (Zim JobHunters sends "" for missing salaries).
 */
function toNumberOrNull(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Returns an ISO 8601 date string or null.
 * - Numbers are Unix timestamps (Arbeitnow `created_at`, seconds) -> converted.
 * - Strings are already ISO dates on Zim JobHunters/Remotive -> kept as provided.
 */
function toIsoDateOrNull(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Unix seconds are ~1e9, Unix milliseconds are ~1e12; accept both.
    const milliseconds = value < 1e12 ? value * 1000 : value;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return toStringOrNull(value);
}

/**
 * Reads a `name` from provider objects like { id, name, slug },
 * or passes plain strings through. Returns null when nothing usable is found.
 */
function pickProviderName(value) {
  if (value !== null && typeof value === 'object') {
    return toStringOrNull(value.name);
  }
  return toStringOrNull(value);
}

/**
 * Converts a provider array of strings into a clean string array.
 * Returns [] when the field is missing (never undefined).
 */
function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const strings = [];
  for (const item of value) {
    const text = toStringOrNull(item);
    if (text !== null) {
      strings.push(text);
    }
  }
  return strings;
}

/**
 * Copies only the documented query parameters from `options`.
 * Skips undefined/null/empty values but keeps meaningful falsy values
 * (e.g. is_remote=false, page=0).
 */
function pickParams(options, allowedParams) {
  const params = {};

  if (!options || typeof options !== 'object') {
    return params;
  }

  for (const key of allowedParams) {
    const value = options[key];
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  }

  return params;
}

/**
 * Builds a query string from an object. Works everywhere (no URLSearchParams needed).
 * Returns '' when there are no parameters.
 */
function buildQuery(params) {
  const parts = [];

  for (const [key, value] of Object.entries(params)) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }

  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Removes markup from one pass of text: <script>/<style> blocks are dropped with
 * their contents, <br> and block-closing tags become line breaks, and any other
 * tag is replaced by a space.
 */
function removeMarkup(text) {
  return text
    .replace(/<script[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ');
}

/**
 * Decodes the small set of HTML entities used by the providers.
 * Numeric entities are guarded so invalid code points cannot throw.
 */
function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const code = parseInt(hex, 16);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    })
    .replace(/&#(\d+);/g, (match, digits) => {
      const code = Number(digits);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    })
    .replace(/&amp;/gi, '&');
}

/**
 * Safely strips basic HTML tags from a description. No HTML parsing dependency.
 * - Plain text input (no tags, no entities) is preserved untouched.
 * - Common HTML entities are decoded; `&amp;` is decoded last so double-escaped
 *   sequences (e.g. &amp;lt;) are decoded only once.
 * - Some records entity-escape their whole HTML block (e.g. Arbeitnow sends
 *   "&lt;p&gt;..." instead of "<p>"); markup is therefore removed both before
 *   and after decoding so no literal tags survive into the text.
 * Returns null when there is nothing to show.
 */
function stripHtml(input) {
  const html = toStringOrNull(input);
  if (html === null) {
    return null;
  }

  // No tag-like markup and no entities -> already plain text; preserve it.
  if (!/<\s*[a-zA-Z/!]/.test(html) && !/&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#[xX][0-9a-fA-F]{1,6});/.test(html)) {
    return html;
  }

  const text = removeMarkup(decodeEntities(removeMarkup(html)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text === '' ? null : text;
}


/**
 * Builds the normalized `description` object.
 * The original markup is kept in `html`; `text` is the stripped version.
 * `isTruncated` stays false because these three providers return full descriptions.
 */
function normalizeDescription(raw) {
  const html = toStringOrNull(raw);

  return {
    html,
    text: html === null ? null : stripHtml(html),
    isTruncated: false,
  };
}

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

/**
 * Tries to read an error message from a failed response body.
 * Falls back to a generic message when the body is missing or not usable JSON.
 */
async function readProviderErrorMessage(response) {
  try {
    const body = await response.json();

    if (body && typeof body === 'object') {
      for (const key of ['detail', 'message', 'error']) {
        const value = body[key];
        if (typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
    }

    return 'No error message provided by the provider.';
  } catch (error) {
    return 'Could not read the error response from the provider.';
  }
}

/**
 * Internal helper: performs one GET request against a public job provider.
 * - Sends only the Accept: application/json header (no credentials).
 * - Throws a readable Error on network failures.
 * - Checks response.ok and throws a readable Error for any non-2xx status.
 * - Throws instead of returning undefined when the body is not a JSON object.
 */
async function requestJson(url, providerLabel) {
  let response;

  try {
    // fetch() only rejects for network problems (offline, DNS, bad URL, etc.).
    response = await fetch(url, { headers: REQUEST_HEADERS });
  } catch (error) {
    throw new Error(`Network error while contacting ${providerLabel} (${url}): ${error.message}`);
  }

  // response.ok is true for status codes 200-299.
  if (!response.ok) {
    const message = await readProviderErrorMessage(response);
    const statusText = response.statusText ? ` ${response.statusText}` : '';
    throw new Error(
      `${providerLabel} request failed (${response.status}${statusText}) for ${url}: ${message}`
    );
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`${providerLabel} returned invalid JSON for ${url}: ${error.message}`);
  }

  if (body === null || typeof body !== 'object') {
    throw new Error(`${providerLabel} returned an unexpected response body for ${url}.`);
  }

  return body;
}

/* ------------------------------------------------------------------ */
/* Normalizers: provider payload -> JobMate job object                 */
/* ------------------------------------------------------------------ */

/**
 * Zim JobHunters -> JobMate job.
 * Maps `location.is_remote` -> location.isRemote and `apply_url` -> applicationUrl
 * (empty apply_url means the application happens inside their app -> null).
 */
function normalizeJobHuntersJob(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const id = raw.id === undefined || raw.id === null ? '' : String(raw.id).trim();
  const title = toStringOrNull(raw.title);

  // Unusable record - skip it instead of returning undefined.
  if (id === '' || title === null) {
    return null;
  }

  const location = raw.location && typeof raw.location === 'object' ? raw.location : null;
  const employer = raw.employer && typeof raw.employer === 'object' ? raw.employer : null;
  const display = location
    ? toStringOrNull(location.display_name) || toStringOrNull(location.name)
    : null;

  const categories = [];
  for (const name of [pickProviderName(raw.sector), pickProviderName(raw.category)]) {
    if (name !== null && !categories.includes(name)) {
      categories.push(name);
    }
  }

  return {
    id: `jobhunters:${id}`,
    provider: 'jobhunters',
    title,
    company: employer ? toStringOrNull(employer.company_name) : null,
    location: {
      display,
      city: location ? toStringOrNull(location.city) : null,
      region: location ? toStringOrNull(location.province) : null,
      country: location ? toStringOrNull(location.country) : null,
      isRemote: Boolean(location && location.is_remote === true),
    },
    description: normalizeDescription(raw.description),
    // "" when apply_option is "in_app" -> null. Never invent an external URL.
    applicationUrl: toStringOrNull(raw.apply_url),
    // The API does not publish a public listing URL for individual jobs.
    sourceUrl: null,
    // date_posted first; created_at as a provider-supplied fallback.
    postedAt: toIsoDateOrNull(raw.date_posted || raw.created_at || null),
    salary: {
      min: toNumberOrNull(raw.salary_min),
      max: toNumberOrNull(raw.salary_max),
      currency: toStringOrNull(raw.currency),
    },
    jobType: toStringOrNull(raw.employment_type),
    categories,
    tags: [],
  };
}

/**
 * Remotive -> JobMate job.
 * Every Remotive job is remote. `url` is the Remotive LISTING page, so it becomes
 * sourceUrl - applicationUrl stays null unless the payload provides a real
 * application link.
 */
function normalizeRemotiveJob(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const id = raw.id === undefined || raw.id === null ? '' : String(raw.id).trim();
  const title = toStringOrNull(raw.title);

  if (id === '' || title === null) {
    return null;
  }

  const category = pickProviderName(raw.category);

  return {
    id: `remotive:${id}`,
    provider: 'remotive',
    title,
    company: toStringOrNull(raw.company_name),
    location: {
      display: toStringOrNull(raw.candidate_required_location),
      city: null,
      region: null,
      country: null,
      isRemote: true, // All Remotive jobs are remote by definition.
    },
    description: normalizeDescription(raw.description),
    // Remotive does not document a separate application URL field. Only use one
    // if the response ever actually provides it.
    applicationUrl: toStringOrNull(raw.apply_url ?? raw.application_url),
    sourceUrl: toStringOrNull(raw.url),
    postedAt: toIsoDateOrNull(raw.publication_date),
    // Remotive salary is a display string, not numbers - keep the numbers null.
    salary: { min: null, max: null, currency: null },
    jobType: toStringOrNull(raw.job_type),
    categories: category === null ? [] : [category],
    tags: toStringArray(raw.tags),
  };
}

/**
 * Arbeitnow -> JobMate job.
 * `remote` maps to location.isRemote, `url` is the job/application URL supplied
 * by Arbeitnow, and `created_at` (Unix seconds) becomes an ISO date string.
 */
function normalizeArbeitnowJob(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const slug = toStringOrNull(raw.slug);
  const title = toStringOrNull(raw.title);

  if (slug === null || title === null) {
    return null;
  }

  const jobTypes = toStringArray(raw.job_types);

  return {
    id: `arbeitnow:${slug}`,
    provider: 'arbeitnow',
    title,
    company: toStringOrNull(raw.company_name),
    location: {
      display: toStringOrNull(raw.location),
      city: null,
      region: null,
      country: null,
      isRemote: raw.remote === true,
    },
    description: normalizeDescription(raw.description),
    applicationUrl: toStringOrNull(raw.url),
    // No separate listing URL is published (the slug is kept inside `id`).
    sourceUrl: null,
    postedAt: toIsoDateOrNull(raw.created_at),
    // This API sends no salary fields - keep nulls, invent nothing.
    salary: { min: null, max: null, currency: null },
    // First job type (e.g. "Full-time"); null when the provider sends none.
    jobType: jobTypes.length > 0 ? jobTypes[0] : null,
    // Arbeitnow has no category field; its `tags` are stored in `tags`.
    categories: [],
    tags: toStringArray(raw.tags),
  };
}

/**
 * Runs a normalizer over a provider array and drops unusable records.
 */
function normalizeList(rawJobs, normalizeJob) {
  const jobs = [];

  for (const raw of rawJobs) {
    const job = normalizeJob(raw);
    if (job !== null) {
      jobs.push(job);
    }
  }

  return jobs;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * searchZimbabweJobs
 * Searches Zim JobHunters (Zimbabwe jobs only).
 * Endpoint: GET /api/jobs/
 *
 * @param {object} [options] - Any documented query parameters, e.g.
 *   page, page_size, search, sector, sector_id, location, location_id, country,
 *   province, city, is_remote, employment_type, experience_level,
 *   salary_min, salary_max.
 * @returns {Promise<{jobs: Array<object>, total: number|null, nextPage: string|null, previousPage: string|null}>}
 */
export async function searchZimbabweJobs(options = {}) {
  const params = pickParams(options, ZIM_JOBHUNTERS_QUERY_PARAMS);
  const url = `${ZIM_JOBHUNTERS_API_BASE_URL}/jobs/${buildQuery(params)}`;

  const body = await requestJson(url, 'Zim JobHunters');
  const results = Array.isArray(body.results) ? body.results : [];

  return {
    jobs: normalizeList(results, normalizeJobHuntersJob),
    total: typeof body.count === 'number' ? body.count : null,
    nextPage: toStringOrNull(body.next),
    previousPage: toStringOrNull(body.previous),
  };
}

/**
 * getRemoteJobs
 * Fetches remote jobs from Remotive (attribution to Remotive is required).
 * Endpoint: GET /remote-jobs
 *
 * @param {object} [options]
 * @param {string} [options.search] - Search term (documented by Remotive).
 * @param {string} [options.category] - One of Remotive's job categories (documented).
 * @param {string} [options.companyName] - Company filter (sent as `company_name`, documented).
 * @param {number} [options.limit] - Maximum number of jobs to return (documented).
 * @returns {Promise<{jobs: Array<object>, total: number|null}>}
 */
export async function getRemoteJobs(options = {}) {
  const params = pickParams(options, ['search', 'category', 'limit']);

  if (options && typeof options === 'object') {
    const companyName = toStringOrNull(options.companyName);
    if (companyName !== null) {
      params.company_name = companyName;
    }
  }

  const url = `${REMOTIVE_API_BASE_URL}/remote-jobs${buildQuery(params)}`;

  const body = await requestJson(url, 'Remotive');
  const rawJobs = Array.isArray(body.jobs) ? body.jobs : [];

  let total = null;
  if (typeof body['total-job-count'] === 'number') {
    total = body['total-job-count'];
  } else if (typeof body['job-count'] === 'number') {
    total = body['job-count'];
  }

  return {
    jobs: normalizeList(rawJobs, normalizeRemotiveJob),
    total,
  };
}

/**
 * getInternationalJobs
 * Fetches international jobs from Arbeitnow (mainly European coverage).
 * Endpoint: GET /api/job-board-api
 *
 * @param {object} [options]
 * @param {number} [options.page] - Page number to fetch (1-based).
 * @returns {Promise<{jobs: Array<object>, total: number|null, nextPage: string|null, previousPage: string|null}>}
 *   `total` is null because Arbeitnow does not publish a total job count.
 */
export async function getInternationalJobs(options = {}) {
  const params = pickParams(options, ['page']);
  const url = `${ARBEITNOW_API_BASE_URL}/api/job-board-api${buildQuery(params)}`;

  const body = await requestJson(url, 'Arbeitnow');
  const data = Array.isArray(body.data) ? body.data : [];
  const links = body.links && typeof body.links === 'object' ? body.links : {};

  return {
    jobs: normalizeList(data, normalizeArbeitnowJob),
    // Arbeitnow's meta has no total count field - do not invent one.
    total: null,
    nextPage: toStringOrNull(links.next),
    previousPage: toStringOrNull(links.prev),
  };
}

/**
 * Summarizes one settled provider result for getJobs({ provider: 'all' }).
 * Never hides a failure: a failed provider keeps its readable error message.
 */
function describeSettledResult(settled) {
  if (settled.status === 'fulfilled') {
    return {
      ok: true,
      count: settled.value.jobs.length,
      total: settled.value.total ?? null,
      error: null,
    };
  }

  const reason = settled.reason;
  return {
    ok: false,
    count: 0,
    total: null,
    error: reason instanceof Error ? reason.message : String(reason),
  };
}

/**
 * getJobs
 * Simple combined entry point for the UI.
 *
 * @param {object} [options]
 * @param {'zimbabwe'|'remote'|'international'|'all'} [options.provider='all']
 *   - 'zimbabwe'      -> searchZimbabweJobs() (Zim JobHunters)
 *   - 'remote'        -> getRemoteJobs() (Remotive)
 *   - 'international' -> getInternationalJobs() (Arbeitnow)
 *   - 'all'           -> fetch all three providers in parallel and combine them.
 *   Other options (e.g. `search`, `page`) are forwarded to the provider functions,
 *   which each accept only their own documented parameters.
 * @returns {Promise<object>} The chosen provider's result. For 'all':
 *   {
 *     jobs: [],            // combined normalized jobs (group by job.provider)
 *     total: number|null,  // sum of the totals that successful providers reported
 *     providers: {
 *       zimbabwe:      { ok, count, total, error },
 *       remote:        { ok, count, total, error },
 *       international: { ok, count, total, error },
 *     },
 *   }
 *   A failing provider is reported with ok: false and a readable `error` -
 *   its missing jobs are never presented as if they were returned.
 */
export async function getJobs(options = {}) {
  const opts = options && typeof options === 'object' ? options : {};
  const provider = opts.provider ?? 'all';
  const providerOptions = { ...opts };
  delete providerOptions.provider;

  if (provider === 'zimbabwe') {
    return searchZimbabweJobs(providerOptions);
  }
  if (provider === 'remote') {
    return getRemoteJobs(providerOptions);
  }
  if (provider === 'international') {
    return getInternationalJobs(providerOptions);
  }
  if (provider !== 'all') {
    throw new Error(
      `Invalid provider "${provider}". Expected 'zimbabwe', 'remote', 'international' or 'all'.`
    );
  }

  const [zimbabweSettled, remoteSettled, internationalSettled] = await Promise.allSettled([
    searchZimbabweJobs(providerOptions),
    getRemoteJobs(providerOptions),
    getInternationalJobs(providerOptions),
  ]);

  const providers = {
    zimbabwe: describeSettledResult(zimbabweSettled),
    remote: describeSettledResult(remoteSettled),
    international: describeSettledResult(internationalSettled),
  };

  const jobs = [];
  for (const settled of [zimbabweSettled, remoteSettled, internationalSettled]) {
    if (settled.status === 'fulfilled') {
      for (const job of settled.value.jobs) {
        jobs.push(job);
      }
    }
  }

  let total = null;
  for (const status of Object.values(providers)) {
    if (status.ok && typeof status.total === 'number') {
      total = (total ?? 0) + status.total;
    }
  }

  return { jobs, total, providers };
}





