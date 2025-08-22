import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppMode = window.navigator.standalone === true;

    if (isStandalone || isInWebAppMode) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setShowButton(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timer = setTimeout(() => {
      if (!isInstalled && !deferredPrompt) {
        setShowButton(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'To install this app:\n\n• On Android Chrome: Tap the menu (⋮) and select "Add to Home screen"\n• On iPhone Safari: Tap the share button (□↑) and select "Add to Home Screen"'
      );
      return;
    }

    const result = await deferredPrompt.prompt();
    console.log("Install prompt result:", result);

    if (result.outcome === "accepted") {
      console.log("User accepted the install prompt");
      setShowButton(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowButton(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || sessionStorage.getItem("pwa-install-dismissed")) {
    return null;
  }

  if (!showButton) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-bounce relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3 pr-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install Safety Net App
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Stay connected and secure with instant access to Safety Net services.
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;
