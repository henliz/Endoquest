import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { VNScene } from './VNScene';
import { VNChoiceScene } from './VNChoiceScene';

const ACHE_SPRITE = 'https://64.media.tumblr.com/fc625f90f9b7b9e44ceeaac71d2a47e4/fa9909d69395c71f-fc/s1280x1920/9a9766b6dc616f22000a8f4f85f35f2f6d7c4d3e.png';
const CAMPFIRE_BG = 'https://i.pinimg.com/736x/60/fe/74/60fe7447268dda76b8202f15b70f9f2b.jpg';

interface AcheDialogueProps {
  onMenuChoice: (choice: 'healers_chronicle' | 'wayside_comforts' | 'guild_restoration') => void;
  onClose: () => void;
  hasMetBefore: boolean;
  onMarkAsMet: () => void;
}

type DialogueStep = 
  | 'player_surprised'
  | 'ache_responds'
  | 'player_question_why'
  | 'ache_explain_heard'
  | 'ache_explain_screaming'
  | 'player_realize'
  | 'ache_always_there'
  | 'player_apologize_choice'
  | 'ache_accept_apology'
  | 'ache_no_apology_needed'
  | 'ache_together'
  | 'player_together_accept'
  | 'ache_offer_help'
  | 'menu';

export function AcheDialogue({ onMenuChoice, onClose, hasMetBefore, onMarkAsMet }: AcheDialogueProps) {
  const [step, setStep] = useState<DialogueStep>(hasMetBefore ? 'menu' : 'player_surprised');
  const [playerApologized, setPlayerApologized] = useState(false);

  const handleContinue = () => {
    if (step === 'player_surprised') {
      setStep('ache_responds');
    } else if (step === 'ache_responds') {
      setStep('player_question_why');
    } else if (step === 'player_question_why') {
      setStep('ache_explain_heard');
    } else if (step === 'ache_explain_heard') {
      setStep('ache_explain_screaming');
    } else if (step === 'ache_explain_screaming') {
      setStep('player_realize');
    } else if (step === 'player_realize') {
      setStep('ache_always_there');
    } else if (step === 'ache_always_there') {
      setStep('player_apologize_choice');
    } else if (step === 'ache_accept_apology') {
      setStep('ache_together');
    } else if (step === 'ache_no_apology_needed') {
      setStep('ache_together');
    } else if (step === 'ache_together') {
      setStep('player_together_accept');
    } else if (step === 'player_together_accept') {
      setStep('ache_offer_help');
    } else if (step === 'ache_offer_help') {
      onMarkAsMet();
      setStep('menu');
    }
  };

  const handleChoice = (choiceId: string) => {
    if (step === 'player_apologize_choice') {
      if (choiceId === 'apologize') {
        setPlayerApologized(true);
        setStep('ache_accept_apology');
      } else if (choiceId === 'thank') {
        setPlayerApologized(false);
        setStep('ache_no_apology_needed');
      }
    } else if (step === 'menu') {
      if (choiceId === 'healers_chronicle') {
        onMenuChoice('healers_chronicle');
      } else if (choiceId === 'wayside_comforts') {
        onMenuChoice('wayside_comforts');
      } else if (choiceId === 'guild_restoration') {
        onMenuChoice('guild_restoration');
      } else if (choiceId === 'nothing') {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'player_surprised' && (
        <VNScene
          key="player_surprised"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="You"
          text="You... you look so different now. What happened to you?"
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_responds' && (
        <VNScene
          key="ache_responds"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="I was always like this. You just couldn't see me before. When I was screaming, when I was burning... you couldn't look at me. You could only feel me."
          onContinue={handleContinue}
        />
      )}

      {step === 'player_question_why' && (
        <VNScene
          key="player_question_why"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="You"
          text="Why were you fighting me? All that pain, those attacks... the gaslighting, the phantom throbs..."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_explain_heard' && (
        <VNScene
          key="ache_explain_heard"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="I wasn't fighting you. I was trying to be heard. Every time you ignored me, every time you pushed through... I had to get louder."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_explain_screaming' && (
        <VNScene
          key="ache_explain_screaming"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="When a whisper doesn't work, you scream. When screaming doesn't work, you become a storm. I didn't want to hurt you. I AM you. But you wouldn't listen any other way."
          onContinue={handleContinue}
        />
      )}

      {step === 'player_realize' && (
        <VNScene
          key="player_realize"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="You"
          text="You're... the part of me that knew something was wrong. The part that tried to warn me."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_always_there' && (
        <VNScene
          key="ache_always_there"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="I'm the memory keeper. The one who remembers every cycle, every cramp, every moment you were told it was normal. I carry all of it so you don't have to carry it alone."
          onContinue={handleContinue}
        />
      )}

      {step === 'player_apologize_choice' && (
        <VNChoiceScene
          key="player_apologize_choice"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="You"
          text="I..."
          choices={[
            {
              id: 'apologize',
              text: "I'm sorry I didn't listen to you sooner.",
              emotion: 'Remorseful'
            },
            {
              id: 'thank',
              text: "Thank you for not giving up on me.",
              emotion: 'Grateful'
            }
          ]}
          onChoiceSelect={handleChoice}
        />
      )}

      {step === 'ache_accept_apology' && (
        <VNScene
          key="ache_accept_apology"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="There's nothing to forgive. You were doing what you were taught to do—push through, be strong, don't complain. But you're listening now. That's what matters."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_no_apology_needed' && (
        <VNScene
          key="ache_no_apology_needed"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="I never gave up because I couldn't. I'm part of you. When you hurt, I hurt. When you heal, I heal. We're not separate—we never were."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_together' && (
        <VNScene
          key="ache_together"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="We can work together now. I don't have to scream anymore. You can ask me what you need, and I'll help you find the answers."
          onContinue={handleContinue}
        />
      )}

      {step === 'player_together_accept' && (
        <VNScene
          key="player_together_accept"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="You"
          text="Together. I... I think I'm ready for that."
          onContinue={handleContinue}
        />
      )}

      {step === 'ache_offer_help' && (
        <VNScene
          key="ache_offer_help"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="Good. Then let me help you. I've been keeping track of everything—every pattern, every symptom, every moment. I can share it with you, with healers, with anyone who can help us both."
          onContinue={handleContinue}
        />
      )}

      {step === 'menu' && (
        <VNChoiceScene
          key="menu"
          backgroundImage={CAMPFIRE_BG}
          characterImage={ACHE_SPRITE}
          characterName="The Ache"
          text="What do you need from me?"
          choices={[
            {
              id: 'healers_chronicle',
              text: "The Healer's Chronicle - A scroll for physicians",
              emotion: 'Seeking Guidance'
            },
            {
              id: 'wayside_comforts',
              text: "Wayside Comforts - Gentle remedies for home",
              emotion: 'Seeking Relief'
            },
            {
              id: 'guild_restoration',
              text: "Guild of Restoration - Find healers and support",
              emotion: 'Seeking Help'
            },
            {
              id: 'nothing',
              text: "Nothing right now... but thank you.",
              emotion: 'Peaceful'
            }
          ]}
          onChoiceSelect={handleChoice}
        />
      )}
    </AnimatePresence>
  );
}
