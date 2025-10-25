// src/audio/AudioGate.tsx
import { useEffect } from 'react';

declare global {
  interface Window { __ENDO_AUDIO_CTX__?: AudioContext }
}

export function AudioGate() {
  useEffect(() => {
    const unlock = () => {
      try {
        if (!window.__ENDO_AUDIO_CTX__) {
          const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
          window.__ENDO_AUDIO_CTX__ = new Ctor();
        }
        window.__ENDO_AUDIO_CTX__!.resume?.();
        window.dispatchEvent(new CustomEvent('audioready', { detail: window.__ENDO_AUDIO_CTX__ }));
      } catch {}
      cleanup();
    };

    const opts = { once: true } as AddEventListenerOptions;
    const optsPassive = { once: true, passive: true } as AddEventListenerOptions;

    const cleanup = () => {
      window.removeEventListener('pointerdown', unlock as any);
      window.removeEventListener('keydown', unlock as any);
      window.removeEventListener('touchstart', unlock as any);
      window.removeEventListener('wheel', unlock as any);
      document.removeEventListener('pointerdown', unlock as any, true);
      document.removeEventListener('touchstart', unlock as any, true);
    };

    // window-level
    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);
    window.addEventListener('touchstart', unlock, optsPassive);
    window.addEventListener('wheel', unlock, optsPassive);
    // capture-phase on document to catch early taps in nested trees
    document.addEventListener('pointerdown', unlock, { ...opts, capture: true });
    document.addEventListener('touchstart', unlock, { ...optsPassive, capture: true });

    return cleanup;
  }, []);

  return null;
}
