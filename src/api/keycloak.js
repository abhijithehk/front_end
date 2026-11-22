import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'hms-realm',
  clientId: 'hms-web'
});

/**
 * Perform a reliable logout:
 * 1. If Keycloak is authenticated, calls OIDC RP-Initiated logout.
 * 2. Clears local tokens and session caches.
 * 3. Falls back to direct browser redirect if the SDK logout fails.
 */
export const logoutUser = async () => {
  try {
    if (keycloak && keycloak.authenticated) {
      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    } else {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = window.location.origin;
    }
  } catch (error) {
    console.warn("[Keycloak] SDK logout encountered an error, using direct logout fallback:", error);
    sessionStorage.clear();
    localStorage.clear();
    // Direct OpenID Connect logout endpoint fallback
    const idToken = keycloak.idToken ? `&id_token_hint=${encodeURIComponent(keycloak.idToken)}` : '';
    const logoutUrl = `http://localhost:8080/realms/hms-realm/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}&client_id=hms-web${idToken}`;
    window.location.href = logoutUrl;
  }
};

/**
 * Redirect user to Keycloak login page
 */
export const loginUser = async () => {
  try {
    await keycloak.login({
      redirectUri: window.location.origin,
    });
  } catch (error) {
    console.error("[Keycloak] Login redirect failed:", error);
    window.location.href = `http://localhost:8080/realms/hms-realm/protocol/openid-connect/auth?client_id=hms-web&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid`;
  }
};

export default keycloak;