export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let promptListenersBound = false;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return null;

  try {
    const base = import.meta.env.BASE_URL || '/';
    const registration = await navigator.serviceWorker.register(`${base}service-worker.js`, { scope: base });
    return registration;
  } catch (error) {
    console.warn('Service Worker não pôde ser registrado:', error);
    return null;
  }
}

export function setupPWAInstallPrompt(): void {
  if (promptListenersBound) return;
  promptListenersBound = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) return false;

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone) ||
    document.referrer.includes('android-app://');
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function sendNotification(title: string, options?: NotificationOptions): Promise<void> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: `${import.meta.env.BASE_URL}icon-192x192.png`,
        badge: `${import.meta.env.BASE_URL}icon-192x192.png`,
        ...options,
      });
      return;
    }

    new Notification(title, { icon: `${import.meta.env.BASE_URL}icon-192x192.png`, ...options });
  } catch (error) {
    console.warn('Não foi possível enviar a notificação:', error);
  }
}
