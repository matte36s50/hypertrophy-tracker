"use client";

import { useEffect } from "react";

// Registers the service worker so the app can be installed to the home screen
// and load offline. Runs only in the browser, only in production-like contexts.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("Service worker registration failed:", err));
    };

    // Wait until the page has loaded so registration doesn't compete with the
    // initial render.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
