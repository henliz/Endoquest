import { useState } from 'react';
import { EnemyDisplay } from './EnemyDisplay';
import { DialogueBox } from './DialogueBox';
import { ActionMenu } from './ActionMenu';

interface EncounterScreenProps {
  onActionSelect?: (actionId: string) => void;
}

export function EncounterScreen({ onActionSelect }: EncounterScreenProps) {
  const [flare, setFlare] = useState(70);
  const [clarity, setClarity] = useState(50);

  const handleAction = (actionId: string) => {
    console.log('Action selected:', actionId);
    onActionSelect?.(actionId);
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col">
      {/* Top Third - Enemy Display */}
      <EnemyDisplay
        enemyName="The Ache Beneath"
        flareValue={flare}
        clarityValue={clarity}
      />

      {/* Middle Third - Dialogue */}
      <DialogueBox
        characterName="The Archivist"
        text="You carry the Ache, traveler — yet you've no name for it. Tell me — when did it first answer your body's call?"
      />

      {/* Bottom Third - Actions */}
      <div className="flex-1 flex flex-col justify-end">
        <ActionMenu onActionSelect={handleAction} />
      </div>
    </div>
  );
}
