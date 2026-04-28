
/**
 * Layman Architecture Slide Generator
 * EPD Incentive Platform — Simplified Architecture Overview
 * For non-technical audiences.
 */

const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();

// ─── Slide dimensions (widescreen 13.33 x 7.5 inches) ─────────────────────
pptx.layout = "LAYOUT_WIDE";

// ─── Slide ─────────────────────────────────────────────────────────────────
const slide = pptx.addSlide();

// ── Background ──────────────────────────────────────────────────────────────
slide.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: "100%", h: "100%",
  fill: { color: "0D1B2A" },
  line: { color: "0D1B2A" }
});

// ── Header bar ──────────────────────────────────────────────────────────────
slide.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: "100%", h: 0.72,
  fill: { color: "1565C0" },
  line: { color: "1565C0" }
});

slide.addText("EPD Incentive Platform — How It All Works Together", {
  x: 0.25, y: 0.04, w: 10.5, h: 0.55,
  fontSize: 20, bold: true, color: "FFFFFF",
  fontFace: "Calibri"
});

slide.addText("A simple view for everyone", {
  x: 10.8, y: 0.14, w: 2.3, h: 0.4,
  fontSize: 11, color: "90CAF9", italic: true,
  fontFace: "Calibri", align: "right"
});

// ─── Helper: rounded box ────────────────────────────────────────────────────
function addBox(slide, opts) {
  // Shadow (offset rectangle for depth effect)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: opts.x + 0.04, y: opts.y + 0.04,
    w: opts.w, h: opts.h,
    rectRadius: 0.12,
    fill: { color: "000000", transparency: 70 },
    line: { color: "000000", transparency: 70 }
  });
  // Main box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: opts.x, y: opts.y,
    w: opts.w, h: opts.h,
    rectRadius: 0.12,
    fill: { color: opts.fill || "1E3A5F" },
    line: { color: opts.border || "42A5F5", pt: 1.5 }
  });
  // Icon / emoji label
  if (opts.icon) {
    slide.addText(opts.icon, {
      x: opts.x, y: opts.y + 0.04,
      w: opts.w, h: 0.38,
      fontSize: opts.iconSize || 20,
      align: "center", valign: "top",
      fontFace: "Segoe UI Emoji"
    });
  }
  // Title
  slide.addText(opts.title, {
    x: opts.x + 0.05, y: opts.y + (opts.icon ? 0.42 : 0.06),
    w: opts.w - 0.1, h: 0.32,
    fontSize: opts.titleSize || 10.5,
    bold: true, color: opts.titleColor || "FFFFFF",
    align: "center", fontFace: "Calibri"
  });
  // Subtitle / description
  if (opts.sub) {
    slide.addText(opts.sub, {
      x: opts.x + 0.07, y: opts.y + (opts.icon ? 0.76 : 0.38),
      w: opts.w - 0.14, h: opts.h - (opts.icon ? 0.82 : 0.44),
      fontSize: opts.subSize || 8.5,
      color: opts.subColor || "B0C4DE",
      align: "center", valign: "top",
      wrap: true, fontFace: "Calibri"
    });
  }
}

// ─── Helper: arrow ──────────────────────────────────────────────────────────
function addArrow(slide, x1, y1, x2, y2, label) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color: "42A5F5", pt: 1.8, endArrowType: "arrow" }
  });
  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    slide.addText(label, {
      x: mx - 0.55, y: my - 0.13,
      w: 1.1, h: 0.22,
      fontSize: 7.5, color: "90CAF9",
      align: "center", fontFace: "Calibri", italic: true
    });
  }
}

// ─── Section labels ──────────────────────────────────────────────────────────
function addSectionLabel(slide, x, y, w, text, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.26,
    rectRadius: 0.06,
    fill: { color: color || "1565C0", transparency: 30 },
    line: { color: color || "42A5F5", pt: 1 }
  });
  slide.addText(text, {
    x, y, w, h: 0.26,
    fontSize: 8, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", fontFace: "Calibri"
  });
}

// ════════════════════════════════════════════════════════════
//  LAYOUT  (all in inches, slide = 13.33 x 7.5)
//
//   ROW 1 (y≈0.85):  [INTEGRATIONS — Data Source]
//   ROW 2 (y≈2.10):  [Platform Core — 4 boxes]
//   ROW 3 (y≈3.90):  [What Users See — PWA App]
//   ROW 4 (y≈5.30):  [Security & Reliability]
// ════════════════════════════════════════════════════════════

// ── SECTION 0: Title labels ──────────────────────────────────────────────────
addSectionLabel(slide, 0.25, 0.80, 12.83, "① WHERE DATA COMES FROM  —  Integrations", "1565C0");

// ── ROW 1: INTEGRATIONS (data sources) ──────────────────────────────────────
const integrations = [
  { icon: "🏢", title: "Sales / CRM", sub: "Microsoft Dynamics\n& Salesforce" },
  { icon: "💰", title: "Finance / ERP", sub: "SAP & Other\nFinancial Systems" },
  { icon: "📋", title: "OEC Watchlists", sub: "Government &\nInternal Lists" },
  { icon: "📱", title: "Email & SMS", sub: "Notifications\n& Alerts" },
];

const intW = 2.8;
const intGap = (12.83 - integrations.length * intW) / (integrations.length + 1);
integrations.forEach((item, i) => {
  const bx = 0.25 + intGap + i * (intW + intGap);
  addBox(slide, {
    x: bx, y: 1.12, w: intW, h: 0.88,
    fill: "0A3055", border: "29B6F6",
    icon: item.icon, iconSize: 16,
    title: item.title, titleSize: 9.5,
    sub: item.sub, subSize: 7.5,
    subColor: "90CAF9"
  });
  // Arrow down to platform core
  addArrow(slide, bx + intW / 2, 2.00, bx + intW / 2, 2.42);
});

// ── Section 2 label ──────────────────────────────────────────────────────────
addSectionLabel(slide, 0.25, 2.10, 12.83, "② THE PLATFORM CORE  —  What the System Does", "1A237E");

// ── ROW 2: PLATFORM CORE ────────────────────────────────────────────────────
const core = [
  {
    icon: "⚙️", fill: "0D2E5E", border: "42A5F5",
    title: "Smart Login & Access",
    sub: "Each person sees only what they should — field reps see their own data, managers see their team, admins see everything."
  },
  {
    icon: "📊", fill: "0D2E5E", border: "42A5F5",
    title: "Incentive Calculation",
    sub: "Automatically calculates how much bonus each person earns based on sales targets, NPI goals, and territory results."
  },
  {
    icon: "🔍", fill: "0D2E5E", border: "42A5F5",
    title: "Analytics & Reports",
    sub: "Turns raw numbers into easy charts — who's performing, who needs support, and where the business is heading."
  },
  {
    icon: "✅", fill: "0D2E5E", border: "42A5F5",
    title: "Approvals & Compliance",
    sub: "Managers approve payouts digitally. The system keeps a full audit trail so everything is transparent and auditable."
  },
];

const coreW = 2.9;
const coreGap = (12.83 - core.length * coreW) / (core.length + 1);
core.forEach((item, i) => {
  const bx = 0.25 + coreGap + i * (coreW + coreGap);
  addBox(slide, {
    x: bx, y: 2.42, w: coreW, h: 1.30,
    fill: item.fill, border: item.border,
    icon: item.icon, iconSize: 18,
    title: item.title, titleSize: 10,
    sub: item.sub, subSize: 8,
    subColor: "B0C4DE"
  });
  // Arrow down to user layer
  addArrow(slide, bx + coreW / 2, 3.72, bx + coreW / 2, 4.00);
});

// ── Section 3 label ──────────────────────────────────────────────────────────
addSectionLabel(slide, 0.25, 3.78, 12.83, "③ WHAT USERS SEE  —  The Application", "1B5E20");

// ── ROW 3: USER-FACING APP ───────────────────────────────────────────────────
const users = [
  {
    icon: "👨‍💼", fill: "0A2E1A", border: "43A047",
    title: "Field Representatives",
    sub: "See their own sales vs. target, estimated incentive pay, and NPI performance on any device."
  },
  {
    icon: "👩‍💼", fill: "0A2E1A", border: "43A047",
    title: "Managers",
    sub: "View team performance, approve payouts, and spot trends across their territory."
  },
  {
    icon: "🛠️", fill: "0A2E1A", border: "43A047",
    title: "Admin / Super Admin",
    sub: "Configure incentive plans, upload targets, manage users, and oversee the full system."
  },
];

const userW = 3.7;
const userGap = (12.83 - users.length * userW) / (users.length + 1);
users.forEach((item, i) => {
  const bx = 0.25 + userGap + i * (userW + userGap);
  addBox(slide, {
    x: bx, y: 4.02, w: userW, h: 1.18,
    fill: item.fill, border: item.border,
    icon: item.icon, iconSize: 18,
    title: item.title, titleSize: 10,
    sub: item.sub, subSize: 8.5,
    subColor: "A5D6A7"
  });
});

// ── Section 4 label ──────────────────────────────────────────────────────────
addSectionLabel(slide, 0.25, 5.38, 12.83, "④ ALWAYS SAFE & ALWAYS ON  —  Security & Reliability", "4A1A00");

// ── ROW 4: SECURITY & RELIABILITY (compact) ─────────────────────────────────
const safeguards = [
  { icon: "🔐", title: "Secure Login (SSO)", sub: "Company login only.\nNo shared passwords." },
  { icon: "🌍", title: "Works Everywhere", sub: "Web, mobile & offline.\n47 markets supported." },
  { icon: "🔒", title: "Data Privacy", sub: "Each country sees\nonly its own data." },
  { icon: "📈", title: "Always Available", sub: "99.9% uptime.\nAuto-scaling servers." },
  { icon: "📝", title: "Full Audit Trail", sub: "Every action logged.\nFully compliant." },
];

const sfW = 2.25;
const sfGap = (12.83 - safeguards.length * sfW) / (safeguards.length + 1);
safeguards.forEach((item, i) => {
  const bx = 0.25 + sfGap + i * (sfW + sfGap);
  addBox(slide, {
    x: bx, y: 5.66, w: sfW, h: 1.55,
    fill: "2A1000", border: "FF8F00",
    icon: item.icon, iconSize: 16,
    title: item.title, titleSize: 9,
    sub: item.sub, subSize: 7.5,
    subColor: "FFCC80"
  });
});

// ── Footer ───────────────────────────────────────────────────────────────────
slide.addShape(pptx.ShapeType.rect, {
  x: 0, y: 7.25, w: "100%", h: 0.25,
  fill: { color: "1565C0" },
  line: { color: "1565C0" }
});
slide.addText("BSS — Business Solutions & Services  |  EPD Incentive Platform  |  Architecture Overview (Simplified)", {
  x: 0.25, y: 7.26, w: 12.83, h: 0.22,
  fontSize: 7.5, color: "FFFFFF", align: "center", fontFace: "Calibri"
});

// ── Save ─────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: "Architecture_Layman_Slide.pptx" })
  .then(() => console.log("✅  Saved: Architecture_Layman_Slide.pptx"))
  .catch(err => { console.error("❌  Error:", err); process.exit(1); });
