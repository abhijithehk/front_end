import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./api/keycloak.js";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Attempt Keycloak SSO initialization with graceful fallback for development
keycloak
  .init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    pkceMethod: "S256"
  })
  .then((authenticated) => {
    console.log("[Keycloak] Initialized. Authenticated:", authenticated);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.warn("[Keycloak] Initialization failed (running in dev/offline mode):", error);
    // Render the App anyway so developer never gets a blank white screen
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
