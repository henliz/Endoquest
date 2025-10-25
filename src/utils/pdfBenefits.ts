import jsPDF from "jspdf";

function sanitize(text: string) {
  // Replace curly quotes, apostrophes, and strip unsupported emoji
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, ""); // remove emoji range
}

export type Benefit = {
  priority: number;
  title: string;
  icon: string;
  coverage: string;
  why: string;
  action: string;
};

export function downloadBenefitsAsPDF(benefits: Benefit[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Margins and layout constants
  const MX = 18, MY = 18;
  const CONTENT_W = 210 - MX * 2;
  const BOTTOM = 297 - MY;

  // Font and line height setup
  const SIZE = { title: 20, h2: 13, body: 11 };
  const LH = { title: 8, h2: 6.2, body: 5.2 };

  const bodyFont = "times";
  const headFont = "times";

  let x = MX, y = MY;

  // Helper for page breaks
  const pageBreak = (need = 0) => {
    if (y + need > BOTTOM) {
      footer();
      doc.addPage();
      y = MY;
      header();
    }
  };

  // Header and footer
  const header = () => {
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(9);
    doc.text(sanitize("Guild of Restoration — Sun Life Benefits Guide"), x, y);
    y += 6;
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(x, y, x + CONTENT_W, y);
    y += 6;
  };

  const footer = () => {
    const page = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(`Page ${page}`, x, 297 - 8);
    doc.setTextColor(0);
  };

  // Title, section headers, and paragraph helpers
  const h1 = (t: string) => {
    pageBreak(LH.title);
    doc.setFont(headFont, "bold");
    doc.setFontSize(SIZE.title);
    doc.text(sanitize(t), x, y);
    y += LH.title + 2;
  };

  const h2 = (t: string) => {
    pageBreak(LH.h2);
    doc.setFont(headFont, "bold");
    doc.setFontSize(SIZE.h2);
    doc.text(sanitize(t), x, y);
    y += LH.h2 + 2;
    doc.setFont(bodyFont, "normal");
  };

  const para = (text = "") => {
    if (!text) return;
    const lines = doc.splitTextToSize(sanitize(text), CONTENT_W);
    lines.forEach(l => {
      pageBreak(LH.body);
      doc.text(l, x, y);
      y += LH.body;
    });
    y += 2;
  };

  // === CONTENT ===
  header();
  h1("Your Sun Life Benefits Guide");
  para(
    "Personalized recommendations matched to your EndoQuest symptom profile. You don't need a diagnosis to start using these benefits."
  );

  for (const benefit of benefits) {
    pageBreak(15);
    h2(`${sanitize(benefit.title)} (Priority ${benefit.priority})`);
    para(`Coverage: ${benefit.coverage}`);
    para(`Why this helps: ${benefit.why}`);
    para(`Next Step: ${benefit.action}`);
    y += 4;
  }

  pageBreak(12);
  h2("Contact Info");
  para("mysunlife.ca or 1-800-361-6212");
  para('"You\'ve got this, traveler."');

  footer();
  doc.save(`SunLife-Benefits-${new Date().toISOString().slice(0, 10)}.pdf`);
}
