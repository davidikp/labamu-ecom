/**
 * @module api/client
 * @description Centralized REST API client for the Merchant Backoffice.
 *
 * Features:
 * - Path-based versioning via VITE_API_URL (e.g. /api/v1)
 * - Client identification headers on every request
 * - Environment-driven mock interceptor (VITE_USE_MOCK_API)
 * - Semantic error objects for MCP-ready responses
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * Default headers injected into every outgoing request.
 * These allow any backend or proxy to identify the originating client.
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-Id': 'merchant-backoffice',
  'X-Client-Platform': 'web-v1',
};

/**
 * Registry of mock handlers keyed by "METHOD /path".
 * Services register their own mocks at import time via `registerMock`.
 *
 * @type {Map<string, Function>}
 */
const mockRegistry = new Map();

/**
 * Register a mock handler for a given method + path pattern.
 *
 * @param {string} method  - HTTP method (GET, POST, …)
 * @param {string} path    - Path pattern, e.g. "/companies/:uid"
 * @param {Function} handler - (params) => Promise<data>
 */
export function registerMock(method, path, handler) {
  mockRegistry.set(`${method.toUpperCase()} ${path}`, handler);
}

/**
 * Attempt to match a concrete URL against registered mock patterns.
 * Supports simple `:param` placeholders.
 *
 * @returns {{ handler: Function, params: Object } | null}
 */
function matchMock(method, url) {
  const pathname = url.replace(BASE_URL, '');
  for (const [key, handler] of mockRegistry) {
    const [m, pattern] = key.split(' ');
    if (m !== method.toUpperCase()) continue;

    const patternParts = pattern.split('/');
    const urlParts = pathname.split('/');
    if (patternParts.length !== urlParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { handler, params };
  }
  return null;
}

/**
 * Standardized API error with semantic fields for MCP consumption.
 */
export class ApiError extends Error {
  /**
   * @param {string} message  - Human-readable error description
   * @param {number} status   - HTTP status code
   * @param {string} endpoint - The requested endpoint path
   * @param {*} [body]        - Raw response body, if available
   */
  constructor(message, status, endpoint, body = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.body = body;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Core request function.
 *
 * @param {string} endpoint - Path relative to BASE_URL, e.g. "/companies/bpo3ok"
 * @param {Object}  [options]
 * @param {string}  [options.method='GET']
 * @param {Object}  [options.headers]  - Extra headers to merge
 * @param {*}       [options.body]     - Request body (will be JSON-stringified)
 * @returns {Promise<*>} Parsed JSON response
 * @throws {ApiError} On non-2xx responses
 */
export async function apiRequest(endpoint, { method = 'GET', headers = {}, body } = {}) {
  const url = `${BASE_URL}${endpoint}`;

  // ── Mock Interceptor ───────────────────────────────────────────────
  if (USE_MOCK) {
    const mockMatch = matchMock(method, url);
    if (mockMatch) {
      console.info(
        `%c[MOCK] ${method} ${endpoint}`,
        'color: #6366f1; font-weight: bold',
        mockMatch.params
      );
      // Simulate realistic network latency
      await new Promise((r) => setTimeout(r, 500));
      return mockMatch.handler(mockMatch.params, body);
    }
    console.warn(`[MOCK] No mock registered for ${method} ${endpoint}`);
  }

  // ── Real Request ───────────────────────────────────────────────────
  const config = {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  console.info(
    `%c[API] ${method} ${endpoint}`,
    'color: #059669; font-weight: bold'
  );

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      endpoint,
      errorBody
    );
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

/**
 * Convenience helpers — all delegate to `apiRequest`.
 */
export const api = {
  get: (endpoint, opts) => apiRequest(endpoint, { ...opts, method: 'GET' }),
  post: (endpoint, body, opts) => apiRequest(endpoint, { ...opts, method: 'POST', body }),
  put: (endpoint, body, opts) => apiRequest(endpoint, { ...opts, method: 'PUT', body }),
  patch: (endpoint, body, opts) => apiRequest(endpoint, { ...opts, method: 'PATCH', body }),
  delete: (endpoint, opts) => apiRequest(endpoint, { ...opts, method: 'DELETE' }),
};
