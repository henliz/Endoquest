# 🚀 GitHub Workflow Guide - Adding Audio Files

## The Situation

**Q: If I make this a GitHub repo and edit on GitHub, will you see those edits here?**  
**A: No.** This is a sandboxed environment. Changes you make on GitHub won't automatically sync here.

**Q: Can I upload audio files directly here?**  
**A: No.** This environment doesn't support file uploads, only code.

---

## The Solution: Two-Step Workflow

### Step 1: Export Code from Here → GitHub
1. Copy all code files from this environment
2. Create new GitHub repository
3. Push code to GitHub
4. **Howler.js audio system is already set up!**

### Step 2: Add Audio Files on GitHub
1. Download your MP3 files locally
2. In your GitHub repo, create `/public/audio/` folder
3. Upload `vn-ambient.mp3` and `combat-theme.mp3`
4. Commit and push
5. Deploy → **Music works!**

---

## Why This Workflow?

### What I CAN do here:
✅ Write all React/TypeScript code  
✅ Install npm packages (Howler.js)  
✅ Set up audio system with placeholders  
✅ Create component architecture  
✅ Debug logic issues  

### What I CAN'T do here:
❌ Access your GitHub repos  
❌ See files you upload elsewhere  
❌ Pull changes from external sources  
❌ Upload binary files (MP3, images, etc.)  

### What YOU CAN do on GitHub:
✅ Add audio/video/image files  
✅ Edit code directly  
✅ Manage version control  
✅ Deploy to production  

---

## Complete Workflow

### Phase 1: Initial Development (Here)
```
[Figma Make Environment]
├── You: "I need audio system"
├── Me: Install Howler.js, write components
└── Result: Code with placeholder paths
```

### Phase 2: Adding Assets (GitHub)
```
[GitHub Repository]
├── You: Upload MP3 files to /public/audio/
├── GitHub: Files now accessible at /audio/*.mp3
└── Result: Code finds files automatically
```

### Phase 3: Future Edits

**Option A: Edit here, then push to GitHub**
- Make code changes here
- Copy updated files to GitHub
- GitHub has latest code + existing audio files

**Option B: Edit directly on GitHub**
- Make changes in GitHub editor
- I won't see them here
- If you need help, copy code back and share with me

**Option C: Local Development**
- Clone GitHub repo to your computer
- Edit in VS Code or other IDE
- Push changes back to GitHub
- Most flexible option

---

## File Structure After Setup

```
your-repo/
├── public/
│   └── audio/
│       ├── vn-ambient.mp3          ← You add this on GitHub
│       ├── combat-theme.mp3        ← You add this on GitHub
│       └── sfx/                    ← Optional sound effects
│           ├── click.mp3
│           └── victory.mp3
├── components/
│   ├── HowlerAudioManager.tsx     ← I already created this
│   ├── TutorialEncounter.tsx      ← I already updated this
│   └── ... (all other components)
├── App.tsx
├── package.json                    ← Includes Howler.js
└── ... (other files)
```

---

## How Files Connect

### In the code (already done):
```typescript
// /components/HowlerAudioManager.tsx
const AUDIO_TRACKS = {
  vn: '/audio/vn-ambient.mp3',        // ← Points to file
  combat: '/audio/combat-theme.mp3',   // ← Points to file
};
```

### When you add files on GitHub:
```
/public/audio/vn-ambient.mp3    ← Code looks here
/public/audio/combat-theme.mp3  ← Code looks here
```

### At runtime (after deploy):
```
User clicks → Howler loads /audio/vn-ambient.mp3 → Music plays ✅
```

---

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Auto-deploys on every push
3. `/public/` folder automatically served
4. Free tier available

### Option 2: Netlify
1. Connect GitHub repo to Netlify
2. Auto-deploys on every push
3. Drag-and-drop for quick uploads
4. Free tier available

### Option 3: GitHub Pages
1. Enable Pages in repo settings
2. Build to `/docs` or `/dist`
3. May need build step for React
4. Free for public repos

### Option 4: Local Testing
1. Clone repo locally
2. `npm install` (installs Howler.js)
3. Add MP3s to `/public/audio/`
4. `npm run dev`
5. Test at localhost:3000

---

## Testing Without Real Files

Want to test the system first?

### Use Temporary URLs:
```typescript
// In HowlerAudioManager.tsx, temporarily change to:
const AUDIO_TRACKS = {
  vn: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d1718372d8.mp3',
  combat: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4e1b364fe8.mp3',
};
```

This lets you test the audio system works before adding your own files.

Then later, switch back to local paths:
```typescript
const AUDIO_TRACKS = {
  vn: '/audio/vn-ambient.mp3',
  combat: '/audio/combat-theme.mp3',
};
```

---

## Troubleshooting

### "I pushed MP3s to GitHub but music doesn't play"

**Check 1:** Are files in `/public/audio/`?
```
✅ /public/audio/vn-ambient.mp3
❌ /audio/vn-ambient.mp3 (wrong location)
❌ /src/audio/vn-ambient.mp3 (wrong location)
```

**Check 2:** Are filenames exact matches?
```
✅ vn-ambient.mp3
❌ vn-Ambient.mp3 (wrong case)
❌ vn ambient.mp3 (space in name)
```

**Check 3:** Did you rebuild/redeploy?
- Some platforms need a rebuild after adding files
- Try re-deploying on Vercel/Netlify

**Check 4:** Check browser console
- Open F12 → Console
- Look for `✅ Loaded: vn` or `⚠️ Failed to load`

---

### "Can I see the files you've created?"

Yes! All code files are already in this environment:

**New files created:**
- `/components/HowlerAudioManager.tsx` - Audio controller
- `/TUTORIAL_MECHANICS_GUIDE.md` - Complete gameplay writeup
- `/AUDIO_SETUP_INSTRUCTIONS.md` - How to add MP3s
- `/README_GITHUB_WORKFLOW.md` - This file

**Modified files:**
- `/components/TutorialEncounter.tsx` - Now uses Howler
- `/components/PokemonStyleCombat.tsx` - Phase 2 transition fixed

You can view any file using the file browser or by asking me to show specific ones.

---

## Quick Start Commands

### Create GitHub Repo:
```bash
git init
git add .
git commit -m "Initial commit - EndoQuest tutorial"
git remote add origin https://github.com/YOUR_USERNAME/endoquest.git
git push -u origin main
```

### Add Audio Files:
```bash
# In your local clone
mkdir -p public/audio
# Copy your MP3 files to public/audio/
git add public/audio/
git commit -m "Add background music"
git push
```

### Install Dependencies:
```bash
npm install
# This installs Howler.js and all other packages
```

### Run Locally:
```bash
npm run dev
# Open browser to localhost:3000
# Click anywhere to unlock audio
```

---

## Communication Flow

### If you make changes on GitHub:

**To get my help:**
1. Copy the problematic code
2. Paste it in chat
3. Describe the issue
4. I'll help debug

**To sync back here:**
- You can't sync automatically
- But you can paste code for me to see
- I can suggest fixes
- You apply them on GitHub

### If I make changes here:

**To get them to GitHub:**
1. I'll tell you which files changed
2. Copy updated file contents
3. Paste into GitHub editor
4. Commit changes

**Or export everything:**
1. Download all files from here
2. Replace in your GitHub repo
3. Commit and push

---

## Best Practices

### For Active Development:
1. **Work here first** (rapid prototyping)
2. **Test in GitHub** (with real assets)
3. **Iterate** (copy changes back and forth)

### For Adding Assets:
1. **Use GitHub** (images, audio, video)
2. **Use placeholders here** (for testing)
3. **Swap in real files** (when deploying)

### For Deployment:
1. **Keep GitHub as source of truth**
2. **Auto-deploy from GitHub** (Vercel/Netlify)
3. **Test locally first** (before pushing)

---

## Summary

### What's Already Done ✅
- ✅ Howler.js installed (in code)
- ✅ HowlerAudioManager component created
- ✅ TutorialEncounter updated to use it
- ✅ Placeholder paths configured
- ✅ Auto-unlock on user interaction
- ✅ Crossfading between tracks
- ✅ Music toggle button integrated

### What You Need to Do ⏳
1. ⏳ Export code to GitHub
2. ⏳ Download/create MP3 files
3. ⏳ Upload to `/public/audio/` on GitHub
4. ⏳ Deploy to Vercel/Netlify
5. ⏳ Test in browser
6. 🎵 **Music works!**

---

## Next Steps

1. **Create GitHub repo** (if you haven't)
2. **Copy all code files** from here to there
3. **Download Curse of Strahd MP3s** (or other music)
4. **Rename them:**
   - `vn-ambient.mp3`
   - `combat-theme.mp3`
5. **Upload to `/public/audio/`** in your repo
6. **Deploy** to Vercel (easiest option)
7. **Test** - Click page, music should play!

---

**Questions?** Ask me anything! I can help with:
- Debugging code issues
- Explaining how files connect
- Suggesting alternative approaches
- Writing additional features

**Want me to show you a specific file?** Just ask!
