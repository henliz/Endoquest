import { motion } from 'motion/react';
import { ArrowLeft, FileText, Download, ExternalLink } from 'lucide-react';

interface GuildOfRestorationProps {
  onBack: () => void;
}

export function GuildOfRestoration({ onBack }: GuildOfRestorationProps) {
  const benefits = [
    {
      priority: 1,
      title: "Pelvic Floor Physiotherapy",
      icon: "🔵",
      coverage: "$500-$1,000/year",
      why: "Your pain pattern (pelvic, lower back, radiating) suggests possible pelvic floor dysfunction.",
      action: "Book initial assessment - no referral needed"
    },
    {
      priority: 2,
      title: "Mental Health Counseling",
      icon: "🟢",
      coverage: "$1,000-$5,000/year",
      why: "Processing medical trauma and building self-advocacy skills.",
      action: "Find providers experienced in chronic pain psychology"
    },
    {
      priority: 3,
      title: "Registered Dietitian",
      icon: "🟡",
      coverage: "Varies by plan",
      why: "Anti-inflammatory diet approaches may help reduce overall inflammation.",
      action: "Look for RDs experienced in women's health"
    }
  ];

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
          <FileText className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-white text-xl">Guild of Restoration</h2>
            <p className="text-white/60 text-sm">Sun Life Benefits matched to your needs</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="text-white/90 font-serif">
              <h3 className="text-xl mb-3">YOUR SUN LIFE BENEFITS GUIDE</h3>
              <p className="text-sm text-white/70 mb-4">
                Personalized Recommendations Based on Your Profile
              </p>
              <p className="text-white/80 leading-relaxed">
                Based on your symptom profile from EndoQuest, here are Sun Life 
                benefits that can help you RIGHT NOW—even before you have a 
                formal diagnosis.
              </p>
            </div>
          </div>

          {/* Priority Benefits */}
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{benefit.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded">
                      PRIORITY {benefit.priority}
                    </span>
                    <h4 className="text-white text-lg">{benefit.title}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-white/70 text-sm mb-1"><strong>Your coverage:</strong></p>
                      <p className="text-white/60 text-sm pl-4">{benefit.coverage}</p>
                    </div>

                    <div>
                      <p className="text-white/70 text-sm mb-1"><strong>Why this is recommended:</strong></p>
                      <p className="text-white/60 text-sm pl-4 leading-relaxed">{benefit.why}</p>
                    </div>

                    <div>
                      <p className="text-white/70 text-sm mb-1"><strong>Next step:</strong></p>
                      <p className="text-white/60 text-sm pl-4">{benefit.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Action Plan */}
          <div className="bg-blue-500/10 border-l-4 border-blue-500/50 rounded-lg p-6">
            <h4 className="text-white text-lg mb-4">📞 YOUR ACTION PLAN THIS WEEK</h4>
            
            <div className="space-y-3 text-white/80 text-sm">
              <div className="flex gap-3">
                <span className="text-white/60">□</span>
                <div>
                  <p className="mb-1"><strong>STEP 1: Check your specific coverage</strong></p>
                  <p className="text-white/60 text-xs">Call Sun Life: 1-800-361-6212</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-white/60">□</span>
                <div>
                  <p className="mb-1"><strong>STEP 2: Book ONE appointment</strong></p>
                  <p className="text-white/60 text-xs">
                    Start with whichever feels most accessible. Don't try to do everything at once.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-white/60">□</span>
                <div>
                  <p className="mb-1"><strong>STEP 3: Bring your Clinical Summary</strong></p>
                  <p className="text-white/60 text-xs">
                    Print the "Healer's Chronicle" and bring it to ALL appointments.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-white/60">□</span>
                <div>
                  <p className="mb-1"><strong>STEP 4: Book a doctor's appointment</strong></p>
                  <p className="text-white/60 text-xs">
                    Goal: Get referral to gynecologist + discuss symptom management
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-white text-lg mb-3">💡 PRO TIPS</h4>
            
            <div className="space-y-2 text-white/70 text-sm">
              <p><strong>Maximizing your benefits:</strong></p>
              <ul className="pl-4 space-y-1">
                <li>- Some providers offer package deals (buy 5 sessions, get a discount)</li>
                <li>- Ask about direct billing to Sun Life (saves you upfront costs)</li>
                <li>- Virtual appointments often have shorter wait times</li>
                <li>- You can see multiple providers simultaneously (PT + therapist, etc.)</li>
              </ul>
            </div>
          </div>

          {/* Closing */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-6">
            <div className="text-center">
              <p className="text-white text-lg mb-2">🌟 REMEMBER</p>
              <p className="text-white/80 text-sm leading-relaxed mb-3">
                You don't need a diagnosis to use these benefits.<br />
                You don't need permission to seek support.<br />
                Your pain is real, and these services are here to help.
              </p>
              <p className="text-white/70 text-sm italic">
                Start with one. Just one.
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center text-white/60 text-xs">
            <p className="mb-1">For benefit questions:</p>
            <p>mysunlife.ca or 1-800-361-6212</p>
            <p className="mt-2 italic">You've got this, traveler. 🌙</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t-2 border-[#c9a0dc]/30 flex gap-3">
        <button
          className="flex-1 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
          onClick={() => alert('Download functionality coming soon!')}
        >
          <Download className="w-4 h-4" />
          Save Guide
        </button>
        <button
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
          onClick={() => window.open('https://mysunlife.ca', '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
          Sun Life Portal
        </button>
      </div>
    </motion.div>
  );
}
