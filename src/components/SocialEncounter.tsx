import { useMemo, useState } from "react";

type ChoiceId = "REASSURE" | "DEFLECT" | "DEMAND_PROOF" | "MIRROR_LOGIC";

export interface SocialEncounterResult {
  roundsPlayed: number;
  finalClarity: number;
  finalFlare: number;
  log: Array<{ choice: ChoiceId; clarityDelta: number; flareDelta: number }>;
  success: boolean; // e.g., clarity stayed above threshold
}

export function SocialEncounter({
  startClarity = 55,
  startFlare = 50,
  rounds = 4,
  clarityThreshold = 40,
  onComplete,
}: {
  startClarity?: number;
  startFlare?: number;
  rounds?: number;
  clarityThreshold?: number;
  onComplete: (result: SocialEncounterResult) => void;
}) {
  const [clarity, setClarity] = useState(startClarity);
  const [flare, setFlare] = useState(startFlare);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<SocialEncounterResult["log"]>([]);

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  // Simple, tunable effects; you can make these context-sensitive later.
  const effects = useMemo(
    () => ({
      REASSURE: { clarity: +8, flare: -4, tip: "Affirm your lived experience." },
      DEFLECT: { clarity: -3, flare: -2, tip: "Side-step the trap (short relief)." },
      DEMAND_PROOF: { clarity: -6, flare: +8, tip: "Push back hard. Risky." },
      MIRROR_LOGIC: { clarity: +5, flare: +0, tip: "Reflect their framing back." },
    }),
    []
  );

  function pick(choice: ChoiceId) {
    const delta = effects[choice];
    const nextClarity = clamp(clarity + delta.clarity);
    const nextFlare = clamp(flare + delta.flare);

    setLog((L) => [...L, { choice, clarityDelta: delta.clarity, flareDelta: delta.flare }]);
    setClarity(nextClarity);
    setFlare(nextFlare);

    // End?
    if (round >= rounds) {
      onComplete({
        roundsPlayed: rounds,
        finalClarity: nextClarity,
        finalFlare: nextFlare,
        log: [...log, { choice, clarityDelta: delta.clarity, flareDelta: delta.flare }],
        success: nextClarity >= clarityThreshold,
      });
      return;
    }
    setRound((r) => r + 1);
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Social Encounter · Round {round}/{rounds}</div>
        <div className="flex gap-3 text-sm">
          <span>Clarity: <b>{clarity}</b></span>
          <span>Flare: <b>{flare}</b></span>
        </div>
      </div>

      <p className="text-white/80 text-sm">
        The Doubt Weaver tightens conversational threads. Choose your response:
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["REASSURE", "Reassure"],
            ["DEFLECT", "Deflect"],
            ["DEMAND_PROOF", "Demand Proof"],
            ["MIRROR_LOGIC", "Mirror Logic"],
          ] as Array<[ChoiceId, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            className="px-4 py-3 rounded-lg bg-[#c9a0dc]/20 hover:bg-[#c9a0dc]/30 border border-[#c9a0dc]/40 transition"
            onClick={() => pick(id)}
          >
            <div className="text-left">
              <div className="font-medium">{label}</div>
              <div className="text-xs opacity-75">
                {effects[id].clarity >= 0 ? `+${effects[id].clarity}` : effects[id].clarity} Clarity ·{" "}
                {effects[id].flare >= 0 ? `+${effects[id].flare}` : effects[id].flare} Flare
              </div>
            </div>
          </button>
        ))}
      </div>

      <ul className="text-xs opacity-70 space-y-1">
        {log.slice(-3).map((e, i) => (
          <li key={i}>
            • {e.choice} → Clarity {e.clarityDelta >= 0 ? "+" : ""}{e.clarityDelta}, Flare {e.flareDelta >= 0 ? "+" : ""}{e.flareDelta}
          </li>
        ))}
      </ul>
    </div>
  );
}
