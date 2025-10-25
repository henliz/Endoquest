// src/components/HowlerAudioManager.tsx
import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

type TrackKey = 'title' | 'vn' | 'combat';

// Map tracks to /public files
const AUDIO_TRACKS: Record<TrackKey, string> = {
  title:  '/sounds/FreeDarkMenuTheme.mp3', // will start at 20s
  vn:     '/audio/bgm/vn-ambient.mp3',
  combat: '/audio/bgm/combat-theme.mp3',
};

// Per-track start offsets (seconds)
const START_AT: Partial<Record<TrackKey, number>> = {
  title: 20,
};

// Cache per track (one Howl each)
const howls: Partial<Record<TrackKey, Howl>> = {};
let currentKey: TrackKey | null = null;
let currentId: number | null = null;

function onFirstGesture(cb: () => void) {
  const handler = () => {
    try { cb(); } finally {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    }
  };
  window.addEventListener('pointerdown', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
  window.addEventListener('touchstart', handler, { once: true, passive: true });
}

// IMPORTANT: use WebAudio (html5: false) for precise seeks; we’ll still handle autoplay blocks.
function getOrCreateHowl(key: TrackKey) {
  if (!howls[key]) {
    const h = new Howl({
      src: [AUDIO_TRACKS[key]],
      loop: true,
      html5: false,   // WebAudio = smoother seeking; set true only if iOS long-MP3 issues
      preload: true,
      volume: 0,      // we’ll fade up after starting
      autoplay: false // we control play timing
    });

    h.on('load', () => console.log(`[audio] '${key}' loaded (${AUDIO_TRACKS[key]})`));
    h.on('play', id => console.log(`[audio] '${key}' playing (id ${id})`));
    h.on('playerror', (_id, err) => {
      console.warn(`[audio] '${key}' playerror`, err);
      // Fallback: gesture will try again
      onFirstGesture(() => tryStartHowl(h, key, 0.35, START_AT[key]));
    });

    howls[key] = h;
  }
  return howls[key]!;
}

// Start logic that avoids the “blip then jump”
function tryStartHowl(h: Howl, key: TrackKey, vol: number, startAt?: number, allowMutedAutoplay = true) {
  // 1) If allowed, attempt muted autoplay (works on many browsers):
  //    - mute globally, prepare seek, play, then unmute+fade
  // 2) If it fails, playerror handler will install the gesture fallback.
  const actuallyStart = () => {
    const doPlay = () => {
      const id = h.play();
      // we seek BEFORE any audible audio by doing it right after play; with WebAudio + not started yet, this is frame-accurate
      if (typeof startAt === 'number') {
        if (h.state() === 'loaded') h.seek(startAt, id);
        else h.once('load', () => h.seek(startAt, id));
      }
      // fade to target
      h.fade(0, vol, 800, id);
      return id;
    };

    if (allowMutedAutoplay) {
      // Globally mute, start, then unmute to fade in
      const wasMuted = (Howler as any)._muted || false;
      Howler.mute(true);
      const id = doPlay();
      // Unmute on next tick so the first audible frame is already at the target seek
      setTimeout(() => {
        // If site policy still forbids, playerror will have run and we’ll rely on gesture.
        Howler.mute(wasMuted); // restore previous mute state (usually false)
      }, 60);
      return id;
    } else {
      return doPlay();
    }
  };

  // If already loaded, start immediately; otherwise start when loaded
  if (h.state() === 'loaded') {
    return actuallyStart();
  } else {
    h.once('load', () => actuallyStart());
    // In case load has already fired but state not updated yet, also try a short later tick
    setTimeout(() => {
      if (!h.playing()) actuallyStart();
    }, 120);
  }
}

function crossfade(toKey: TrackKey, toVol: number, ms = 1200) {
  const to = getOrCreateHowl(toKey);

  // Start target (muted autoplay attempt); remember id
  let toId = currentId;
  if (!to.playing()) {
    toId = tryStartHowl(to, toKey, toVol, START_AT[toKey], /*allowMutedAutoplay*/ true) ?? null;
    currentId = toId;
  } else if (toId == null) {
    toId = to.play();
    currentId = toId;
  }

  // Crossfade out previous
  if (currentKey && currentKey !== toKey) {
    const from = howls[currentKey];
    if (from) {
      from.fade(from.volume(), 0, ms);
      setTimeout(() => from.stop(), ms + 60);
    }
  }

  currentKey = toKey;
  return to;
}

export function HowlerAudioManager({
  track,
  enabled = true,
  volume = 0.35,
  fadeMs = 1200,
}: {
  track: TrackKey;
  enabled?: boolean;
  volume?: number;
  fadeMs?: number;
}) {
  const mountedRef = useRef(false);

  useEffect(() => {
    console.log(`[audio] manager mount -> track='${track}', enabled=${enabled}, vol=${volume}`);

    if (!enabled) { Howler.mute(true); return; }
    Howler.mute(false);

    // Attempt start; if browser still blocks, playerror installs a gesture fallback.
    crossfade(track, volume, fadeMs);

    mountedRef.current = true;
    return () => {
      if (mountedRef.current && currentKey) {
        const active = howls[currentKey];
        if (active) {
          active.fade(active.volume(), 0, 500);
          setTimeout(() => active.stop(), 560);
        }
      }
      mountedRef.current = false;
    };
  }, [track, enabled, volume, fadeMs]);

  return null;
}
