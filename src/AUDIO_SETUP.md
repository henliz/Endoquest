# 🎵 Audio Setup Guide for EndoQuest

## How to Add Your Own Music

### Step 1: Prepare Your Audio Files

**Supported Formats:**
- MP3 (recommended)
- MP4
- OGG
- WAV

**You Need Two Tracks:**
1. **VN Music** - Gothic, ambient, melancholic (for dialogue scenes)
2. **Combat Music** - Epic, energetic battle theme (for combat)

### Step 2: Upload Your Files

Upload your audio files to your project. You have a few options:

**Option A: Local Files**
```
/public/audio/vn-theme.mp3
/public/audio/battle-theme.mp3
```

**Option B: External URLs**
- Upload to a file host (Dropbox, Google Drive, etc.)
- Get the direct download link

### Step 3: Update the Code

Open `/components/TutorialEncounter.tsx` and find these lines (around line 37-46):

```typescript
const VN_MUSIC = 'https://cdn.pixabay.com/...'; 
const COMBAT_MUSIC = 'https://cdn.pixabay.com/...';
```

Replace with your file paths:

```typescript
const VN_MUSIC = '/audio/vn-theme.mp3'; // If using local files
const COMBAT_MUSIC = '/audio/battle-theme.mp3';
```

Or with full URLs:

```typescript
const VN_MUSIC = 'https://your-cdn.com/gothic-ambient.mp3';
const COMBAT_MUSIC = 'https://your-cdn.com/battle-music.mp3';
```

## Current Setup

The game currently uses placeholder music from Pixabay:
- VN: Dark Ambient Mystery
- Combat: Epic Battle Theme

These work, but you'll want to replace them with tracks that match your game's aesthetic.

## Music Behavior

- Music auto-starts after user's first click/tap (browser security requirement)
- Volume is set to 50% by default
- Smooth crossfades between VN ↔ Combat (1.5 second fade)
- Music toggle button in top-left corner

## Troubleshooting

**Music doesn't play?**
- Make sure user has clicked/tapped the screen first
- Check browser console for errors
- Verify file URLs are accessible
- Try using MP3 format (best compatibility)

**Music is too loud/quiet?**
- Edit volume in `TutorialEncounter.tsx` line ~580:
  ```typescript
  <AudioManager bgmUrl={currentMusic} volume={0.5} fadeTime={1500} />
  ```
  Change `volume={0.5}` to 0-1 (0.3 = 30%, 0.8 = 80%, etc.)

**Crossfade is too slow/fast?**
- Change `fadeTime={1500}` (in milliseconds)
- 1000 = 1 second, 2000 = 2 seconds, etc.
