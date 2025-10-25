// src/components/WaysideComforts.tsx
import { motion } from 'motion/react';
import { ArrowLeft, Home, Download } from 'lucide-react';
import type { ReportJSON } from '../api';
import { downloadReportAsPDF } from '../utils/pdf';

interface WaysideComfortsProps {
  onBack: () => void;
  report?: ReportJSON;       // optional: reuse the clinical PDF here too
  stats?: {                  // optional: inject gameplay stats you track
    peakFlare?: number;
    choicesTotal?: number;
    strategyBreakdown?: { label: string; pct: number }[];
    painLocations?: string[];
  };
}

export function WaysideComforts({ onBack, report, stats }: WaysideComfortsProps) {
  // Loading / empty state (mirror HealersChronicle)
  if (!report) {
    return (
      <motion.div
        className="h-full flex flex-col items-center justify-center text-white/70 px-6 w-full max-w-[420px] mx-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="text-sm">Preparing home-care summary…</div>
      </motion.div>
    );
  }

  const peak = stats?.peakFlare ?? 85;
  const choices = stats?.choicesTotal ?? 23;
  const locations = stats?.painLocations ?? ['Lower abdomen', 'Lower back', 'Diffuse'];

  return (
    <motion.div className="h-full flex flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* Header */}
      <div className="p-6 border-b-2 border-[#c9a0dc]/30">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-white text-xl">Wayside Comforts</h2>
            <p className="text-white/60 text-sm">At-home pain management &amp; self-care</p>
          </div>
        </div>
      </div>

      {/* Content (your existing narrative sections; swapped a few numbers for {peak}, {choices}, etc.) */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="text-white/90 space-y-6 font-serif">
            {/* ... keep your exact content ... */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-white/90 flex items-center gap-2 mb-3">🔥 <span>YOUR PAIN STORY</span></h4>
              <p className="text-white/80 leading-relaxed mb-3">
                Your Flare reached <strong>{peak} out of 100</strong>.
              </p>
              <div className="bg-white/5 rounded p-4 mt-3">
                <p className="text-white/70 text-sm mb-2"><strong>Where you felt the pain:</strong></p>
                <ul className="text-white/70 text-sm space-y-1 pl-4">
                  {locations.map((loc,i)=><li key={i}>- {loc}</li>)}
                </ul>
              </div>
            </div>

            {/* ... keep the rest unchanged ... */}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t-2 border-[#c9a0dc]/30 flex gap-3">
        <button
          className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!report}
          onClick={() => downloadReportAsPDF(report)}
        >

          <Download className="w-4 h-4" />
          Save Journal (PDF)
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
