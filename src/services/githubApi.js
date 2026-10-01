/**
 * GitHub API service (Phase 1)
 *
 * A small, beginner-friendly wrapper around GitHub's official REST API.
 * Docs: https://docs.github.com/en/rest
 *
 * What this file does:
 * - Uses the native fetch() that ships with React Native and Node 18+.
 * - Sends no authentication (Phase 1 only reads public data).
 * - Returns parsed JSON from every function.
 * - Throws a readable Error when a request fails, so callers never get undefined.
 */

const GITHUB_API_BASE_URL = 'https://api.github.com';

// Headers GitHub recommends for every REST request.
const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2026-03-10',
};

/**
 * Validates a required string argument and returns it trimmed.
 * Throws a readable Error when the value is missing or empty.
 */
function requireArgument(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required argument: "${name}" must be a non-empty string.`);
  }

  return value.trim();
}

/**
 * Tries to read GitHub's JSON error body (it usually looks like { "message": "..." }).
 * Falls back to a generic message when the body is missing or not usable JSON.
 */
async function readGitHubErrorMessage(response) {
  try {
    const body = await response.json();
    if (body && typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }

    return 'No error message provided by GitHub.';
  } catch (error) {
    return 'Could not read the error response from GitHub.';
  }
}

/**
 * Internal helper: performs one GET request against the GitHub REST API.
 * - Builds the full URL from the base URL and the given path.
 * - Throws on network failures.
 * - Checks response.ok and throws a readable Error for any non-2xx status.
 * - Returns the parsed JSON body on success.
 */
async function requestGitHub(path) {
  const url = `${GITHUB_API_BASE_URL}${path}`;

  let response;
  try {
    // fetch() only rejects for network problems (offline, DNS, bad URL, etc.).
    response = await fetch(url, { headers: GITHUB_HEADERS });
  } catch (error) {
    throw new Error(`Network error while contacting GitHub (${url}): ${error.message}`);
  }

  // response.ok is true for status codes 200-299.
  if (!response.ok) {
    const message = await readGitHubErrorMessage(response);
    throw new Error(
      `GitHub request failed (${response.status} ${response.statusText}) for ${url}: ${message}`
    );
  }

  return response.json();
}

/**
 * getGithubUser
 * Fetches a public GitHub user's profile.
 * Endpoint: GET /users/{username}
 *
 * @param {string} username - The GitHub handle, e.g. "octocat".
 * @returns {Promise<object>} The user profile JSON (login, name, avatar_url, bio, ...).
 */
export async function getGithubUser(username) {
  const user = requireArgument(username, 'username');
  return requestGitHub(`/users/${encodeURIComponent(user)}`);
}

/**
 * getGithubRepositories
 * Fetches a user's public repositories.
 * Endpoint: GET /users/{username}/repos
 *
 * @param {string} username - The GitHub handle, e.g. "octocat".
 * @param {object} [options] - Optional pagination settings.
 * @param {number} [options.page] - Page number to fetch (1-based).
 * @param {number} [options.per_page] - Number of repositories per page (max 100).
 * @returns {Promise<Array<object>>} An array of repository JSON objects.
 */
export async function getGithubRepositories(username, options = {}) {
  const user = requireArgument(username, 'username');

  // Read the supported pagination options (page and per_page).
  const { page, per_page: perPage } = options;

  // Build the query string manually so it works everywhere (no URLSearchParams needed).
  const queryParts = [];
  if (page !== undefined && page !== null) {
    queryParts.push(`page=${encodeURIComponent(page)}`);
  }
  if (perPage !== undefined && perPage !== null) {
    queryParts.push(`per_page=${encodeURIComponent(perPage)}`);
  }
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  return requestGitHub(`/users/${encodeURIComponent(user)}/repos${query}`);
}

/**
 * getGithubRepository
 * Fetches information about one public repository.
 * Endpoint: GET /repos/{owner}/{repo}
 *
 * @param {string} owner - The repository owner (user or organization), e.g. "octocat".
 * @param {string} repo - The repository name, e.g. "Hello-World".
 * @returns {Promise<object>} The repository JSON (name, full_name, description, ...).
 */
export async function getGithubRepository(owner, repo) {
  const ownerName = requireArgument(owner, 'owner');
  const repoName = requireArgument(repo, 'repo');

  return requestGitHub(
    `/repos/${encodeURIComponent(ownerName)}/${encodeURIComponent(repoName)}`
  );
}
