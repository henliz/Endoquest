import { motion } from 'motion/react';
import { ArrowLeft, Home, Download } from 'lucide-react';

interface WaysideComfortsProps {
  onBack: () => void;
}

export function WaysideComforts({ onBack }: WaysideComfortsProps) {
  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="p-6 border-b-2 border-[#c9a0dc]/30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-white text-xl">Wayside Comforts</h2>
            <p className="text-white/60 text-sm">At-home pain management & self-care</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="text-white/90 space-y-6 font-serif">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl mb-2">🌙 YOUR JOURNEY THROUGH THE FOGLANDS</h3>
              <p className="text-white/70 text-sm">A Personal Summary</p>
            </div>

            {/* Opening */}
            <div>
              <p className="text-white/80 leading-relaxed mb-4">
                Hey there, traveler.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                You made it through the Foglands. That took courage—not the 
                loud kind, but the quiet kind. The kind that shows up even when 
                you're tired, even when you're hurting, even when you've been 
                told your pain doesn't matter.
              </p>
              <p className="text-white/80 leading-relaxed">
                It does matter. And here's what your journey revealed:
              </p>
            </div>

            {/* Pain Story */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                🔥 <span>YOUR PAIN STORY</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-3">
                Your Flare reached <strong>85 out of 100</strong>.<br />
                That's not "dramatic." That's not "overreacting."<br />
                That's <strong>severe pain</strong>, and it's real.
              </p>
              <p className="text-white/80 leading-relaxed mb-3">
                You experienced what we call a "pain crisis"—a moment when 
                the pain became overwhelming. When that happened, we guided 
                you through breathing exercises. You did that. You steadied 
                yourself. That's a skill, and you have it.
              </p>
              <div className="bg-white/5 rounded p-4 mt-3">
                <p className="text-white/70 text-sm mb-2"><strong>Where you felt the pain:</strong></p>
                <ul className="text-white/70 text-sm space-y-1 pl-4">
                  <li>- Lower abdomen (that deep, visceral ache)</li>
                  <li>- Lower back (radiating down)</li>
                  <li>- Sometimes everywhere (which makes sense when pain is chronic)</li>
                </ul>
              </div>
              <p className="text-white/80 leading-relaxed mt-3">
                This pattern? It's consistent with endometriosis. But even if 
                it's not endo, your pain is valid and deserves investigation.
              </p>
            </div>

            {/* How You Cope */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                💭 <span>HOW YOU COPE</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-3">
                Throughout your journey, you made 23 choices about how to 
                respond to The Ache. Here's what that revealed:
              </p>
              <div className="bg-white/5 rounded p-4 mb-3">
                <p className="text-white/80 mb-2"><strong>Your primary approach: Asking questions (45%)</strong></p>
                <p className="text-white/70 text-sm">
                  You want to UNDERSTAND. You're not just managing symptoms—
                  you're investigating. That's powerful. That's health literacy 
                  in action.
                </p>
              </div>
              <p className="text-white/80 leading-relaxed mb-3">
                You also used:
              </p>
              <ul className="text-white/70 text-sm space-y-1 pl-4 mb-3">
                <li>- Self-soothing (30%) - You know how to comfort yourself</li>
                <li>- Observation (15%) - You're learning to track patterns</li>
                <li>- Pushing through (10%) - Sometimes you ignore it and keep going</li>
              </ul>
              <p className="text-white/80 leading-relaxed">
                <strong>What this means:</strong><br />
                You're already doing so much right. You're engaged, you're 
                learning, you're adapting. But here's the thing: you shouldn't 
                have to figure this all out alone.
              </p>
            </div>

            {/* The Doubt Weaver */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                🌊 <span>WHEN YOU MET THE DOUBT WEAVER</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-3">
                The Doubt Weaver asked: "Do you remember doctors who didn't listen?"
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                You said yes.
              </p>
              <p className="text-white/80 leading-relaxed mb-3">
                We need to sit with that for a moment.
              </p>
              <div className="bg-red-500/10 border-l-4 border-red-500/50 p-4 mb-3">
                <p className="text-white/80 leading-relaxed">
                  Being dismissed by healthcare providers isn't a minor thing. It's 
                  <strong> medical trauma</strong>. It makes you doubt yourself. It makes you wonder 
                  if you're "making it up" or "overreacting." It delays diagnosis. 
                  It keeps you suffering longer.
                </p>
              </div>
              <p className="text-white/80 leading-relaxed mb-3">
                So let's be clear: <strong>You are not making this up.</strong> Your pain is real. 
                And the doctors who didn't listen? That was their failure, not yours.
              </p>
              <div className="bg-white/5 rounded p-4">
                <p className="text-white/70 text-sm mb-2"><strong>Moving forward, you deserve providers who:</strong></p>
                <ul className="text-white/70 text-sm space-y-1 pl-4">
                  <li>✓ Believe you when you describe your symptoms</li>
                  <li>✓ Validate the impact pain has on your life</li>
                  <li>✓ Explain what they're thinking, even if they don't know yet</li>
                  <li>✓ Give you a plan, even if diagnosis takes time</li>
                </ul>
              </div>
            </div>

            {/* Things You Can Do */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                🏠 <span>THINGS YOU CAN DO RIGHT NOW</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-4">
                While you're waiting for appointments or figuring out next steps:
              </p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/80 mb-2"><strong>PAIN MANAGEMENT AT HOME:</strong></p>
                  <ul className="text-white/70 text-sm space-y-1 pl-4">
                    <li>- Heat therapy (heating pad, hot bath)</li>
                    <li>- Anti-inflammatory foods (omega-3s, turmeric, ginger)</li>
                    <li>- Gentle movement when tolerable</li>
                    <li>- TENS unit (drug-free pain relief)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-white/80 mb-2"><strong>TRACKING YOUR PATTERNS:</strong></p>
                  <p className="text-white/70 text-sm mb-2">Start a simple pain diary. Just note:</p>
                  <ul className="text-white/70 text-sm space-y-1 pl-4">
                    <li>- Date & time</li>
                    <li>- Pain location & intensity (1-10)</li>
                    <li>- What were you doing?</li>
                    <li>- What helped? What didn't?</li>
                  </ul>
                  <p className="text-white/70 text-sm mt-2">Even 2 weeks of data helps doctors see patterns.</p>
                </div>

                <div>
                  <p className="text-white/80 mb-2"><strong>REST IS NOT WEAKNESS:</strong></p>
                  <p className="text-white/70 text-sm">
                    You have this pattern of "pushing through." We get it. You have 
                    school, work, life. But rest isn't giving up—it's strategy. 
                    Your body is telling you something. Listen to it.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                💪 <span>YOUR NEXT STEPS</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-3">
                We generated a Clinical Summary for you to share with your doctor. 
                It's in the Healer's Chronicle. Print it. Bring it to your appointment.
              </p>
              <div className="bg-blue-500/10 border-l-4 border-blue-500/50 p-4">
                <p className="text-white/80 text-sm mb-2"><strong>When you book, say:</strong></p>
                <p className="text-white/70 text-sm italic mb-3">
                  "I have chronic pelvic pain and I'd like to discuss possible 
                  endometriosis. I completed a symptom screening and have a summary 
                  to share."
                </p>
                <p className="text-white/80 text-sm mb-2"><strong>If they say "it's probably just stress":</strong></p>
                <p className="text-white/70 text-sm italic">
                  "I appreciate that, but I've been managing this for years and 
                  it's significantly impacting my quality of life. I'd like to 
                  explore this further or get a referral to a gynecologist."
                </p>
              </div>
            </div>

            {/* Closing */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">
                🌙 <span>ONE MORE THING</span>
              </h4>
              <p className="text-white/80 leading-relaxed mb-3">
                The Ache doesn't vanish.<br />
                It becomes something you can see, something you can name.<br />
                And that is power.
              </p>
              <p className="text-white/80 leading-relaxed">
                You've taken the first step: naming it, seeing it, knowing it's real.
              </p>
              <p className="text-white/80 leading-relaxed mt-4 italic">
                Keep going, traveler. The fog is lifting.
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-white/20">
              <p className="text-white/50 text-sm">End of Personal Journal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t-2 border-[#c9a0dc]/30 flex gap-3">
        <button
          className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
          onClick={() => alert('Download functionality coming soon!')}
        >
          <Download className="w-4 h-4" />
          Save Journal
        </button>
        <button
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-colors"
          onClick={() => alert('Share: Coming soon!')}
        >
          Share
        </button>
      </div>
    </motion.div>
  );
}
