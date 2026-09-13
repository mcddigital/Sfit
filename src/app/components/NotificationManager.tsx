import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission, sendNotification } from "../utils/pwaInstaller";
import { Button } from "./ui/button";

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
    const dismissed = localStorage.getItem("notification-prompt-dismissed") === "true";

    if (Notification.permission === "default" && !dismissed) {
      const timer = window.setTimeout(() => setShowPrompt(true), 12000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!showPrompt || permission !== "default") return null;

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  const enable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    setShowPrompt(false);
    if (result === "granted") {
      toast.success("Notificações ativadas.");
      await sendNotification("SmartFit", {
        body: "Notificações ativadas. Você está pronto para receber lembretes do app.",
        tag: "smartfit-welcome",
      });
    } else {
      toast.info("Você pode ativar notificações depois nas configurações do navegador.");
    }
  };

  return (
    <div className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border bg-white p-4 shadow-[0_22px_60px_rgba(15,23,20,0.16)] sm:right-6">
      <div className="flex items-start gap-3">
        <div className="icon-chip shrink-0"><Bell className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Ativar notificações?</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">Permita lembretes do SmartFit quando o navegador oferecer suporte.</p>
            </div>
            <button type="button" onClick={dismiss} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={enable}>Ativar</Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>Agora não</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
