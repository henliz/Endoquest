// src/audio/WebAudioManager.tsx
import { useEffect, useRef } from 'react';

type TrackKey = 'title' | 'vn' | 'combat' | 'ache';

const AUDIO_TRACKS: Record<TrackKey, string> = {
  title:  '/sounds/FreeDarkMenuTheme',       // starts at 20s
  vn:     '/sounds/IntroductionSpookyFree.mp3',// <-- ensure this exists in /public/sounds
  combat: '/sounds/UndertaleInspiredFree.mp3',
  ache:   '/sounds/EndlessSadnessFreeAcheTheme.mp3',
};

// Per-track offsets (seconds)
const START_AT: Partial<Record<TrackKey, number>> = { title: 20 };

// ---- GLOBAL MIXER (singleton on window) ----
declare global {
  interface Window {
    __ENDO_AUDIO_CTX__?: AudioContext;
    __ENDO_AUDIO_MIXER__?: {
      owner?: object;
      key?: TrackKey;
      src?: AudioBufferSourceNode;
      gain?: GainNode;
      fadeMs?: number;
      playing?: boolean;
      bufferCache: Map<string, AudioBuffer>;
    };
  }
}

function getCtx(): AudioContext | null {
  return window.__ENDO_AUDIO_CTX__ ?? null;
}

function getMixer() {
  if (!window.__ENDO_AUDIO_MIXER__) {
    window.__ENDO_AUDIO_MIXER__ = { bufferCache: new Map<string, AudioBuffer>() };
  }
  return window.__ENDO_AUDIO_MIXER__!;
}

async function fetchBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const mixer = getMixer();
  const cache = mixer.bufferCache;
  const cached = cache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('[audio] HTTP error', res.status, url);
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const arr = await res.arrayBuffer();
  const buf = await ctx.decodeAudioData(arr);
  cache.set(url, buf);
  return buf;
}

export function WebAudioManager({
  track,
  volume = 0.35,
  fadeMs = 1200,
  enabled = true,
}: {
  track: TrackKey;
  volume?: number;
  fadeMs?: number;
  enabled?: boolean;
}) {
  const ownerRef = useRef<object>({});      // unique identity for this instance
  const mySrcRef = useRef<AudioBufferSourceNode | null>(null);
  const myGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let destroyed = false;

    const startWhenReady = async (ctx: AudioContext) => {
      if (destroyed || !enabled) return;

      try { await ctx.resume(); } catch {}

      const url = AUDIO_TRACKS[track];
      console.log('[audio] switching to', track, '→', url);

      let buf: AudioBuffer;
      try {
        buf = await fetchBuffer(ctx, url);
      } catch (err) {
        console.error('[audio] failed to fetch/decode', url, err);
        return;
      }
      if (destroyed) return;

      const mixer = getMixer();
      const t = ctx.currentTime;
      const fadeSec = Math.max(0, fadeMs) / 1000;

      // Build NEW nodes
      const newSrc = ctx.createBufferSource();
      newSrc.buffer = buf;
      newSrc.loop = true;

      const newGain = ctx.createGain();
      newGain.gain.setValueAtTime(0, t); // start silent
      newSrc.connect(newGain).connect(ctx.destination);

      // Capture PREVIOUS nodes BEFORE we touch the mixer
      const prevSrc = mixer.src;
      const prevGain = mixer.gain;

      // ---- ATOMIC HANDOFF: claim the mixer first ----
      mixer.owner   = ownerRef.current;
      mixer.key     = track;
      mixer.src     = newSrc;
      mixer.gain    = newGain;
      mixer.fadeMs  = fadeMs;
      mixer.playing = true;

      // Keep refs so our cleanup knows which nodes are ours
      mySrcRef.current  = newSrc;
      myGainRef.current = newGain;

      // Start new first (avoid dead air)
      const offset = Math.max(0, Math.min(START_AT[track] ?? 0, buf.duration));
      try {
        newSrc.start(t, offset);
      } catch (err) {
        console.error('[audio] start() failed', url, err);
        // If start fails, roll back ownership so we don't leave the mixer in a broken state
        if (mixer.owner === ownerRef.current && mixer.src === newSrc) {
          mixer.owner = undefined; mixer.src = undefined; mixer.gain = undefined; mixer.playing = false;
        }
        return;
      }

      // Fade in new
      newGain.gain.cancelScheduledValues(t);
      newGain.gain.setValueAtTime(0, t);
      newGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), t + fadeSec);

      // Now fade out & stop the PREVIOUS nodes (not whatever the mixer points at now)
      if (prevSrc && prevGain) {
        prevGain.gain.cancelScheduledValues(t);
        prevGain.gain.setValueAtTime(prevGain.gain.value, t);
        prevGain.gain.linearRampToValueAtTime(0, t + fadeSec);
        setTimeout(() => { try { prevSrc.stop(); } catch {} }, fadeMs + 50);
      }
    };

    const ctx = getCtx();
    if (ctx) {
      startWhenReady(ctx);
    } else {
      const onReady = (e: Event) => {
        const c = (e as CustomEvent<AudioContext>).detail ?? getCtx();
        if (c) startWhenReady(c);
      };
      window.addEventListener('audioready', onReady, { once: true });
      return () => window.removeEventListener('audioready', onReady);
    }

    // Cleanup: only stop if we STILL own the mixer and nodes match ours
    return () => {
      destroyed = true;
      const mixer = getMixer();
      const c = getCtx();
      const mySrc = mySrcRef.current;
      const myGain = myGainRef.current;

      if (mixer.owner === ownerRef.current && mixer.src === mySrc && mixer.gain === myGain && mySrc && myGain && c) {
        const t = c.currentTime;
        const fadeSec = Math.max(0, (mixer.fadeMs ?? fadeMs)) / 1000;
        myGain.gain.cancelScheduledValues(t);
        myGain.gain.setValueAtTime(myGain.gain.value, t);
        myGain.gain.linearRampToValueAtTime(0, t + fadeSec);
        setTimeout(() => { try { mySrc.stop(); } catch {} }, (mixer.fadeMs ?? fadeMs) + 50);
        mixer.owner = undefined;
        mixer.src = undefined;
        mixer.gain = undefined;
        mixer.key = undefined;
        mixer.playing = false;
      }

      mySrcRef.current = null;
      myGainRef.current = null;
    };
  }, [track, volume, fadeMs, enabled]);

  return null;
}

