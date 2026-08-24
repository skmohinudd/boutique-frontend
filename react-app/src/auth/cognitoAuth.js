import { environment } from "../config/environment";

const KEYS = {
  verifier: "boutique-pkce-verifier",
  state: "boutique-oauth-state",
  returnTo: "boutique-auth-return-to",
  access: "boutique-access-token",
  id: "boutique-id-token",
  refresh: "boutique-refresh-token",
};

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}
async function sha256(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}
function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(
      decodeURIComponent(
        Array.from(atob(padded))
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join(""),
      ),
    );
  } catch {
    return null;
  }
}
function saveTokens(tokens) {
  if (tokens.access_token)
    sessionStorage.setItem(KEYS.access, tokens.access_token);
  if (tokens.id_token) sessionStorage.setItem(KEYS.id, tokens.id_token);
  if (tokens.refresh_token)
    sessionStorage.setItem(KEYS.refresh, tokens.refresh_token);
}
export function getTokens() {
  return {
    accessToken: sessionStorage.getItem(KEYS.access),
    idToken: sessionStorage.getItem(KEYS.id),
    refreshToken: sessionStorage.getItem(KEYS.refresh),
  };
}
export function clearTokens() {
  Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
}
export function getClaims() {
  return decodeJwt(getTokens().idToken);
}
export function accessTokenExpired() {
  const claims = decodeJwt(getTokens().accessToken);
  return !claims?.exp || claims.exp * 1000 <= Date.now() + 15_000;
}
async function exchangeToken(params) {
  const response = await fetch(`${environment.auth.domain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  if (!response.ok)
    throw new Error("Secure sign-in could not complete. Please try again.");
  const tokens = await response.json();
  saveTokens(tokens);
  return tokens;
}
export async function startAuthentication({
  returnTo = "/account",
  signup = false,
} = {}) {
  const verifier = randomString(72);
  const challenge = base64Url(await sha256(verifier));
  const state = randomString(28);
  sessionStorage.setItem(KEYS.verifier, verifier);
  sessionStorage.setItem(KEYS.state, state);
  sessionStorage.setItem(KEYS.returnTo, returnTo);
  const endpoint = signup ? "signup" : "oauth2/authorize";
  const url = new URL(`${environment.auth.domain}/${endpoint}`);
  url.searchParams.set("client_id", environment.auth.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", environment.auth.scope);
  url.searchParams.set("redirect_uri", environment.auth.redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  window.location.assign(url.toString());
}
export async function handleAuthenticationCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const returnedState = params.get("state");
  const oauthError = params.get("error");
  if (oauthError)
    throw new Error(
      params.get("error_description") || "Sign-in was cancelled.",
    );
  if (!code) return null;
  const expectedState = sessionStorage.getItem(KEYS.state);
  const verifier = sessionStorage.getItem(KEYS.verifier);
  if (!expectedState || expectedState !== returnedState || !verifier)
    throw new Error(
      "The sign-in response could not be verified. Please sign in again.",
    );
  await exchangeToken({
    grant_type: "authorization_code",
    client_id: environment.auth.clientId,
    code,
    redirect_uri: environment.auth.redirectUri,
    code_verifier: verifier,
  });
  sessionStorage.removeItem(KEYS.verifier);
  sessionStorage.removeItem(KEYS.state);
  const returnTo = sessionStorage.getItem(KEYS.returnTo) || "/account";
  sessionStorage.removeItem(KEYS.returnTo);
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname || "/",
  );
  return returnTo;
}
export async function refreshSession() {
  const refreshToken = getTokens().refreshToken;
  if (!refreshToken) return false;
  try {
    await exchangeToken({
      grant_type: "refresh_token",
      client_id: environment.auth.clientId,
      refresh_token: refreshToken,
    });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}
export async function ensureSession() {
  if (!getTokens().accessToken) return false;
  if (!accessTokenExpired()) return true;
  return refreshSession();
}
export function logoutFromCognito() {
  clearTokens();
  const url = new URL(`${environment.auth.domain}/logout`);
  url.searchParams.set("client_id", environment.auth.clientId);
  url.searchParams.set("logout_uri", environment.auth.logoutUri);
  window.location.assign(url.toString());
}
