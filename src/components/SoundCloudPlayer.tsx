import { useEffect, useRef } from 'react';

interface SoundCloudPlayerProps {
  trackUrl: string; // The full SoundCloud track URL
  volume?: number; // 0-100
  autoPlay?: boolean;
}

export function SoundCloudPlayer({ 
  trackUrl, 
  volume = 50,
  autoPlay = true 
}: SoundCloudPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // SoundCloud widget API
    const widget = (window as any).SC?.Widget(iframeRef.current);
    
    if (widget) {
      widget.bind((window as any).SC.Widget.Events.READY, () => {
        widget.setVolume(volume);
        if (autoPlay) {
          widget.play();
        }
      });
    }
  }, [volume, autoPlay, trackUrl]);

  // Build the embed URL
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&auto_play=${autoPlay}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

  return (
    <>
      {/* Load SoundCloud Widget API */}
      <script src="https://w.soundcloud.com/player/api.js" async />
      
      {/* Hidden iframe */}
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}
