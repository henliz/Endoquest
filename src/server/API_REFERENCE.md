# EndoQuest Backend API Reference

## Base URL
`http://localhost:3001` (development)

---

## AI Endpoints

### 1. Campfire Chat (Interactive Conversation)

**Endpoint:** `POST /api/ai/campfire-chat`

**Purpose:** Generate a single VN dialogue box response during the campfire conversation scene.

**Request Body:**
```json
{
  "playerId": "string (optional but recommended)",
  "message": "string (required) - Player's typed message",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "response": "string - The Archivist's response (20-80 words)",
  "conversationHistory": [
    // Updated history including this exchange
  ],
  "metadata": {
    "messageCount": 5,
    "arcStage": "exploration", // opening | exploration | closure
    "wordCount": 42,
    "shouldPromptClosure": false
  }
}
```

**Error Response:**
```json
{
  "error": "string - Error description",
  "fallback": "string - In-character fallback dialogue"
}
```

**Usage Example:**
```javascript
const response = await fetch('http://localhost:3001/api/ai/campfire-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerId: 'player-123',
    message: 'The pain started when I was 15...',
    conversationHistory: []
  })
});

const data = await response.json();
console.log(data.response); // Display in VN dialogue box
```

---

### 2. Generate VN Sequence (Scripted Scenes)

**Endpoint:** `POST /api/ai/generate-vn-sequence`

**Purpose:** Generate VN dialogue for scripted scenes like mid-battle moments or post-combat sequences.

**Request Body:**
```json
{
  "sceneId": "string (required) - Scene identifier",
  "playerData": {
    "combatActions": ["Soothe", "Observe", "Resist"],
    "vnChoices": { "healers": "dismissed" },
    "flare": 45,
    "clarity": 72
  }
}
```

**Valid Scene IDs:**
- `tutorial_intro` - First meeting with Archivist
- `mid_battle_vn` - Halfway through combat
- `post_combat_dialogue` - Six-box sequence after victory

**Response:**
```json
{
  "sceneId": "mid_battle_vn",
  "dialogue": "string - Generated dialogue (incorporates player data)",
  "outputFormat": "string - Description of expected format",
  "generatedAt": "2025-10-23T12:34:56.789Z"
}
```

**Usage Example:**
```javascript
const response = await fetch('http://localhost:3001/api/ai/generate-vn-sequence', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sceneId: 'mid_battle_vn',
    playerData: {
      combatActions: ['Soothe', 'Observe', 'Soothe'],
      flare: 42,
      clarity: 68
    }
  })
});

const data = await response.json();
// Display data.dialogue in VN scene
```

---

### 3. Generate Diagnostic Report

**Endpoint:** `POST /api/ai/generate-report`

**Purpose:** Generate one of the three diagnostic chronicles (300-400 word narrative documents).

**Request Body:**
```json
{
  "playerId": "string (optional)",
  "reportType": "string (required) - physical | emotional | pattern",
  "conversationHistory": [
    // Campfire conversation history
  ],
  "combatData": {
    "actionsChosen": ["Soothe", "Observe", "Probe", "Resist"],
    "finalStats": { "flare": 40, "clarity": 75 },
    "vnChoices": { "healers": "dismissed", "onset": "early" }
  }
}
```

**Report Types:**
- `physical` - Physical Chronicle (bodily symptoms, pain patterns)
- `emotional` - Emotional Tapestry (emotional journey, coping)
- `pattern` - Pattern Recognition (cycles, triggers, insights)

**Response:**
```json
{
  "reportType": "physical",
  "reportName": "Physical Chronicle",
  "report": "string - 300-400 word narrative in Archivist's voice",
  "generatedAt": "2025-10-23T12:34:56.789Z",
  "wordCount": 387,
  "expectedLength": "3-4 paragraphs (300-400 words)"
}
```

**Usage Example:**
```javascript
const response = await fetch('http://localhost:3001/api/ai/generate-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerId: 'player-123',
    reportType: 'physical',
    conversationHistory: campfireHistory,
    combatData: { /* ... */ }
  })
});

const data = await response.json();
// Display data.report as a readable document
```

---

### 4. Get Campfire Conversation History

**Endpoint:** `GET /api/ai/campfire-conversation/:playerId`

**Purpose:** Retrieve stored conversation history for a player.

**Response:**
```json
{
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "messageCount": 8
}
```

---

### 5. Clear Campfire Conversation

**Endpoint:** `DELETE /api/ai/campfire-conversation/:playerId`

**Purpose:** Clear stored conversation history (useful for testing or new encounters).

**Response:**
```json
{
  "message": "Campfire conversation cleared"
}
```

---

## Player Data Endpoints

### 1. Save Player Data

**Endpoint:** `POST /api/player/save`

**Purpose:** Save combat choices and diagnostic responses.

**Request Body:**
```json
{
  "playerId": "string (required)",
  "data": {
    "combatChoice": {
      "action": "Soothe",
      "enemy": "The Ache Beneath",
      "result": "success"
    },
    "diagnosticResponses": {
      "painLocation": "lower abdomen",
      "onset": "early",
      "healersResponse": "dismissed"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Player data saved",
  "profile": {
    "playerId": "player-123",
    "createdAt": "2025-10-23T12:00:00.000Z",
    "updatedAt": "2025-10-23T12:34:56.789Z",
    "combatHistory": [ /* ... */ ],
    "diagnosticResponses": { /* ... */ }
  }
}
```

---

### 2. Get Player Profile

**Endpoint:** `GET /api/player/:playerId`

**Response:**
```json
{
  "profile": {
    "playerId": "player-123",
    "createdAt": "2025-10-23T12:00:00.000Z",
    "combatHistory": [],
    "diagnosticResponses": {},
    "reports": {}
  }
}
```

---

### 3. Save Report

**Endpoint:** `POST /api/player/:playerId/report`

**Request Body:**
```json
{
  "reportType": "physical",
  "report": "string - Full report content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report saved",
  "report": {
    "content": "...",
    "generatedAt": "2025-10-23T12:34:56.789Z"
  }
}
```

---

### 4. Get All Reports

**Endpoint:** `GET /api/player/:playerId/reports`

**Response:**
```json
{
  "reports": {
    "physical": {
      "content": "...",
      "generatedAt": "2025-10-23T12:30:00.000Z"
    },
    "emotional": {
      "content": "...",
      "generatedAt": "2025-10-23T12:35:00.000Z"
    }
  }
}
```

---

## Health Check

**Endpoint:** `GET /health`

**Purpose:** Verify server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "EndoQuest backend is running"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (missing/invalid parameters)
- `404` - Not found (invalid player ID, etc.)
- `500` - Server error

Error response format:
```json
{
  "error": "Error description",
  "fallback": "In-character fallback text (for AI endpoints)"
}
```

---

## CORS Configuration

The backend accepts requests from:
- `http://localhost:5173` (default Vite dev server)
- Configurable via `FRONTEND_URL` in `.env`

---

## Rate Limiting

**Current:** None (development)
**Production TODO:** Implement rate limiting to prevent API abuse

---

## Data Storage

**Current:** In-memory Map objects (data lost on server restart)
**Production TODO:** Migrate to database (PostgreSQL recommended)

---

## OpenAI Configuration

**Model:** `gpt-4o-mini` (cost-effective, fast)
**Upgrade option:** `gpt-4o` for higher quality responses

**Token limits:**
- Campfire chat: 150 tokens (~20-80 words)
- VN sequences: 150-600 tokens depending on scene
- Reports: 700 tokens (~300-400 words)

**Cost estimate:** ~$0.01 per full playthrough with gpt-4o-mini
