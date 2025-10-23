import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface HowlerAudioManagerProps {
  track: 'vn' | 'combat';
  volume?: number; // 0-1
  enabled?: boolean;
}

// 🎵 TEMPORARY: Using placeholder URLs until you add real MP3 files
// To use your own files: Upload to /public/audio/ and it will work automatically!
const AUDIO_TRACKS = {
  vn: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d1718372d8.mp3',        // Gothic ambient placeholder
  combat: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4e1b364fe8.mp3',   // Battle music placeholder
};

// When you add YOUR files to /public/audio/, uncomment these and comment out the placeholders:
// const AUDIO_TRACKS = {
//   vn: '/audio/vn-ambient.mp3',
//   combat: '/audio/combat-theme.mp3',
// };

// Store Howl instances globally to persist across renders
const howlInstances: Record<string, Howl> = {};
let currentlyPlaying: string | null = null;

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
          // Silently handle - audio is optional
          if (!src.startsWith('http')) {
            console.log(`ℹ️ Audio file not found: ${src}`);
            console.log(`   To add music: Upload MP3 to /public/audio/`);
          }
        },
        onload: () => {
          console.log(`🎵 Audio loaded: ${key}`);
        }
      });
    });
  }
  return howlInstances;
};

export function HowlerAudioManager({ track, volume = 0.3, enabled = true }: HowlerAudioManagerProps) {
  useEffect(() => {
    if (!enabled) return;

    const sounds = initializeAudio();
    const targetSound = sounds[track];

    if (!targetSound) {
      return; // Silently skip if audio not available
    }

    // If this track is already playing, just adjust volume
    if (currentlyPlaying === track) {
      try {
        targetSound.volume(volume);
      } catch (e) {
        // Audio may not be ready yet
      }
      return;
    }

    // Crossfade from current track to new track
    const fadeTime = 1500; // 1.5 seconds

    // Fade out current track
    if (currentlyPlaying && sounds[currentlyPlaying]) {
      const oldSound = sounds[currentlyPlaying];
      try {
        oldSound.fade(oldSound.volume(), 0, fadeTime);
        setTimeout(() => {
          oldSound.stop();
        }, fadeTime);
      } catch (e) {
        oldSound.stop();
      }
    }

    // Fade in new track
    try {
      targetSound.volume(0);
      targetSound.play();
      targetSound.fade(0, volume, fadeTime);
      currentlyPlaying = track;
    } catch (e) {
      console.log('ℹ️ Audio autoplay blocked by browser - user interaction needed');
    }

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

  return null; // This component doesn't render anything
}
