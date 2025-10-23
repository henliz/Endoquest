import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  bgmUrl: string; // Can be MP3 or MP4 URL
  volume?: number; // 0.0 to 1.0
  fadeTime?: number; // milliseconds
}

export function AudioManager({ bgmUrl, volume = 0.5, fadeTime = 1000 }: AudioManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0; // Start silent for fade-in
    audioRef.current = audio;

    // Try to play
    const playAudio = async () => {
      try {
        await audio.play();
        
        // Fade in
        const fadeSteps = 30;
        const fadeInterval = fadeTime / fadeSteps;
        const volumeStep = volume / fadeSteps;
        let currentStep = 0;

        const fadeIn = setInterval(() => {
          currentStep++;
          if (audioRef.current) {
            audioRef.current.volume = Math.min(volume, audioRef.current.volume + volumeStep);
          }
          
          if (currentStep >= fadeSteps) {
            clearInterval(fadeIn);
          }
        }, fadeInterval);
      } catch (err) {
        // Browser autoplay policy blocked it - will play on user interaction
        console.log('Audio waiting for user interaction');
      }
    };

    playAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        // Fade out
        const fadeOutSteps = 20;
        const fadeOutInterval = fadeTime / fadeOutSteps;
        let currentVol = audioRef.current.volume;
        
        const fadeOut = setInterval(() => {
          if (audioRef.current) {
            currentVol -= volume / fadeOutSteps;
            audioRef.current.volume = Math.max(0, currentVol);
            
            if (audioRef.current.volume <= 0) {
              clearInterval(fadeOut);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
              }
            }
          }
        }, fadeOutInterval);
      }
    };
  }, [bgmUrl, volume, fadeTime]);

  return null;
}

// Hook for sound effects
export function useSound() {
  const playSound = (soundUrl: string, volume = 0.5) => {
    const sound = new Audio(soundUrl);
    sound.volume = volume;
    sound.play().catch(err => {
      console.log('Sound effect failed:', err);
    });
  };

  return { playSound };
}
