import jsPDF from "jspdf";

type R = {
  title: string;
  patient_summary: string;
  findings?: string[];
  red_flags?: string[];
  likely_considerations?: string[];
  suggested_next_steps?: string[];
  self_management_tips?: string[];
  resources?: { name: string; url?: string | null; phone?: string | null; tags?: string | null }[];
};

type FontOpts = {
  // base64-encoded TTFs (no data: prefix needed; just raw base64)
  headingTTFBase64?: string;   // e.g., Merriweather-SemiBold.ttf  (or your real UI serif)
  bodyTTFBase64?: string;      // e.g., Inter-Regular.ttf          (or your real UI sans)
  headingFamily?: string;      // internal name to register (default: "HeadingSerif")
  bodyFamily?: string;         // internal name to register (default: "BodySans")
};

function registerFonts(doc: jsPDF, fonts?: FontOpts) {
  const headFam = fonts?.headingFamily ?? "HeadingSerif";
  const bodyFam = fonts?.bodyFamily ?? "BodySans";

  if (fonts?.headingTTFBase64) {
    doc.addFileToVFS(`${headFam}.ttf`, fonts.headingTTFBase64);
    // weight label is arbitrary in jsPDF; we'll use "normal" for simplicity
    doc.addFont(`${headFam}.ttf`, headFam, "normal");
  }
  if (fonts?.bodyTTFBase64) {
    doc.addFileToVFS(`${bodyFam}.ttf`, fonts.bodyTTFBase64);
    doc.addFont(`${bodyFam}.ttf`, bodyFam, "normal");
  }

  // Soft fallbacks you can pre-bundle later if you want:
  // If you also convert & ship Playfair/Inter, register them here exactly like above.

  return { headFam, bodyFam };
}

export function downloadReportAsPDF(
  report: R,
  options?: {
    fonts?: FontOpts;
    includeHeader?: boolean; // default true
    includeFooter?: boolean; // default true
  }
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const { headFam, bodyFam } = registerFonts(doc, options?.fonts);

  // Page geometry
  const MX = 18, MY = 18;
  const CONTENT_W = 210 - MX * 2;
  const BOTTOM = 297 - MY;

  // Typographic scale (mm per line for consistent rhythm)
  const SIZE = { title: 20, h2: 13, body: 11 };
  const LH   = { title: 8.0, h2: 6.2, para: 5.2, list: 5.8 }; // tighter para, slightly looser lists

  // Choose families: prefer the ones we registered; otherwise look for Inter/Playfair; finally Helvetica.
  const has = doc.getFontList();
  const bodyFont = "times";
  const headFont = "times";
  const headStyle = "bold";

  doc.setTextColor(0);
  let x = MX, y = MY;

  const pageBreak = (need = 0) => {
    if (y + need > BOTTOM) {
      if (options?.includeFooter !== false) footer();
      doc.addPage();
      y = MY;
      if (options?.includeHeader !== false) header();
    }
  };

  const header = () => {
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(9);
    doc.text("The Healer’s Chronicle — Clinical Symptom Summary", x, y);
    y += 6;
    doc.setDrawColor(220); doc.setLineWidth(0.2);
    doc.line(x, y, x + CONTENT_W, y);
    y += 6;
  };

  const footer = () => {
    const page = doc.internal.getCurrentPageInfo().pageNumber;
    const total = (doc as any).internal.getNumberOfPages?.() ?? page;
    doc.setFont(bodyFont, "normal"); doc.setFontSize(9); doc.setTextColor(130);
    doc.text(`EndoQuest • Page ${page} of ${total}`, x, 297 - 8);
    doc.setTextColor(0);
  };

  const title = (t: string) => {
    doc.setFont(headFont, "normal"); doc.setFontSize(SIZE.title);
    const lines = doc.splitTextToSize(t, CONTENT_W);
    lines.forEach(l => { pageBreak(LH.title); doc.text(l, x, y); y += LH.title; });
    doc.setDrawColor(210); doc.setLineWidth(0.3);
    doc.line(x, y, x + CONTENT_W, y); y += 5;
  };

  const h2 = (t: string) => {
    pageBreak(LH.h2 + 5);
    doc.setFont(headFont, "normal"); doc.setFontSize(SIZE.h2);
    doc.text(t, x, y); y += LH.h2;
    doc.setDrawColor(225); doc.setLineWidth(0.3);
    doc.line(x, y, x + CONTENT_W, y); y += 4;
    doc.setFont(bodyFont, "normal"); doc.setFontSize(SIZE.body);
  };

  const para = (text = "") => {
    if (!text) return;
    doc.setFont(bodyFont, "normal"); doc.setFontSize(SIZE.body);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    lines.forEach(l => { pageBreak(LH.para); doc.text(l, x, y); y += LH.para; });
    y += 1.5;
  };

  const bullets = (items?: string[]) => {
    if (!items?.length) return;
    const indent = 4.5, usable = CONTENT_W - indent;
    items.forEach(it => {
      const lines = doc.splitTextToSize(it, usable);
      pageBreak(LH.list * lines.length + 2);
      doc.text("•", x, y);
      doc.text(lines[0], x + indent, y);
      y += LH.list;
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], x + indent, y);
        y += LH.list;
      }
    });
    y += 2.5;
  };

  const resources = (rows?: R["resources"]) => {
    if (!rows?.length) return;
    bullets(rows.map(r => [r.name, r.url, r.phone, r.tags].filter(Boolean).join(" — ")));
  };

  if (options?.includeHeader !== false) header();
  title(report.title || "Initial Diagnostic Summary");

  h2("Patient Summary");            para(report.patient_summary);
  if (report.findings?.length)               { h2("Key Findings");           bullets(report.findings); }
  if (report.red_flags?.length)              { h2("Red Flags");              bullets(report.red_flags); }
  if (report.likely_considerations?.length)  { h2("Likely Considerations");  bullets(report.likely_considerations); }
  if (report.suggested_next_steps?.length)   { h2("Suggested Next Steps");   bullets(report.suggested_next_steps); }
  if (report.self_management_tips?.length)   { h2("Self-Management Tips");   bullets(report.self_management_tips); }
  if (report.resources?.length)              { h2("Resources");              resources(report.resources); }

  if (options?.includeFooter !== false) footer();
  doc.save(`EndoQuest-Report-${new Date().toISOString().slice(0,10)}.pdf`);
}
