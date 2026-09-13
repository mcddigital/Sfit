import { useEffect, useState } from "react";
import { Check, Download, Smartphone, X } from "lucide-react";
import { canInstallPWA, isPWAInstalled, showInstallPrompt } from "../utils/pwaInstaller";
import { Button } from "./ui/button";

export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    setCanInstall(canInstallPWA());

    const handleInstallable = () => setCanInstall(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setExpanded(false);
    };

    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("pwa-installed", handleInstalled);
    return () => {
      window.removeEventListener("pwa-installable", handleInstallable);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  if (isInstalled || !canInstall) return null;

  const install = async () => {
    setIsInstalling(true);
    const accepted = await showInstallPrompt();
    setIsInstalling(false);
    if (accepted) setExpanded(false);
  };

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setExpanded(true)}
        className="fixed bottom-5 right-5 z-40 hidden h-11 w-11 rounded-xl bg-white shadow-[0_10px_30px_rgba(15,23,20,0.12)] sm:inline-flex"
        aria-label="Instalar aplicativo"
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border bg-white p-4 shadow-[0_22px_60px_rgba(15,23,20,0.18)]">
      <div className="flex items-start gap-3">
        <div className="icon-chip shrink-0"><Smartphone className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Instalar SmartFit</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">Use o app em tela cheia e tenha acesso rápido pela tela inicial.</p>
            </div>
            <button type="button" onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" /> PWA com suporte offline básico
          </div>
          <Button className="mt-4 w-full" onClick={install} disabled={isInstalling}>
            <Download className="h-4 w-4" /> {isInstalling ? "Abrindo instalação..." : "Instalar aplicativo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
