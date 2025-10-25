import { useState } from "react";
import { VNScene } from "./VNScene";
import { AITextInputScene } from "./AITextInputScene";
import { EnhancedCombatV3 } from "./EnhancedCombatV3";
import { PostCombatScene } from "./PostCombatScene";
import { SocialEncounter } from "./SocialEncounter";

type Phase =
  | "chapter1_morning"
  | "chapter1_purpose"
  | "chapter1_banter"
  | "chapter1_travel_vn"
  | "chapter1_introspection"
  | "chapter1_ache_comment"
  | "chapter1_pre_encounter"
  | "chapter1_meet_weaver"
  | "chapter1_social_intro"
  | "chapter1_social_rounds"
  | "chapter1_breakdown_vn"
  | "chapter1_combat_1"
  | "chapter1_mid_ai"
  | "chapter1_combat_2"
  | "chapter1_victory_vn"
  | "chapter1_reflection_ai"
  | "chapter1_post_combat"
  | "chapter1_end_vn"
  | "chapter1_end_card";

const ARCHIVIST_PORTRAITS = [
  '/assets/Archivist_Sprite1.png',
];
const PASS_BACKGROUND =
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop"; // placeholder
const WEB_ENEMY_GIF =
  "https://media.tenor.com/images/e6f7a3a3f8.gif"; // placeholder if you want a moving sprite

export function ChapterOneEncounter({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("chapter1_morning");
  const [flare, setFlare] = useState(55);
  const [clarity, setClarity] = useState(55);
  const [enemyHealth, setEnemyHealth] = useState(100);

  // store AI exchanges for your benefits/guide pipeline
  const [aiLog, setAiLog] = useState<
    Array<{ sceneId: string; userInput: string; aiResponse: string }>
  >([]);

  const next = (p: Phase) => setPhase(p);
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  // ---- PHASES ----
  switch (phase) {
    // ACT I — setup
    case "chapter1_morning":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="Narration"
          text="Dawn redraws the Foglands. The Archivist adjusts his satchel; the Ache hums a low reassurance. The Lumen Archives wait beyond the Woven Pass."
          onContinue={() => next("chapter1_purpose")}
        />
      );

    case "chapter1_purpose":
      return (
        <AITextInputScene
          backgroundImage={PASS_BACKGROUND}
          characterImages={ARCHIVIST_PORTRAITS}
          characterName="The Archivist"
          promptText="For the record—and for you—why do you seek the Archives?"
          placeholder="Share your purpose. (This will personalize later scenes.)"
          sceneId="doubt_intro_1"
          onAdvance={(userInput, aiResponse) => {
            setAiLog((L) => [...L, { sceneId: "doubt_intro_1", userInput, aiResponse }]);
            next("chapter1_banter");
          }}
        />
      );

    case "chapter1_banter":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterImages={ARCHIVIST_PORTRAITS}
          characterName="The Ache"
          text="I hear threads plucking. Like someone tuning a web to the pitch of doubt."
          onContinue={() => next("chapter1_travel_vn")}
        />
      );

    // ACT II — travel
    case "chapter1_travel_vn":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterImages={ARCHIVIST_PORTRAITS}
          characterName="Narration"
          text="The Woven Pass narrows. Filaments drift like spider-silk, catching on sleeves, on thoughts."
          onContinue={() => next("chapter1_introspection")}
        />
      );

    case "chapter1_introspection":
      return (
        <AITextInputScene
          backgroundImage={PASS_BACKGROUND}
          characterName="The Archivist"
          promptText="Recall a time you weren’t believed. What was said? What lingered after?"
          placeholder="Describe the moment and phrases."
          sceneId="doubt_intro_2"
          onAdvance={(userInput, aiResponse) => {
            setAiLog((L) => [...L, { sceneId: "doubt_intro_2", userInput, aiResponse }]);
            next("chapter1_ache_comment");
          }}
        />
      );

    case "chapter1_ache_comment":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="The Ache"
          text="Those words bruise. I remember them too."
          onContinue={() => next("chapter1_pre_encounter")}
        />
      );

    case "chapter1_pre_encounter":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="Narration"
          text="Footsteps arrive half a beat after yours. A figure hangs in the web ahead—cocooned but awake."
          onContinue={() => next("chapter1_meet_weaver")}
        />
      );

    // ACT III — meet the Weaver + social duel
    case "chapter1_meet_weaver":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="???"
          text="Traveler. Archivist. Symptom. Which of you speaks for truth?"
          onContinue={() => next("chapter1_social_intro")}
        />
      );

    case "chapter1_social_intro":
      return (
        <AITextInputScene
          backgroundImage={PASS_BACKGROUND}
          characterName="???"
          promptText="Memory is unreliable, pain theatrical. How can you trust a story your body tells?"
          placeholder="Answer in your own words."
          sceneId="doubt_social_1"
          onAdvance={(userInput, aiResponse) => {
            setAiLog((L) => [...L, { sceneId: "doubt_social_1", userInput, aiResponse }]);
            next("chapter1_social_rounds");
          }}
        />
      );

    case "chapter1_social_rounds":
      return (
        <SocialEncounter
          startClarity={clarity}
          startFlare={flare}
          rounds={4}
          clarityThreshold={40}
          onComplete={(res) => {
            setClarity(res.finalClarity);
            setFlare(res.finalFlare);
            next("chapter1_breakdown_vn");
          }}
        />
      );

    case "chapter1_breakdown_vn":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="Narration"
          text="The web vibrates to a breaking pitch. The figure’s politeness tears; shadows split from your outline."
          onContinue={() => {
            setEnemyHealth(100);
            next("chapter1_combat_1");
          }}
        />
      );

    // ACT IV — combat 1
    case "chapter1_combat_1":
      return (
        <EnhancedCombatV3
          enemyName="The Doubt Weaver"
          enemyImage={WEB_ENEMY_GIF}
          playerFlare={flare}
          playerClarity={clarity}
          enemyHealth={enemyHealth}
          onActionSelect={(actionStr) => {
            // parse "ACTION:damage:flareDelta:clarityDelta" (same pattern as tutorial)
            const [tag, d = "0", f = "0", c = "0"] = actionStr.split(":");
            const dmg = parseInt(d) || 0;
            const dFlare = parseInt(f) || 0;
            const dClarity = parseInt(c) || 0;

            setEnemyHealth((hp) => Math.max(0, hp - dmg));
            setFlare((x) => clamp(x + dFlare));
            setClarity((x) => clamp(x + dClarity));
          }}
          onMiniChoice={() => {}}
          onCombatEnd={() => next("chapter1_mid_ai")}
          phase2={false}
        />
      );

    // ACT V — interlude AI + combat 2
    case "chapter1_mid_ai":
      return (
        <AITextInputScene
          backgroundImage={PASS_BACKGROUND}
          characterName="The Archivist"
          promptText="What words still echo when you were dismissed or minimized?"
          placeholder="List or describe the exact phrasing."
          sceneId="doubt_mid_1"
          onAdvance={(userInput, aiResponse) => {
            setAiLog((L) => [...L, { sceneId: "doubt_mid_1", userInput, aiResponse }]);
            setEnemyHealth(90);
            next("chapter1_combat_2");
          }}
        />
      );

    case "chapter1_combat_2":
      return (
        <EnhancedCombatV3
          enemyName="Echo of Gaslight"
          enemyImage={WEB_ENEMY_GIF}
          playerFlare={flare}
          playerClarity={clarity}
          enemyHealth={enemyHealth}
          onActionSelect={(actionStr) => {
            const [tag, d = "0", f = "0", c = "0"] = actionStr.split(":");
            const dmg = parseInt(d) || 0;
            const dFlare = parseInt(f) || 0;
            const dClarity = parseInt(c) || 0;

            // Optional twist: calm multiplies damage a bit
            const calmMultiplier = clarity >= 60 ? 1.2 : 1.0;

            setEnemyHealth((hp) => Math.max(0, hp - Math.round(dmg * calmMultiplier)));
            setFlare((x) => clamp(x + dFlare));
            setClarity((x) => clamp(x + dClarity));
          }}
          onMiniChoice={() => {}}
          onCombatEnd={() => next("chapter1_victory_vn")}
          phase2
        />
      );

    // ACT VI — resolution
    case "chapter1_victory_vn":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="Narration"
          text="Threads slacken into silk. The Weaver’s outline unspools; what remains is your voice, steady."
          onContinue={() => next("chapter1_reflection_ai")}
        />
      );

    case "chapter1_reflection_ai":
      return (
        <AITextInputScene
        backgroundImage={PASS_BACKGROUND}
        characterName="The Ache"
        promptText="Name one truth you keep—especially when you’re not believed."
        placeholder="Write it in a sentence."
        sceneId="doubt_outro_1"
        onAdvance={(userInput, aiResponse) => {
          setAiLog((L) => [...L, { sceneId: "doubt_outro_1", userInput, aiResponse }]);
          next("chapter1_post_combat");
        }}
      />
      );

    case "chapter1_post_combat":
      return (
        <PostCombatScene onContinue={() => next("chapter1_end_vn")} />
      );

    case "chapter1_end_vn":
      return (
        <VNScene
          backgroundImage={PASS_BACKGROUND}
          characterName="The Archivist"
          text="Entry logged: Cognitive Parasite #3 — Doubt Weaver. Disarmed through acknowledgment. Ahead: The Flooded Hollow."
          onContinue={() => next("chapter1_end_card")}
        />
      );

    case "chapter1_end_card":
      onComplete(); // return control to App (e.g., go back to Start or Chapter 2 cover)
      return null;
  }
}
