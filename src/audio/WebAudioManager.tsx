// src/audio/WebAudioManager.tsx
import { useEffect, useRef } from 'react';

type TrackKey = 'title' | 'vn' | 'combat';

const AUDIO_TRACKS: Record<TrackKey, string> = {
  title:  '/sounds/TheOuterWorldsHope_JustinEBell.mp3', // starts at 20s
  vn:     '/audio/bgm/vn-ambient.mp3',
  combat: '/audio/bgm/combat-theme.mp3',
};

// Per-track offsets (seconds)
const START_AT: Partial<Record<TrackKey, number>> = { title: 20 };

// ---- helpers ----
function getCtx(): AudioContext | null {
  return (window as any).__ENDO_AUDIO_CTX__ ?? null;
}

const bufferCache = new Map<string, AudioBuffer>();
async function fetchBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  const arr = await res.arrayBuffer();
  const buf = await ctx.decodeAudioData(arr);
  bufferCache.set(url, buf);
  return buf;
}

// ---- component ----
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
  const currentSrcRef = useRef<AudioBufferSourceNode | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let destroyed = false;

    const startWhenReady = async (ctx: AudioContext) => {
      if (destroyed || !enabled) return;

      try { await ctx.resume(); } catch {}

      const url = AUDIO_TRACKS[track];
      const buf = await fetchBuffer(ctx, url);
      if (destroyed) return;

      // build nodes
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const gain = ctx.createGain();
      const t = ctx.currentTime;
      const fadeSec = Math.max(0, fadeMs) / 1000;

      gain.gain.setValueAtTime(0, t);
      src.connect(gain).connect(ctx.destination);

      // crossfade out previous
      if (currentSrcRef.current && currentGainRef.current) {
        const prevSrc = currentSrcRef.current;
        const prevGain = currentGainRef.current;
        prevGain.gain.cancelScheduledValues(t);
        prevGain.gain.setValueAtTime(prevGain.gain.value, t);
        prevGain.gain.linearRampToValueAtTime(0, t + fadeSec);
        setTimeout(() => { try { prevSrc.stop(); } catch {} }, fadeMs + 50);
      }

      // start at offset (no blip)
      const offset = Math.max(0, Math.min(START_AT[track] ?? 0, buf.duration));
      src.start(t, offset);

      // fade in
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), t + fadeSec);

      currentSrcRef.current = src;
      currentGainRef.current = gain;
    };

    // if AudioContext already exists, go now; else wait for AudioGate
    const existing = getCtx();
    if (existing) {
      startWhenReady(existing);
    } else {
      const onReady = (e: Event) => {
        const ctx = (e as CustomEvent<AudioContext>).detail ?? getCtx();
        if (ctx) startWhenReady(ctx);
      };
      window.addEventListener('audioready', onReady, { once: true });
      return () => window.removeEventListener('audioready', onReady);
    }

    return () => {
      destroyed = true;
      const ctx = getCtx();
      const src = currentSrcRef.current;
      const g = currentGainRef.current;
      if (src && g && ctx) {
        const t = ctx.currentTime;
        const fadeSec = Math.max(0, fadeMs) / 1000;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + fadeSec);
        setTimeout(() => { try { src.stop(); } catch {} }, fadeMs + 50);
      }
      currentSrcRef.current = null;
      currentGainRef.current = null;
    };
  }, [track, volume, fadeMs, enabled]);

  return null;
}
