import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface HowlerAudioManagerProps {
  track: 'vn' | 'combat';
  volume?: number; // 0-1
  enabled?: boolean;
}

// Audio file paths - ADD YOUR MP3 FILES TO /public/audio/
const AUDIO_TRACKS = {
  vn: '/audio/vn-ambient.mp3',        // Gothic ambient for VN scenes
  combat: '/audio/combat-theme.mp3',   // Epic battle music
};

// Global Howl instances (persist across re-renders)
let howlInstances: Record<string, Howl> = {};
let currentlyPlaying: string | null = null;
let audioUnlocked = false;

// Initialize Howl instances once
const initializeAudio = () => {
  if (Object.keys(howlInstances).length === 0) {
    Object.entries(AUDIO_TRACKS).forEach(([key, src]) => {
      howlInstances[key] = new Howl({
        src: [src],
        loop: true,
        volume: 0,
        preload: true,
        html5: true, // Better for mobile
        onloaderror: (id, error) => {
          console.warn(`⚠️ Failed to load ${key}:`, error);
          console.log(`Make sure ${src} exists!`);
        },
        onload: () => {
          console.log(`✅ Loaded: ${key}`);
        }
      });
    });
  }
  return howlInstances;
};

export function HowlerAudioManager({ track, volume = 0.4, enabled = true }: HowlerAudioManagerProps) {
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Initialize audio on mount
    const sounds = initializeAudio();

    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (!audioUnlocked && !hasInteracted.current) {
        console.log('🔊 Audio unlocked by user interaction');
        audioUnlocked = true;
        hasInteracted.current = true;

        // Resume AudioContext (required by some browsers)
        const ctx = Howler.ctx;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    };

    // Add interaction listener
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !audioUnlocked) return;

    const sounds = initializeAudio();
    const targetSound = sounds[track];

    if (!targetSound) {
      console.warn(`⚠️ Track "${track}" not found`);
      return;
    }

    // If this track is already playing, just adjust volume
    if (currentlyPlaying === track) {
      targetSound.volume(volume);
      return;
    }

    // Crossfade from current track to new track
    const fadeTime = 1500; // 1.5 seconds

    console.log(`🎵 Switching to: ${track}`);

    // Fade out current track
    if (currentlyPlaying && sounds[currentlyPlaying]) {
      const oldSound = sounds[currentlyPlaying];
      oldSound.fade(oldSound.volume(), 0, fadeTime);
      setTimeout(() => {
        oldSound.stop();
      }, fadeTime);
    }

    // Fade in new track
    targetSound.volume(0);
    targetSound.play();
    targetSound.fade(0, volume, fadeTime);
    currentlyPlaying = track;

  }, [track, volume, enabled]);

  // Stop music when component unmounts or disabled
  useEffect(() => {
    return () => {
      if (!enabled && currentlyPlaying) {
        const sounds = initializeAudio();
        const currentSound = sounds[currentlyPlaying];
        if (currentSound) {
          currentSound.fade(currentSound.volume(), 0, 500);
          setTimeout(() => {
            currentSound.stop();
            currentlyPlaying = null;
          }, 500);
        }
      }
    };
  }, [enabled]);

  // This component doesn't render anything
  return null;
}

// Helper function to stop all audio (useful for game over, etc.)
export const stopAllAudio = () => {
  Object.values(howlInstances).forEach(sound => {
    sound.fade(sound.volume(), 0, 500);
    setTimeout(() => sound.stop(), 500);
  });
  currentlyPlaying = null;
};

// Helper to play a one-off sound effect (not looping)
export const playSoundEffect = (src: string, volume = 0.5) => {
  const sfx = new Howl({
    src: [src],
    volume,
    html5: false, // Use Web Audio for SFX (better performance)
  });
  sfx.play();
};
