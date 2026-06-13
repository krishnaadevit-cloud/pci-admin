import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { clearAuthToken } from '@/lib/auth/cookieStorage';

export function createAxios(baseURL: string): AxiosInstance {
    // When running in the browser, resolve a relative baseURL against the current
    // origin so Axios always produces fully-qualified URLs.
    // e.g. '/proxy/auth' → 'http://localhost:3000/proxy/auth'
    // This prevents URL resolution ambiguity that can strip the proxy prefix or
    // switch protocols when the browser page is served over HTTPS or a non-3000 port.
    const resolvedBaseURL =
        typeof window !== 'undefined' && baseURL.startsWith('/')
            ? `${window.location.protocol}//${window.location.host}${baseURL}`
            : baseURL;

    const instance = axios.create({
        baseURL: resolvedBaseURL,
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'any',
        },
    });

    // ── Request interceptor ──────────────────────────────────────────────────
    // Read auth_token from the SameSite=Strict cookie (JS-readable) and attach
    // it as the Authorization header. The token is NOT HttpOnly so that this
    // interceptor can access it directly without any extra API round-trip.
    instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const token = Cookies.get('auth_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    });

    // ── Response interceptor ─────────────────────────────────────────────────
    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            const url = error.config?.url ?? '';
            // Only force-logout when the auth service itself rejects the token.
            // 401 from any other service (eligibility, MDM, RBAC, etc.) means a
            // permission/config issue on that service — not an expired session —
            // so we let the error propagate to the component's catch block.
            const isAuthEndpoint = url.includes('/api/auth/');
            if (typeof window !== 'undefined' && error.response?.status === 401 && isAuthEndpoint) {
                clearAuthToken();
                window.location.href = '/pharmacy/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
}
