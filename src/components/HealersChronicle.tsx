// HealersChronicle.tsx
import { motion } from 'motion/react';
import { ArrowLeft, Download, Scroll } from 'lucide-react';
import type { ReportJSON } from '../api';
import { downloadReportAsPDF } from '../utils/pdf';

import SourceSerifSemibold from "./fonts/SourceSerif4-SemiBold-base64";
import SourceSerifRegular from "./fonts/SourceSerif4-Regular-base64";

interface HealersChronicleProps {
  onBack: () => void;
  report?: ReportJSON | null;
}

export function HealersChronicle({ onBack, report }: HealersChronicleProps) {
  // Loading / empty state (narrow)
  if (!report) {
    return (
      <motion.div
        className="h-full flex flex-col items-center justify-center text-white/70 px-6 w-full max-w-[420px] mx-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="text-sm">Preparing clinical summary…</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col min-h-0 w-full max-w-[420px] mx-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header (keep narrow) */}
      <div className="w-full max-w-[420px] mx-auto p-6 border-b-2 border-[#c9a0dc]/30 shrink-0">
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
            <h2 className="text-white text-xl">The Healer&apos;s Chronicle</h2>
            <p className="text-white/60 text-sm">Clinical symptom summary</p>
          </div>
        </div>
      </div>

      {/* Scrollable content (narrow) */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-6 w-full max-w-[420px] mx-auto"
        style={{ maxHeight: 'calc(90vh - 160px)' }}
      >
        <div
          className="bg-white/5 rounded-lg p-6 border border-white/10 w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="text-white/90 space-y-4 whitespace-pre-wrap font-serif">
            <div className="border-b border-white/20 pb-4 mb-4">
              <h3 className="text-lg mb-2 uppercase tracking-wide">
                {report.title || 'EndoQuest Symptom Screening Report'}
              </h3>
              <p className="text-xs text-white/60">
                Narrative-Based Pain &amp; Coping Assessment
              </p>
            </div>

            {/* Patient Summary */}
            <section className="mb-4">
              <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                Patient Summary
              </h4>
              <p className="text-white/80 text-sm leading-relaxed">
                {report.patient_summary}
              </p>
            </section>

            {/* Key Findings */}
            {report.findings?.length ? (
              <section className="mb-4">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Key Findings
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.findings.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Red Flags */}
            {report.red_flags?.length ? (
              <section className="mb-4">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Red Flags
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.red_flags.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Likely Considerations */}
            {report.likely_considerations?.length ? (
              <section className="mb-4">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Likely Considerations
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.likely_considerations.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Suggested Next Steps */}
            {report.suggested_next_steps?.length ? (
              <section className="mb-4">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Suggested Next Steps
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.suggested_next_steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Self-Management Tips */}
            {report.self_management_tips?.length ? (
              <section className="mb-4">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Self-Management Tips
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.self_management_tips.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Resources */}
            {report.resources?.length ? (
              <section className="mb-2">
                <h4 className="text-white/90 mb-2 pb-2 border-b border-white/20">
                  Resources
                </h4>
                <ul className="text-white/80 text-sm space-y-1 pl-5 list-disc">
                  {report.resources.map((r, i) => (
                    <li key={i}>
                      <strong>{r.name}</strong>
                      {r.url ? (
                        <>
                          {' '}—{' '}
                          <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                            {r.url}
                          </a>
                        </>
                      ) : null}
                      {r.phone ? <> — {r.phone}</> : null}
                      {r.tags ? <> · <em>{r.tags}</em></> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer actions (narrow) */}
      <div className="w-full max-w-[420px] mx-auto sticky bottom-0 p-6 border-t-2 border-[#c9a0dc]/30 flex gap-3 shrink-0 bg-gradient-to-t from-[#1a1625]/95 to-transparent backdrop-blur">
        <button
          className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
          onClick={() => downloadReportAsPDF(report)}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white transition-colors"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}
