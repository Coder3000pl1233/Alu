const DEVICE_ID_KEY = "aula-segura:device-id";

export function getOrCreateDeviceId(storage: Pick<Storage, "getItem" | "setItem"> = window.localStorage) {
  const existing = storage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  storage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function describeDevice(userAgent = navigator.userAgent) {
  if (/iPhone|iPad/i.test(userAgent)) return "Safari en iOS";
  if (/Android/i.test(userAgent)) return "Navegador en Android";
  if (/Windows/i.test(userAgent)) return "Navegador en Windows";
  if (/Macintosh/i.test(userAgent)) return "Navegador en macOS";
  return "Navegador web";
}
