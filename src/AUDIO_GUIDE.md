# Audio Integration Guide

## 🎵 Currently Implemented

EndoQuest now has **dynamic music** that changes based on the game state:

- **VN Scenes**: Dark, gothic atmospheric music (Curse of Strahd vibe)
- **Combat Scenes**: Epic battle theme with retro vibes (Undertale/Pokemon style)
- **Smooth Transitions**: Music fades in/out when switching between scenes
- **Music Toggle**: Players can mute/unmute with the speaker icon (top-left)

## How to Change Music

Edit `/components/TutorialEncounter.tsx`:

```tsx
const VN_MUSIC = 'YOUR_VN_MUSIC_URL';
const COMBAT_MUSIC = 'YOUR_COMBAT_MUSIC_URL';
```

## How to Add Sound Effects

### 1. Import the hook:
```tsx
import { useSound } from './AudioManager';
```

### 2. Use in your component:
```tsx
const playClick = useSound('https://example.com/click.mp3');
```

### 3. Trigger on events:
```tsx
<button onClick={() => {
  playClick();
  // ... other logic
}}>
  Click me
</button>
```

## Already Integrated

Sound effect hooks are already set up in:
- `VNChoiceScene.tsx` - for dialogue choice clicks
- Just uncomment the lines and add your audio URLs!

## Audio Format Tips

- Use MP3 or OGG for best browser compatibility
- Keep file sizes small (under 1MB for BGM, under 100KB for SFX)
- Consider using audio hosting services or CDNs for better performance

## Example Audio Sources

- Free music: [Incompetech](https://incompetech.com/)
- Free SFX: [Freesound](https://freesound.org/)
- Royalty-free: [Pixabay Audio](https://pixabay.com/music/)
