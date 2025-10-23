# Recent Updates - EndoQuest

## ✅ Completed Changes

### 1. **New Archivist Character**
- Updated to the new character image (centered, no borders)
- Character appears full-height in VN scenes
- Smooth fade-in animation on character entrance
- Proper drop-shadow glow effect without boxes

### 2. **Dynamic Music System**
- **VN Scenes**: Dark ambient/gothic music (Curse of Strahd atmosphere)
- **Combat Scenes**: Epic battle music (Undertale/Pokemon vibes)
- Music automatically switches when transitioning between VN ↔ Combat
- Smooth fade transitions between tracks (1.5 second crossfade)

### 3. **Music Controls**
- Volume toggle button (top-left corner)
- Mute/unmute functionality
- Visual feedback (speaker icon changes)

### 4. **Bug Fixes**
- Fixed dialogue choice progression (no more purple screen freeze)
- Proper phase transitions between all story beats
- Cleaned up character positioning and centering

## 🎮 Current Game Flow

1. **Start Screen** → atmospheric title screen
2. **Awakening** → player wakes in the Foglands (VN music starts)
3. **Archivist Introduction** → character appears with dialogue
4. **First Diagnostic Question** → branching dialogue choices
5. **Basin Response** → narrative reaction to player choice
6. **Transition to Combat** → music shifts to battle theme
7. **Combat Phase 1** → turn-based battle (2 turns)
8. **Mid-Battle VN** → returns to VN music, Archivist speaks
9. **Second Diagnostic Question** → medical history choices
10. **Combat Phase 2** → intense battle continuation
11. **Victory VN** → shadow merges, VN music returns
12. **Power Reveal** → unlock Empathic Resonance
13. **Archivist Final** → closing dialogue
14. **Doctor Scroll** → diagnostic report screen

## 🎵 Music Files Being Used

- VN: `https://cdn.pixabay.com/audio/2022/03/15/audio_d1718372d8.mp3`
- Combat: `https://cdn.pixabay.com/audio/2022/03/10/audio_4e1b364fe8.mp3`

These are royalty-free tracks from Pixabay. You can replace them with your own audio URLs.

## 🎨 Visual Novel Features

- Full-screen character portraits (centered)
- Background images with atmospheric overlays
- Typewriter text effect on dialogue
- Smooth transitions between scenes
- Choice prompts with emotional tags
- Phase progress indicator (VN scenes only)

## 🛠️ How to Customize

### Change Music
Edit `/components/TutorialEncounter.tsx`:
```tsx
const VN_MUSIC = 'YOUR_URL_HERE';
const COMBAT_MUSIC = 'YOUR_URL_HERE';
```

### Add Sound Effects
See `/AUDIO_GUIDE.md` for implementation details.

### Adjust Music Volume
In TutorialEncounter.tsx:
```tsx
<AudioManager bgmUrl={currentMusic} volume={0.25} fadeTime={1500} />
//                                    ↑ 0.0-1.0    ↑ ms
```
