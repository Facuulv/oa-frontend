"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISS_KEY = "oa:pwa:prompt:dismissed-at";
const HIDE_GUIDE_KEY = "oa:pwa:guide:hidden";
const INSTALLED_KEY = "oa:pwa:installed";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function detectPwaPlatform() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const ua = window.navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isChrome =
    /Chrome\/\d+/i.test(ua) &&
    !/EdgA|OPR|SamsungBrowser|Firefox|DuckDuckGo/i.test(ua);

  if (isAndroid && isChrome) {
    return "android-chrome";
  }

  if (isIosSafariBrowser()) {
    return "ios-safari";
  }

  return "unknown";
}

function isIosSafariBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebkitSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isWebkitSafari;
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function isSmallScreen() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia?.("(max-width: 1024px)")?.matches;
}

export default function usePwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState("unknown");
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isGuideHidden, setIsGuideHidden] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneDisplayMode();
    const nextPlatform = detectPwaPlatform();
    const mobile = isSmallScreen();

    setIsStandalone(standalone);
    setPlatform(nextPlatform);
    setIsMobile(mobile);

    let dismissed = false;
    let installed = false;
    let hiddenGuide = false;

    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
      dismissed = Date.now() - dismissedAt < DISMISS_TTL_MS;
      installed = window.localStorage.getItem(INSTALLED_KEY) === "1";
      hiddenGuide = window.localStorage.getItem(HIDE_GUIDE_KEY) === "1";
    } catch {
      dismissed = false;
      installed = standalone;
      hiddenGuide = false;
    }

    setIsDismissed(dismissed);
    setIsInstalled(installed || standalone);
    setIsGuideHidden(hiddenGuide);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
      setIsStandalone(true);
      try {
        window.localStorage.setItem(INSTALLED_KEY, "1");
      } catch {
        // Silencioso: no rompe UX si falla localStorage.
      }
    };

    const media = window.matchMedia?.("(display-mode: standalone)");
    const handleDisplayModeChange = (event) => {
      const standalone = Boolean(event.matches);
      setIsStandalone(standalone);
      if (standalone) {
        setIsInstalled(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    media?.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      media?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Silencioso: no rompe UX si falla localStorage.
    }
  }, []);

  const hideGuideForever = useCallback(() => {
    setIsGuideHidden(true);
    try {
      window.localStorage.setItem(HIDE_GUIDE_KEY, "1");
    } catch {
      // Silencioso: no rompe UX si falla localStorage.
    }
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) {
      return null;
    }

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      if (choice?.outcome === "accepted") {
        setIsInstalled(true);
        try {
          window.localStorage.setItem(INSTALLED_KEY, "1");
        } catch {
          // Silencioso: no rompe UX si falla localStorage.
        }
      } else {
        dismissPrompt();
      }
      return choice?.outcome || null;
    } catch {
      dismissPrompt();
      return null;
    }
  }, [dismissPrompt, installEvent]);

  const canShowPrompt = useMemo(() => {
    if (!isMobile || isStandalone || isInstalled || isDismissed) {
      return false;
    }

    return Boolean(installEvent) || platform === "ios-safari";
  }, [installEvent, isDismissed, isInstalled, isMobile, isStandalone, platform]);

  const canOfferInstallGuide = useMemo(() => {
    if (isStandalone || isInstalled || isGuideHidden) {
      return false;
    }
    return true;
  }, [isGuideHidden, isInstalled, isStandalone]);

  return {
    canShowPrompt,
    canUseNativeInstall: Boolean(installEvent) && platform === "android-chrome",
    canOfferInstallGuide,
    platform,
    isIOS: platform === "ios-safari",
    dismissPrompt,
    hideGuideForever,
    promptInstall,
  };
}
