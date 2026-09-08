"use client";

import { useEffect } from "react";

const RELOAD_KEY = "liberty-sw-refresh";

export function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return undefined;
    }

    let mounted = true;

    const handleControllerChange = () => {
      if (!mounted) {
        return;
      }

      try {
        if (sessionStorage.getItem(RELOAD_KEY) === "1") {
          sessionStorage.removeItem(RELOAD_KEY);
          return;
        }
        sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        // If storage is unavailable, still reload once for the new controller.
      }

      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await registration.update();
      } catch (error) {
        console.error("Liberty Church service worker registration failed", error);
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      mounted = false;
      window.removeEventListener("load", register);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
