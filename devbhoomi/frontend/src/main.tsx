import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./i18n";
import "./styles/index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ProfileGateProvider } from "./context/ProfileGateContext";
import ScrollToTop from "./components/ScrollToTop";

import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/600.css";

import "@fontsource/tiro-devanagari-hindi";

import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />

      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId="58781454131-6ghj0qmfsu6ihkos2p6n9v970utmg4p6.apps.googleusercontent.com">
          <AuthProvider>
            <ProfileGateProvider>
              <App />
            </ProfileGateProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);