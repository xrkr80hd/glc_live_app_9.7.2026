"use client";

import { useEffect, useState } from "react";
import { IconDeviceMobile, IconDownload, IconShare3 } from "@tabler/icons-react";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";

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
    <MemberAccordion
      title="Save to Home Screen"
      description="Tap to see the short steps for keeping the member area on your phone."
    >
      <div className="lc-upload-panel compact">
        <div className="lc-upload-dropzone compact">
          <span className="lc-upload-icon">
            {platform === "ios" ? <IconShare3 size={28} stroke={1.8} /> : <IconDeviceMobile size={28} stroke={1.8} />}
          </span>
          <strong>Add Liberty Church to your home screen</strong>
          <div className="lc-step-list">
            {platform === "ios" ? (
              <>
                <span>1. Open the Share menu in Safari.</span>
                <span>2. Tap <strong>Add to Home Screen</strong>.</span>
                <span>3. Tap <strong>Add</strong> in the top corner.</span>
              </>
            ) : (
              <>
                <span>1. Open your browser menu.</span>
                <span>2. Choose <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                <span>3. Confirm the install so it stays one tap away.</span>
              </>
            )}
          </div>

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
    </MemberAccordion>
  );
}
