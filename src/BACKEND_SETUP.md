# EndoQuest Backend Setup

## Overview

This backend server provides AI-powered dialogue for the Archivist and stores player diagnostic data. It uses Express.js with OpenAI's GPT-4 API to generate personalized, empathetic responses.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the **root directory** (not inside `/server`):

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important:** The `.env` file is already in `.gitignore` and will never be committed to Git.

### 3. Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key and paste it into your `.env` file
5. (Optional) Set usage limits in OpenAI dashboard to control costs

**Cost Note:** We're using `gpt-4o-mini` which is very affordable (~$0.15 per million input tokens). A full playthrough costs less than $0.01.

### 4. Run the Backend Server

From the `/server` directory:

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production mode
npm start
```

You should see:
```
🎮 EndoQuest backend running on http://localhost:3001
📡 Accepting requests from: http://localhost:5173
```

### 5. Run the Frontend

In a **separate terminal**, run your React frontend as usual:

```bash
npm run dev  # or however you normally start the frontend
```

## API Endpoints

### Campfire Chat (Interactive Conversation)
**POST** `/api/ai/campfire-chat`
```json
{
  "playerId": "player-123",
  "message": "I've been experiencing pain for years...",
  "conversationHistory": []
}
```

Returns a single VN dialogue box response from the Archivist. This is the ONLY interactive chat endpoint - all other Archivist appearances are scripted VN sequences.

### Scene Response (Text Input with Plot Constraints)
**POST** `/api/ai/scene-response`
```json
{
  "sceneId": "tutorial_intro", // or "mid_battle_vn"
  "userInput": "My pain started when I was 15...",
  "playerData": {
    "combatActions": ["Soothe", "Observe"],
    "flare": 45,
    "clarity": 72
  }
}
```

Generates an AI response that incorporates the player's typed input while hitting mandatory plot beats for that scene. Returns `{ response, shouldAdvance }`.

### Generate VN Sequence (Multi-Box Dialogue)
**POST** `/api/ai/generate-vn-sequence`
```json
{
  "sceneId": "post_combat_dialogue",
  "playerData": {
    "combatActions": ["Soothe", "Observe", "Resist"],
    "vnResponses": { "tutorial_intro": "...", "mid_battle_vn": "..." },
    "flare": 45,
    "clarity": 72
  }
}
```

Generates a multi-box VN dialogue sequence (used for post-combat 6-box scene) that incorporates player journey data.

### Generate Diagnostic Report
**POST** `/api/ai/generate-report`
```json
{
  "playerId": "player-123",
  "reportType": "physical", // or "emotional" or "pattern"
  "conversationHistory": [],
  "combatData": {}
}
```

Generates one of the three diagnostic chronicles (300-400 word narrative documents).

### Save Player Data
**POST** `/api/player/save`
```json
{
  "playerId": "player-123",
  "data": {
    "combatChoice": { "action": "Soothe", "enemy": "The Ache Beneath" },
    "diagnosticResponses": { "painLocation": "lower abdomen" }
  }
}
```

### Get Player Profile
**GET** `/api/player/:playerId`

Returns all stored data for a player.

## Architecture

```
Frontend (React)          Backend (Express)         OpenAI API
     |                           |                       |
     |-- POST /api/ai/chat ----->|                       |
     |                           |-- GPT-4o-mini ------->|
     |                           |<----- Response -------|
     |<--- Archivist reply ------|                       |
```

## Data Storage

Currently uses **in-memory storage** (Map objects). Data is lost when server restarts.

**For production**, you'll want to add a database:
- **SQLite** (simple, file-based)
- **PostgreSQL** (robust, recommended)
- **MongoDB** (document-based)

## Security Notes

✅ **What's Secure:**
- API key stored in `.env` (never committed to Git)
- CORS configured to only accept requests from your frontend
- API key never reaches the browser

⚠️ **Important:**
- This is still a **prototype/demo setup**
- For production, add:
  - Rate limiting (prevent API abuse)
  - User authentication
  - Database with proper backups
  - HTTPS/SSL
  - Better error handling
  - API key rotation

## Troubleshooting

**"Cannot find module 'openai'"**
- Run `npm install` inside the `/server` directory

**"401 Unauthorized" from OpenAI**
- Check that your API key in `.env` is correct
- Verify you have credits in your OpenAI account

**CORS errors**
- Make sure `FRONTEND_URL` in `.env` matches your React dev server URL
- Default is `http://localhost:5173` (Vite's default)

**Server won't start**
- Check if port 3001 is already in use
- Change `PORT` in `.env` to a different port (e.g., 3002)

## Next Steps

To integrate with the frontend:

1. **Create an API client** (`/utils/api.js`)
2. **Add typing interface** to the campfire scene
3. **Call the `/api/ai/chat` endpoint** when player types
4. **Display responses** in the VN dialogue system
5. **Generate reports** using conversation + combat data

Want me to build the frontend integration next?
