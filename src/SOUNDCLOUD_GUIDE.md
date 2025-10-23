# 🎵 SoundCloud Music Integration Guide

## Current Setup

We're now using **invisible SoundCloud iframes** for background music! This lets you use any SoundCloud track without downloading files.

## How to Add Your Own SoundCloud Tracks

### Step 1: Get the Track URL

1. Go to your SoundCloud track
2. Get the **API URL** from the embed code

**Example:**
```
From: https://soundcloud.com/mmo-kerrhin/1-introduction-curse-of-strahd
To: https://api.soundcloud.com/tracks/1127100127
```

Or use the embed code's URL parameter:
```html
<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1127100127...">
```

### Step 2: Update the Track URLs

Open `/components/TutorialEncounter.tsx` (around line 37-39) and update:

```typescript
const VN_MUSIC_SOUNDCLOUD = 'https://api.soundcloud.com/tracks/YOUR_TRACK_ID';
const COMBAT_MUSIC_SOUNDCLOUD = 'https://api.soundcloud.com/tracks/YOUR_BATTLE_TRACK_ID';
```

### Step 3: Adjust Volume (Optional)

In the same file (around line 330), adjust the volume:

```typescript
<SoundCloudPlayer 
  trackUrl={currentMusicTrack} 
  volume={40}  // 0-100, currently set to 40%
  autoPlay={true}
/>
```

## Current Tracks

**VN Music:** Curse of Strahd - Introduction  
`https://api.soundcloud.com/tracks/1127100127`

**Combat Music:** (Using same track for now - replace with battle theme!)  
`https://api.soundcloud.com/tracks/1127100127`

## Finding SoundCloud Track IDs

### Method 1: From Share → Embed Code
1. Click "Share" on any SoundCloud track
2. Click "Embed"
3. Look for the URL in the iframe src
4. Extract the track ID: `api.soundcloud.com/tracks/TRACK_ID`

### Method 2: From Page Source
1. Right-click the SoundCloud page
2. "View Page Source"
3. Search for `soundcloud://sounds:` 
4. The number after is your track ID

### Method 3: Use SoundCloud API
- Visit: `https://api.soundcloud.com/resolve?url=TRACK_URL&client_id=YOUR_CLIENT_ID`
- Returns the track object with ID

## Recommended Curse of Strahd Tracks

Since you're using that aesthetic, consider these from the same playlist:

1. **Introduction** (current) - Mysterious, perfect for VN
2. **Death House** - Dark, ominous - great for intense VN scenes
3. **Village of Barovia** - Melancholic ambient
4. **Castle Ravenloft** - Epic, gothic - perfect for combat!
5. **Strahd's Theme** - Boss battle vibes

## How It Works

The `SoundCloudPlayer` component:
- Creates an **invisible iframe** (positioned off-screen)
- Loads the SoundCloud Widget API
- Auto-plays when user interacts with page
- Controls volume programmatically
- Switches tracks seamlessly between VN/Combat phases

## Troubleshooting

**Music not playing?**
- User must interact with page first (browser autoplay policy)
- Check console for errors
- Verify track is public on SoundCloud
- Make sure track URL format is correct

**Volume too loud/quiet?**
- Adjust `volume={40}` parameter (0-100)

**Track won't switch?**
- Make sure VN and Combat tracks are different URLs
- Check that phase detection is working

**Embed not loading?**
- SoundCloud may be blocked by ad blockers
- Check network tab for failed requests
- Verify SoundCloud Widget API script loaded
