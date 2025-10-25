# src/components/server/benefits/storyagent.py
from __future__ import annotations

import os
import json
import pathlib
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel
from dotenv import load_dotenv

# ────────────────────────────────────────────────────────────────────────────────
# Environment / Paths
# ────────────────────────────────────────────────────────────────────────────────
ROOT = pathlib.Path(".").resolve()
SERVER_ENV = ROOT / "src" / "server" / ".env"
load_dotenv(SERVER_ENV)  # keeps parity with your TS services

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

try:
    from openai import OpenAI  # Official SDK ≥ 1.0
    _OPENAI = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except Exception:
    _OPENAI = None

BENEFITS_DIR = ROOT / "src" / "server" / "benefits"
BOOKLET_CACHE = BENEFITS_DIR / "booklet_cache.json"
RULESET_JSON = BENEFITS_DIR / "ruleset.json"

# ────────────────────────────────────────────────────────────────────────────────
# Models (request/response shapes that match your frontend)
# ────────────────────────────────────────────────────────────────────────────────
class PlayerData(BaseModel):
    combatActions: Optional[List[str]] = None
    flare: Optional[int] = None
    clarity: Optional[int] = None
    turnCount: Optional[int] = None

class ScenePayload(BaseModel):
    sceneId: str
    userInput: str
    playerId: Optional[str] = None
    playerData: Optional[PlayerData] = None
    conversationHistory: Optional[List[Dict[str, str]]] = None  # [{role, content}]

class GuidePayload(BaseModel):
    text: str
    planHint: Optional[str] = None
    maxItems: int = 3

# ────────────────────────────────────────────────────────────────────────────────
# In-memory “campfire” conversation store (optional, mirrors your Node route)
# ────────────────────────────────────────────────────────────────────────────────
class AgentMemory:
    def __init__(self) -> None:
        self._convos: Dict[str, List[Dict[str, str]]] = {}
        self._counts: Dict[str, int] = {}

    def get(self, player_id: str) -> List[Dict[str, str]]:
        return self._convos.get(player_id, []).copy()

    def set(self, player_id: str, history: List[Dict[str, str]]) -> None:
        self._convos[player_id] = history

    def append(self, player_id: str, msg: Dict[str, str]) -> List[Dict[str, str]]:
        h = self._convos.get(player_id, []).copy()
        h.append(msg)
        self._convos[player_id] = h
        self._counts[player_id] = self._counts.get(player_id, 0) + 1
        return h

    def count(self, player_id: str) -> int:
        return self._counts.get(player_id, 0)

    def clear(self, player_id: str) -> None:
        self._convos.pop(player_id, None)
        self._counts.pop(player_id, None)

# ────────────────────────────────────────────────────────────────────────────────
# Utilities
# ────────────────────────────────────────────────────────────────────────────────
def _safe_read_json(path: pathlib.Path) -> Optional[Dict[str, Any]]:
    try:
        if path.exists():
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None

def _llm(system: str, user: str, temperature: float = 0.3, model: str = "gpt-4o-mini") -> str:
    """LLM wrapper with safe fallback when the API key is missing."""
    if _OPENAI is None:
        # Minimal fallback so dev doesn’t block
        preview = user.strip().replace("\n", " ")
        if len(preview) > 300:
            preview = preview[:300] + "..."
        return f"(offline) {preview}"
    out = _OPENAI.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return out.choices[0].message.content or ""

def _llm_json(system: str, user: str, temperature: float = 0.2, model: str = "gpt-4o-mini") -> Dict[str, Any]:
    """
    Ask for JSON only. NOTE: messages must literally contain the word “json”
    when using response_format: {type: "json_object"} with the new SDK.
    """
    if _OPENAI is None:
        return {}
    out = _OPENAI.chat.completions.create(
        model=model,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system + "\n(Respond with a single JSON object.)"},
            {"role": "user", "content": "JSON task:\n" + user},
        ],
    )
    try:
        return json.loads(out.choices[0].message.content or "{}")
    except Exception:
        return {}

def _arc_stage(turn_count: int) -> str:
    """Optional narrative arc (opening -> exploration -> closure) like your Node route."""
    if turn_count <= 3:
        return "opening"
    if turn_count >= 13:
        return "closure"
    return "exploration"

# ────────────────────────────────────────────────────────────────────────────────
# Core Agent
# ────────────────────────────────────────────────────────────────────────────────
class StoryAgent:
    """
    A single service you can import in FastAPI:
      - scene_response(): VN-style short reply
      - campfire_chat(): rolling conversation with convo array
      - make_benefits_guide(): Guild-of-Restoration style output
    """

    def __init__(self) -> None:
        self.memory = AgentMemory()
        self.booklet_cache = _safe_read_json(BOOKLET_CACHE)
        self.ruleset = _safe_read_json(RULESET_JSON)

    # 1) Visual Novel scene response (short, supportive, 1–3 sentences)
    def scene_response(
        self,
        payload: ScenePayload,
        system_hint: Optional[str] = None,
        model: str = "gpt-4o-mini",
    ) -> Tuple[str, List[Dict[str, str]]]:
        player_id = payload.playerId or "anonymous"
        history = payload.conversationHistory or self.memory.get(player_id)

        sys = system_hint or (
            "You are The Archivist: calm, validating, clear. "
            "Reply in 1–3 concise sentences; be specific and supportive; no markdown."
        )
        user = (
            f"sceneId={payload.sceneId}\n"
            f"playerData={payload.playerData.dict() if payload.playerData else None}\n"
            f"userInput={payload.userInput}"
        )

        # Build convo: optional short system preamble + recent turns
        convo = history[-12:].copy()  # keep it light
        convo.insert(0, {"role": "system", "content": sys})
        convo.append({"role": "user", "content": user})

        # Use a single call (we don’t stream here)
        reply = _llm(sys, user, temperature=0.3, model=model)

        # Update memory (return appended history in same shape the UI expects)
        updated = history + [{"role": "user", "content": payload.userInput},
                             {"role": "assistant", "content": reply}]
        self.memory.set(player_id, updated)

        return reply, updated

    # 2) Campfire-style chat that returns the updated conversation array
    def campfire_chat(
        self,
        player_id: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        model: str = "gpt-4o-mini",
    ) -> List[Dict[str, str]]:
        existing = conversation_history or self.memory.get(player_id)
        turn_count = len([m for m in existing if m.get("role") == "user"]) + 1
        stage = _arc_stage(turn_count)

        sys = (
            "You are The Archivist, a reflective facilitator. "
            "Keep responses under ~120 words, grounded and practical. "
            f"Arc stage: {stage}."
        )
        convo = [{"role": "system", "content": sys}] + existing + [{"role": "user", "content": message}]
        reply = _llm(sys, message, temperature=0.4, model=model)

        updated = existing + [{"role": "user", "content": message},
                              {"role": "assistant", "content": reply}]
        self.memory.set(player_id, updated)
        return updated

    # 3) Benefits guide (Guild-of-Restoration shape)
    def make_benefits_guide(self, payload: GuidePayload) -> Dict[str, Any]:
        # If you want to actually inject plan details, peek at self.ruleset / self.booklet_cache here.
        intro = _llm(
            "Write a short, supportive preface (max 2 sentences), no markdown.",
            f"User: {payload.text}\nPlan hint: {payload.planHint or 'N/A'}",
            temperature=0.2,
        ).strip()

        # Basic items; swap with a ruleset-driven matcher if desired.
        benefits = [
            {
                "priority": 1,
                "title": "Pelvic Floor Physiotherapy",
                "icon": "🔵",
                "coverage": "$500–$1,000/year",
                "why": "Pelvic, lower back, or radiating pain often involves pelvic floor dysfunction.",
                "action": "Book an initial assessment (usually no referral required)."
            },
            {
                "priority": 2,
                "title": "Mental Health Counseling",
                "icon": "🟢",
                "coverage": "$1,000–$5,000/year",
                "why": "Chronic pain and medical trauma benefit from psychological support and advocacy skills.",
                "action": "Search for chronic pain–informed therapists; ask about direct billing."
            },
            {
                "priority": 3,
                "title": "Registered Dietitian",
                "icon": "🟡",
                "coverage": "Plan-dependent",
                "why": "Targeted nutrition can help manage inflammation and energy.",
                "action": "Look for women’s health RDs; ask for a 15-min discovery call."
            },
        ][: max(1, payload.maxItems)]

        # Example: simple enrichment from ruleset terms (totally optional)
        txt = payload.text.lower()
        if self.ruleset and ("massage" in txt or "muscle" in txt or "back" in txt):
            benefits.append({
                "priority": len(benefits) + 1,
                "title": "Registered Massage Therapy",
                "icon": "🔶",
                "coverage": "$300–$800/year",
                "why": "Myofascial tension and pain flares may respond to RMT.",
                "action": "Confirm annual maximum and per-visit limits."
            })

        return {
            "title": "Guild of Restoration",
            "subtitle": "Benefits matched to your needs",
            "intro": intro,
            "benefits": benefits,
            "contact": {
                "insurer": "Sun Life",
                "portal": "mysunlife.ca",
                "phone": "1-800-361-6212"
            },
            "sourceArtifacts": {
                "booklet_cache": bool(self.booklet_cache),
                "ruleset": bool(self.ruleset),
            }
        }
