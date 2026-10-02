import "@fontsource-variable/libre-franklin";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import AuthProvider from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Last resort for crashes outside a page, such as in the navigation bar. */}
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
