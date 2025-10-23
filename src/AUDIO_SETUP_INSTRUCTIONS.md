# 🔊 Audio Setup Instructions

## ✅ Howler.js is now installed and configured!

The audio system is ready to use. You just need to add your MP3 files.

---

## 📁 Where to put audio files

Create this folder structure in your GitHub repo:

```
/public/
  /audio/
    vn-ambient.mp3        ← Gothic ambient music for VN scenes
    combat-theme.mp3      ← Epic battle music for combat
```

---

## 🎵 Required Files

### 1. `vn-ambient.mp3`
**Used for:** Visual novel scenes, dialogue, story moments  
**Mood:** Gothic, atmospheric, contemplative  
**Reference:** Curse of Strahd - Introduction  
**Length:** 2-5 minutes (loops automatically)

**Recommended sources:**
- Download from SoundCloud: https://sclouddownloader.net/
- Incompetech: https://incompetech.com/ (Gothic/Dark category)
- Pixabay: https://pixabay.com/music/ (Ambient/Cinematic)

---

### 2. `combat-theme.mp3`
**Used for:** Turn-based combat encounters  
**Mood:** Tense, epic, battle-ready  
**Reference:** Boss battle music, tactical RPG themes  
**Length:** 2-5 minutes (loops automatically)

**Recommended sources:**
- Curse of Strahd Soundtrack (Castle Ravenloft track)
- Undertale - Battle Against a True Hero
- Celeste - Resurrections
- Purple Planet Music: https://www.purple-planet.com/

---

## 🎼 Optional: Sound Effects

If you want click sounds, victory fanfares, etc., create:

```
/public/
  /audio/
    /sfx/
      click.mp3
      victory.mp3
      damage.mp3
      heal.mp3
```

Then use in code:
```typescript
import { playSoundEffect } from './components/HowlerAudioManager';

// Play a sound effect
playSoundEffect('/audio/sfx/click.mp3', 0.5);
```

---

## 🛠️ How to Add Files to GitHub

### Method 1: GitHub Web Interface
1. Go to your repo on github.com
2. Click "Add file" → "Upload files"
3. Create `/public/audio/` folder
4. Drag and drop your MP3 files
5. Commit changes

### Method 2: Command Line
```bash
# In your local repo
mkdir -p public/audio
# Add your MP3 files to public/audio/
git add public/audio/
git commit -m "Add background music"
git push
```

---

## 🎮 How It Works

### Automatic Features:
✅ **Auto-detects user interaction** - No manual "Click to play" needed  
✅ **Crossfades between tracks** - Smooth 1.5s transition VN ↔ Combat  
✅ **Loops automatically** - Music repeats seamlessly  
✅ **Mobile-friendly** - Works on iOS/Android  
✅ **Handles autoplay policies** - Plays after first click/tap  

### Current Configuration:
- **Volume:** 40% (adjustable via Music Toggle button)
- **Fade time:** 1.5 seconds
- **Format:** MP3 (also supports OGG, WAV, M4A)

---

## 🔧 Customization

### Change volume:
In `/components/TutorialEncounter.tsx`:
```typescript
<HowlerAudioManager 
  track={currentTrack}
  volume={0.4}  // 0.0 to 1.0 (currently 40%)
  enabled={musicEnabled}
/>
```

### Change audio files:
In `/components/HowlerAudioManager.tsx`:
```typescript
const AUDIO_TRACKS = {
  vn: '/audio/vn-ambient.mp3',       // ← Change this path
  combat: '/audio/combat-theme.mp3', // ← Or this one
};
```

### Add more tracks:
```typescript
const AUDIO_TRACKS = {
  vn: '/audio/vn-ambient.mp3',
  combat: '/audio/combat-theme.mp3',
  boss: '/audio/boss-battle.mp3',     // New track
  victory: '/audio/victory.mp3',      // Another one
};

// Then use in component:
<HowlerAudioManager track="boss" volume={0.5} enabled={true} />
```

---

## 🐛 Troubleshooting

### Music not playing?

**Check 1:** Are files in the right place?
```
/public/audio/vn-ambient.mp3  ← Must be exactly this path
/public/audio/combat-theme.mp3
```

**Check 2:** Open browser console (F12)
- Look for: `✅ Loaded: vn` or `✅ Loaded: combat`
- If you see `⚠️ Failed to load`, path is wrong

**Check 3:** Did you click/tap the page?
- Music only starts after user interaction (browser policy)
- First click/tap anywhere unlocks audio

**Check 4:** Is Music Toggle enabled?
- Top-right corner has 🔊 button
- Click to enable if it's muted

**Check 5:** Check browser console for errors
```javascript
// Run in browser console to test:
new Audio('/audio/vn-ambient.mp3').play()
  .then(() => console.log('✅ File found'))
  .catch(err => console.log('❌ File missing:', err))
```

---

### Files not found after upload?

**If using a build tool (Vite, Next.js, etc.):**
- Files in `/public/` are served at root URL
- Access as `/audio/file.mp3` NOT `/public/audio/file.mp3`

**If deploying to GitHub Pages:**
- May need to adjust base URL
- Try `/repo-name/audio/file.mp3` instead

**If using Figma Make:**
- This environment might not support /public/ folder
- May need to use external URLs instead:
  ```typescript
  const AUDIO_TRACKS = {
    vn: 'https://example.com/vn-ambient.mp3',
    combat: 'https://example.com/combat-theme.mp3',
  };
  ```

---

## 📊 File Size Recommendations

**Optimal MP3 settings:**
- **Bitrate:** 128-192 kbps (good quality, reasonable size)
- **Sample rate:** 44.1 kHz
- **Channels:** Stereo
- **File size:** 2-5 MB per track (for 2-3 min loop)

**Too big?** Use online converter:
- https://www.freeconvert.com/mp3-compressor
- https://www.mp3smaller.com/

---

## 🎤 Where to Get Music

### Free (No Attribution Required):
- **Pixabay Music** - https://pixabay.com/music/
- **YouTube Audio Library** - https://www.youtube.com/audiolibrary

### Free (Attribution Required):
- **Incompetech** - https://incompetech.com/
- **Purple Planet** - https://www.purple-planet.com/
- **Bensound** - https://www.bensound.com/

### AI Generated:
- **Soundraw** - https://soundraw.io/
- **AIVA** - https://www.aiva.ai/
- **Mubert** - https://mubert.com/

### Download from SoundCloud:
- **SCDownloader** - https://sclouddownloader.net/
- Paste your Curse of Strahd link
- Download as MP3
- Upload to `/public/audio/`

---

## ✅ Quick Start Checklist

1. ✅ Install Howler.js → **DONE** (already in code)
2. ⏳ Download 2 MP3 files (VN + Combat music)
3. ⏳ Create `/public/audio/` folder in your repo
4. ⏳ Upload `vn-ambient.mp3` and `combat-theme.mp3`
5. ⏳ Push to GitHub
6. ⏳ Deploy and test
7. ⏳ Click anywhere on page to unlock audio
8. 🎵 Music should play automatically!

---

## 🎛️ Advanced: Dynamic Volume

If you want volume to change based on game state:

```typescript
// In TutorialEncounter.tsx
const volumeLevel = state.flare > 80 ? 0.6 : 0.4; // Louder when pain is high

<HowlerAudioManager 
  track={currentTrack}
  volume={volumeLevel}
  enabled={musicEnabled}
/>
```

---

## 🎮 Testing Without Files

Want to test the system before adding real music?

**Option 1:** Use placeholder URLs
```typescript
const AUDIO_TRACKS = {
  vn: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d1718372d8.mp3',
  combat: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4e1b364fe8.mp3',
};
```

**Option 2:** Use silence
```typescript
const AUDIO_TRACKS = {
  vn: 'data:audio/mp3;base64,//uQx...',  // Silent MP3
  combat: 'data:audio/mp3;base64,//uQx...',
};
```

---

**That's it!** The code is ready. Just add your MP3 files and you're done. 🎵

Check browser console for debug messages:
- `🔊 Audio unlocked by user interaction`
- `✅ Loaded: vn`
- `✅ Loaded: combat`
- `🎵 Switching to: combat`
