"use client";

import { useEffect, useState } from "react";
import { IconDeviceMobile, IconDownload, IconShare3 } from "@tabler/icons-react";

export function AddToHomeScreenCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState("generic");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent || "";
    const isIos = /iphone|ipad|ipod/i.test(ua);
    setPlatform(isIos ? "ios" : "generic");

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) {
    return null;
  }

  return (
    <section className="lc-card">
      <div className="lc-upload-panel-head">
        <div className="lc-section-head">
          <h2>Save to Home Screen</h2>
          <p className="lc-muted">Keep the member beta one tap away on your phone.</p>
        </div>
      </div>

      <div className="lc-upload-panel compact">
        <div className="lc-upload-dropzone compact">
          <span className="lc-upload-icon">
            {platform === "ios" ? <IconShare3 size={28} stroke={1.8} /> : <IconDeviceMobile size={28} stroke={1.8} />}
          </span>
          <strong>Add Liberty Church to your home screen</strong>
          <span className="lc-muted">
            {platform === "ios"
              ? "Tap Share, then choose Add to Home Screen."
              : "Use your browser menu to install or add this app to your home screen."}
          </span>

          {deferredPrompt ? (
            <button
              type="button"
              className="lc-upload-browse"
              onClick={async () => {
                await deferredPrompt.prompt();
                setDeferredPrompt(null);
              }}
            >
              <IconDownload size={18} stroke={1.8} />
              <span>Install App</span>
            </button>
          ) : (
            <span className="lc-upload-helper">Works best after you have already signed in once.</span>
          )}
        </div>
      </div>
    </section>
  );
}
