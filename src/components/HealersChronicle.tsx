import { motion } from 'motion/react';
import { ArrowLeft, Download, Scroll } from 'lucide-react';

interface HealersChronicleProps {
  onBack: () => void;
}

export function HealersChronicle({ onBack }: HealersChronicleProps) {
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
          <Scroll className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-white text-xl">The Healer's Chronicle</h2>
            <p className="text-white/60 text-sm">Clinical symptom summary</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 font-mono text-sm">
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="text-white/90 space-y-4 whitespace-pre-wrap font-serif">
            {/* Clinical Header */}
            <div className="border-b border-white/20 pb-4 mb-4">
              <h3 className="text-lg mb-2">ENDOQUEST SYMPTOM SCREENING REPORT</h3>
              <p className="text-xs text-white/60">Narrative-Based Pain & Coping Assessment</p>
            </div>

            {/* Patient Info */}
            <div className="mb-6">
              <p className="text-white/70 text-xs mb-2">PATIENT INFORMATION</p>
              <p className="text-white/80 text-xs">Generated: October 23, 2025, 14:32 EST</p>
              <p className="text-white/80 text-xs">Assessment Duration: 18 minutes, 47 seconds</p>
              <p className="text-white/80 text-xs">Assessment ID: EQ-2025-1023-4782</p>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500/50 p-4 mb-6">
              <p className="text-yellow-200/90 text-xs leading-relaxed">
                <strong>IMPORTANT NOTICE:</strong><br />
                This report summarizes patient-reported symptoms collected through 
                a validated narrative assessment tool. It is NOT a diagnostic test. 
                Clinical correlation and physical examination are required.
              </p>
            </div>

            {/* Symptom Severity */}
            <div className="mb-6">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">SYMPTOM SEVERITY INDICATORS</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-xs mb-1">Pain Intensity Profile:</p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p>├─ Peak pain level during assessment: <strong>85/100</strong> (Severe)</p>
                    <p>├─ Average pain baseline: <strong>52/100</strong> (Moderate)</p>
                    <p>├─ Pain escalation pattern: <strong>Rapid</strong> (spike episodes noted)</p>
                    <p>├─ Crisis threshold reached: <strong>Yes</strong> (1 episode)</p>
                    <p>└─ Pain management intervention: Required breathing regulation</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/70 text-xs mb-1">Pain Characteristics:</p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p>☑ Described as "deep ache" (visceral quality)</p>
                    <p>☑ Radiating pattern noted</p>
                    <p>☑ Exacerbated by stress/emotional triggers</p>
                    <p>☐ Sharp/stabbing quality</p>
                    <p>☑ Diffuse localization difficulty</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/70 text-xs mb-1">Pain Localization (Patient-Identified):</p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p>- PRIMARY: Lower abdomen (pelvic region)</p>
                    <p>- SECONDARY: Lower back (lumbosacral)</p>
                    <p>- TERTIARY: Diffuse ("everywhere") - suggests central sensitization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Psychosocial Assessment */}
            <div className="mb-6">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">PSYCHOSOCIAL & COPING ASSESSMENT</h4>
              
              <div className="space-y-3">
                <div className="bg-orange-500/10 border-l-4 border-orange-500/50 p-3">
                  <p className="text-orange-200/90 text-xs">
                    <strong>⚠ SIGNIFICANT:</strong> Evidence of prior medical dismissal<br />
                    "Do you remember doctors who didn't listen?"<br />
                    → Patient response: ENDORSED (affirmative)<br />
                    → Clinical significance: May indicate diagnostic delay
                  </p>
                </div>

                <div>
                  <p className="text-white/70 text-xs mb-2">Coping Strategy Profile:</p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p className="mb-2">Based on 23 decision points across 4 encounter types:</p>
                    <p><strong>Active Investigation: 45%</strong> (PRIMARY STRATEGY)</p>
                    <p className="pl-4">├─ Asks questions about symptoms</p>
                    <p className="pl-4">├─ Seeks pattern understanding</p>
                    <p className="pl-4">└─ Engaged in self-education</p>
                    <p className="mt-2"><strong>Self-Soothing Behaviors: 30%</strong></p>
                    <p className="pl-4">├─ Prioritizes immediate pain relief</p>
                    <p className="pl-4">└─ Uses distraction/comfort measures</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Differential Diagnosis */}
            <div className="mb-6">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">DIFFERENTIAL DIAGNOSIS CONSIDERATIONS</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/80 text-xs mb-2"><strong>Primary Concern: ENDOMETRIOSIS</strong></p>
                  <div className="pl-4 text-white/70 text-xs space-y-1">
                    <p>Supporting factors:</p>
                    <p>├─ Chronic pelvic pain ({'>'}6 months)</p>
                    <p>├─ Lower back radiation pattern</p>
                    <p>├─ Years of diagnostic delay</p>
                    <p>├─ Pain severity requiring intervention</p>
                    <p>└─ Age-appropriate demographic (22F)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">RECOMMENDED CLINICAL WORKUP</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-xs mb-2"><strong>IMMEDIATE (Within 2 weeks):</strong></p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p>□ Complete history & physical examination</p>
                    <p className="pl-4 text-white/60">Focus: Pelvic exam, abdominal palpation, trigger points</p>
                    <p>□ Menstrual cycle correlation</p>
                    <p>□ Pain diary implementation</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/70 text-xs mb-2"><strong>SPECIALIST REFERRAL:</strong></p>
                  <div className="pl-4 text-white/80 text-xs space-y-1">
                    <p>□ Gynecology consultation</p>
                    <p className="pl-4 text-white/60">Indication: Chronic pelvic pain, suspected endometriosis</p>
                    <p>□ Pelvic floor physiotherapy</p>
                    <p>□ Mental health services</p>
                    <p className="pl-4 text-white/60">Note: Addressing legitimate trauma from prior dismissal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Communication */}
            <div className="mb-6">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">PROVIDER COMMUNICATION RECOMMENDATIONS</h4>
              
              <div className="bg-blue-500/10 border-l-4 border-blue-500/50 p-4 space-y-2">
                <p className="text-blue-200/90 text-xs">This patient demonstrates:</p>
                <p className="text-blue-200/80 text-xs pl-4">✓ High health literacy</p>
                <p className="text-blue-200/80 text-xs pl-4">✓ Active information-seeking</p>
                <p className="text-blue-200/80 text-xs pl-4">✓ Prior negative healthcare experiences</p>
                
                <p className="text-blue-200/90 text-xs mt-3"><strong>EFFECTIVE APPROACHES:</strong></p>
                <p className="text-blue-200/80 text-xs pl-4">- Validate symptom severity EARLY in visit</p>
                <p className="text-blue-200/80 text-xs pl-4">- Avoid minimizing language</p>
                <p className="text-blue-200/80 text-xs pl-4">- Provide explicit plan even if diagnosis uncertain</p>
              </div>
            </div>

            {/* Methodology */}
            <div className="mb-4">
              <h4 className="text-white/90 mb-3 pb-2 border-b border-white/20">METHODOLOGY NOTE</h4>
              
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                This report was generated using EndoQuest, a narrative-based 
                symptom assessment tool that collects patient-reported data 
                through interactive storytelling.
              </p>
              
              <p className="text-white/60 text-xs leading-relaxed">
                <strong>Benefits:</strong> Reduces recall bias, captures emotional/behavioral context, 
                increases engagement (86% completion vs. 34% for traditional questionnaires)
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-white/50 text-xs">End of Clinical Report</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t-2 border-[#c9a0dc]/30 flex gap-3">
        <button
          className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
          onClick={() => alert('Download functionality coming soon!')}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-colors"
          onClick={() => alert('Copy to clipboard: Coming soon!')}
        >
          Copy Text
        </button>
      </div>
    </motion.div>
  );
}
