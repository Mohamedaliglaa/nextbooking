import { useEffect, useState } from "react";

/** Lightweight loader for the Google Maps JS API. */
export function useLoadGoogleMaps(apiKey: string, libraries: string[] = []) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).__gmapsLoaded) {
      setLoaded(true);
      return;
    }
    if ((window as any).__gmapsLoadingPromise) {
      (window as any).__gmapsLoadingPromise.then(() => setLoaded(true));
      return;
    }

    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      libraries: libraries.join(","),
    });
    const src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    (window as any).__gmapsLoadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        (window as any).__gmapsLoaded = true;
        resolve();
        setLoaded(true);
      };
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    }).catch(() => { /* error already thrown */ });
  }, [apiKey, libraries.join(",")]);

  return loaded;
}
