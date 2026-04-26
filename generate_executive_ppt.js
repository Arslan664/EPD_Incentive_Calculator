// ============================================================
//  Rebuild ONLY Slide 5 – Technical Architecture (Flow Wireframe Style)
//  Reference: screenshot showing DATA SOURCES → PROCESSING → APP LAYER → OUTPUT
//  Content sourced from EPD_Incentive_Platform_Proposal.docx
// ============================================================

const PptxGenJS = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ── We must rebuild the whole deck because pptxgenjs cannot patch an existing file
// ── So we regenerate all 7 slides, replacing only slide 5

const pptx = new PptxGenJS();

const C = {
  navyDark:   "1B2A5E",
  navyMid:    "1F497D",
  abbottBlue: "009DD9",
  accent1:    "4F81BD",
  teal:       "4BACC6",
  white:      "FFFFFF",
  lightGrey:  "F4F6FB",
  midGrey:    "8096B4",
  darkText:   "1B2A5E",
  orange:     "F79646",
  green:      "9BBB59",
  red:        "C0504D",
  panelBg:    "0D1833",   // dark panel background (like the reference)
  panelBorder:"2B4A8C",
  boxBg:      "152244",
  arrowBlue:  "3B82F6",
};

pptx.layout  = "LAYOUT_WIDE";
pptx.author  = "BSS – Business Solutions & Services";
pptx.company = "Abbott";
pptx.subject = "EPD Incentive Platform – Executive Summary";
pptx.title   = "EPD Incentive Platform";

const W = 13.33;
const H = 7.5;

const BSS_LOGO    = path.resolve(__dirname, "PPT/extracted/ppt/media/image1.png");
const ABBOTT_LOGO = path.resolve(__dirname, "PPT/extracted/ppt/media/image2.jpeg");

function addHeader(slide, title, subtitle = "") {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 1.15,
    fill: { color: C.navyDark }, line: { color: C.navyDark },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 1.15, w: W, h: 0.06,
    fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
  });
  slide.addText(title, {
    x: 0.45, y: 0.12, w: 9.5, h: 0.6,
    fontSize: 22, bold: true, color: C.white, fontFace: "Calibri",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.45, y: 0.72, w: 9.5, h: 0.36,
      fontSize: 11.5, color: C.teal, italic: true, fontFace: "Calibri",
    });
  }
  if (fs.existsSync(BSS_LOGO)) {
    slide.addImage({ path: BSS_LOGO, x: 11.1, y: 0.09, w: 1.85, h: 0.88 });
  }
}

function addFooter(slide, pageNum, total) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: H - 0.38, w: W, h: 0.38,
    fill: { color: C.navyDark }, line: { color: C.navyDark },
  });
  slide.addText("EPD Incentive Platform  |  Executive Summary  |  CONFIDENTIAL", {
    x: 0.3, y: H - 0.34, w: 10, h: 0.3,
    fontSize: 8, color: C.midGrey, fontFace: "Calibri",
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: 12.5, y: H - 0.34, w: 0.7, h: 0.3,
    fontSize: 8, color: C.midGrey, align: "right", fontFace: "Calibri",
  });
}

function addAccentBar(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 1.21, w: 0.08, h: H - 1.21 - 0.38,
    fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
  });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.07,
    fill: { color: opts.bg || C.lightGrey },
    line: { color: opts.border || C.accent1, width: opts.borderW || 0.75 },
    shadow: { type: "outer", blur: 6, offset: 3, angle: 45, color: "1B2A5E", opacity: 0.12 },
  });
}

const TOTAL_SLIDES = 8;

// ════════════════════════════════════════════════════════════
//  SLIDE 1 – COVER
// ════════════════════════════════════════════════════════════
(function buildCover() {
  const slide = pptx.addSlide();
  slide.background = { color: C.navyDark };
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.8, y: -1.5, w: 5.5, h: 5.5,
    fill: { type: "solid", color: C.navyMid },
    line: { color: C.navyMid }, transparency: 60,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: H,
    fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: H - 1.3, w: W, h: 1.3,
    fill: { type: "solid", color: "0D1A3E" }, line: { color: "0D1A3E" },
  });
  if (fs.existsSync(ABBOTT_LOGO)) {
    slide.addImage({ path: ABBOTT_LOGO, x: 0.4, y: H - 1.1, w: 2.0, h: 0.72 });
  }
  if (fs.existsSync(BSS_LOGO)) {
    slide.addImage({ path: BSS_LOGO, x: W - 2.5, y: H - 1.18, w: 2.1, h: 0.95 });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: 0.4, y: H - 1.35, w: W - 0.8, h: 0,
    line: { color: C.abbottBlue, width: 1 },
  });
  slide.addText("EPD Incentive Platform", {
    x: 0.5, y: 1.5, w: 9.5, h: 1.1,
    fontSize: 42, bold: true, color: C.white, fontFace: "Calibri",
  });
  slide.addText("Executive Summary", {
    x: 0.5, y: 2.65, w: 8, h: 0.7,
    fontSize: 26, color: C.abbottBlue, fontFace: "Calibri",
  });
  slide.addText("Kazakhstan & CIS | Digital Incentive Management System", {
    x: 0.5, y: 3.45, w: 9, h: 0.45,
    fontSize: 13, color: C.midGrey, italic: true, fontFace: "Calibri",
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.2, w: 2.2, h: 0.38, rectRadius: 0.05,
    fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
  });
  slide.addText("April 2026  |  CONFIDENTIAL", {
    x: 0.5, y: 4.2, w: 2.2, h: 0.38,
    fontSize: 9, bold: true, color: C.white, align: "center", fontFace: "Calibri",
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 2 – OBJECTIVE
// ════════════════════════════════════════════════════════════
(function buildObjective() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "01  |  Objective", "What we are building and why");
  addAccentBar(slide);
  addFooter(slide, 2, TOTAL_SLIDES);

  card(slide, 0.25, 1.35, W - 0.5, 1.35, { bg: C.navyDark, border: C.navyDark });
  slide.addText(
    "Design, develop, and deploy a centralized web-based platform that automates the quarterly incentive calculation, review, and sign-off process for Abbott's EPD (Established Pharmaceuticals Division) field force across Kazakhstan and the CIS region — with a roadmap to scale to 70+ countries and 5,000–10,000 representatives globally.",
    {
      x: 0.35, y: 1.38, w: W - 0.7, h: 1.28,
      fontSize: 13, color: C.white, fontFace: "Calibri", align: "left", valign: "middle",
    }
  );

  const pillars = [
    { icon: "🎯", title: "Accuracy", body: "Eliminate manual Excel errors via validated, formula-driven calculations backed by a normalized PostgreSQL database on Supabase. Reduce 2% error rate on 75M LC payouts." },
    { icon: "⚡", title: "Efficiency", body: "Reduce the monthly close cycle from 2–3 weeks to under 48 hours via automated workflows, real-time dashboards, and digital multi-level sign-off routing." },
    { icon: "👁️", title: "Transparency", body: "Provide role-based visibility (DVP → RBM → FLM → Med. Rep.) across Kazakhstan's 86 reps, 8 quarters, 15 products, and 6 promo lines — with full audit trail." },
  ];

  const cw = (W - 0.5 - 0.3) / 3;
  pillars.forEach((p, i) => {
    const cx = 0.25 + i * (cw + 0.15);
    card(slide, cx, 2.9, cw, 2.5, { bg: C.lightGrey, border: C.accent1 });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx + cw / 2 - 0.35, y: 3.0, w: 0.7, h: 0.7,
      fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
    });
    slide.addText(p.icon, { x: cx + cw / 2 - 0.35, y: 3.02, w: 0.7, h: 0.66, fontSize: 18, align: "center" });
    slide.addText(p.title, {
      x: cx + 0.1, y: 3.77, w: cw - 0.2, h: 0.38,
      fontSize: 13, bold: true, color: C.navyDark, align: "center", fontFace: "Calibri",
    });
    slide.addText(p.body, {
      x: cx + 0.15, y: 4.18, w: cw - 0.3, h: 1.1,
      fontSize: 9.5, color: "444444", fontFace: "Calibri",
    });
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 3 – SCOPE
// ════════════════════════════════════════════════════════════
(function buildScope() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "02  |  High-Level Scope", "Boundaries, inclusions & phased delivery");
  addAccentBar(slide);
  addFooter(slide, 3, TOTAL_SLIDES);

  card(slide, 0.25, 1.35, 6.0, 5.3, { bg: C.lightGrey, border: C.accent1 });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.25, y: 1.35, w: 6.0, h: 0.45,
    fill: { color: C.navyDark }, line: { color: C.navyDark },
  });
  slide.addText("✅  IN SCOPE", {
    x: 0.35, y: 1.37, w: 5.8, h: 0.4,
    fontSize: 11, bold: true, color: C.white, fontFace: "Calibri",
  });

  const inScope = [
    ["Phase 1 – Data & Infra",   "Normalized Supabase schema (13 tables), CSV-to-DB seed pipelines, RLS security policies"],
    ["Phase 2 – Core Dashboard", "Next.js 14 role-based portal: Summary, Detailed, Sign-Off, Product Promo, Staff views"],
    ["Phase 3 – Analytics",      "Quarter-over-quarter trend analysis, top-performer leaderboards, Excel/PDF export reports"],
    ["Phase 4 – Auth & Roles",   "Supabase Auth SSO: DVP, RBM, FLM, Med. Rep. with scoped data access and audit logs"],
    ["Phase 5 – Automation",     "Quarterly data ingestion pipeline, e-signature sign-off workflow, email notifications"],
    ["Geography",                "Kazakhstan (86 reps, 8 qtrs) as POC; roadmap to 70+ countries, 5,000–10,000 reps"],
  ];

  inScope.forEach(([t, b], i) => {
    const sy = 1.92 + i * 0.76;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y: sy, w: 0.06, h: 0.52,
      fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
    });
    slide.addText(t, {
      x: 0.5, y: sy, w: 5.6, h: 0.28,
      fontSize: 10, bold: true, color: C.navyDark, fontFace: "Calibri",
    });
    slide.addText(b, {
      x: 0.5, y: sy + 0.27, w: 5.6, h: 0.28,
      fontSize: 8.5, color: "555555", fontFace: "Calibri",
    });
  });

  card(slide, 6.53, 1.35, 6.55, 2.35, { bg: "FFF4F4", border: C.red });
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.53, y: 1.35, w: 6.55, h: 0.45,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText("🚫  OUT OF SCOPE", {
    x: 6.63, y: 1.37, w: 6.35, h: 0.4,
    fontSize: 11, bold: true, color: C.white, fontFace: "Calibri",
  });

  const outScope = [
    "ERP / SAP integration (future phase)",
    "Mobile native app (web-responsive only)",
    "Global markets outside KZ / Georgia",
    "Payroll system direct write-back",
  ];
  outScope.forEach((t, i) => {
    slide.addText(`✗  ${t}`, {
      x: 6.7, y: 1.92 + i * 0.44, w: 6.2, h: 0.38,
      fontSize: 9.5, color: "333333", fontFace: "Calibri",
    });
  });

  const kpis = [
    { val: "86", lbl: "Reps Tracked" },
    { val: "8",  lbl: "Quarters Live" },
    { val: "15", lbl: "Products" },
    { val: "6",  lbl: "Promo Lines" },
  ];
  const kw = 6.55 / 4 - 0.08;
  kpis.forEach((k, i) => {
    const kx = 6.53 + i * (kw + 0.085);
    card(slide, kx, 3.87, kw, 1.22, { bg: C.navyDark, border: C.navyDark });
    slide.addText(k.val, {
      x: kx + 0.05, y: 3.93, w: kw - 0.1, h: 0.6,
      fontSize: 26, bold: true, color: C.abbottBlue, align: "center", fontFace: "Calibri",
    });
    slide.addText(k.lbl, {
      x: kx + 0.05, y: 4.53, w: kw - 0.1, h: 0.44,
      fontSize: 8, color: C.white, align: "center", fontFace: "Calibri",
    });
  });

  card(slide, 6.53, 5.22, 6.55, 1.43, { bg: C.lightGrey, border: C.accent1 });
  slide.addText("DELIVERY TIMELINE", {
    x: 6.63, y: 5.26, w: 6.3, h: 0.3,
    fontSize: 9, bold: true, color: C.navyDark, fontFace: "Calibri",
  });
  const phases = ["P1 Done", "P2 In Progress", "P3 Planned", "P4-5 Roadmap"];
  const pw2 = 6.55 / 4 - 0.1;
  const phColors = [C.green, C.abbottBlue, C.orange, C.midGrey];
  phases.forEach((ph, i) => {
    const px = 6.58 + i * (pw2 + 0.1);
    slide.addShape(pptx.ShapeType.rect, {
      x: px, y: 5.62, w: pw2, h: 0.28,
      fill: { color: phColors[i] }, line: { color: phColors[i] },
    });
    slide.addText(ph, {
      x: px, y: 5.94, w: pw2, h: 0.58,
      fontSize: 7.5, color: "333333", align: "center", fontFace: "Calibri",
    });
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 4 – PROBLEM STATEMENT
// ════════════════════════════════════════════════════════════
(function buildProblem() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "03  |  Problem Statement", "Current-state pain points driving this initiative");
  addAccentBar(slide);
  addFooter(slide, 4, TOTAL_SLIDES);

  card(slide, 0.25, 1.35, W - 0.5, 0.58, { bg: "FFF0F0", border: C.red });
  slide.addText(
    "⚠️  Current State:  Quarterly incentive calculations are managed entirely in a complex, multi-sheet Excel workbook with 9 inter-linked CSVs — creating significant risk of manual errors, version conflicts, and delayed approvals for 86 representatives across Kazakhstan.",
    {
      x: 0.4, y: 1.38, w: W - 0.8, h: 0.52,
      fontSize: 10, color: "880000", fontFace: "Calibri", valign: "middle",
    }
  );

  const problems = [
    {
      title: "Manual Calculation Errors",
      body: "9 inter-linked CSV/Excel files with no validation. Comma-formatted numbers, Cyrillic character mismatches, and staggered headers cause import failures. A 2% error rate on 75M LC annual payouts = M in incorrect payments.",
      icon: "📊", color: C.red,
    },
    {
      title: "No Single Source of Truth",
      body: "Data scattered across Staff_Input, Mapping, TCFA, TIC, Summary_calculation, and 4 more CSVs. Changes in one file are not propagated — creating inconsistencies between manager views and rep payout records.",
      icon: "🗃️", color: C.orange,
    },
    {
      title: "Zero Role-Based Access",
      body: "A single shared Excel file is emailed to all stakeholders. DVPs see confidential data of all regions; FLMs can overwrite other teams' records. No audit trail of who changed what and when — a SOX compliance risk.",
      icon: "🔓", color: C.red,
    },
    {
      title: "Slow Sign-Off Cycle",
      body: "Sign-off requires manual email chains between DVPs, RBMs, and FLMs. A single revision request can stall the cycle by 5–10 business days, delaying rep payments and reducing field-force morale and retention.",
      icon: "⏳", color: C.orange,
    },
    {
      title: "No Historical Analytics",
      body: "Each quarter's data lives in a separate Excel version. Year-over-year performance comparisons, rep attrition analysis, and product-level trend reporting require costly manual consolidation across 8+ files.",
      icon: "📉", color: C.navyMid,
    },
    {
      title: "Cannot Scale to 70+ Countries",
      body: "Adding a new quarter regenerates the entire 107KB static data file. Adding a country, product, or promo line requires structural changes to all inter-linked sheets. The current model breaks completely at scale.",
      icon: "📦", color: C.navyMid,
    },
  ];

  const cols = 3;
  const rows = 2;
  const cw2 = (W - 0.5 - (cols - 1) * 0.18) / cols;
  const ch  = (H - 1.35 - 0.38 - 0.58 - 0.18 - (rows - 1) * 0.15) / rows;

  problems.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = 0.25 + col * (cw2 + 0.18);
    const py = 2.05 + row * (ch + 0.15);
    card(slide, px, py, cw2, ch, { bg: C.lightGrey, border: p.color });
    slide.addShape(pptx.ShapeType.rect, {
      x: px, y: py, w: cw2, h: 0.28,
      fill: { color: p.color }, line: { color: p.color },
    });
    slide.addText(`${p.icon}  ${p.title}`, {
      x: px + 0.08, y: py + 0.01, w: cw2 - 0.16, h: 0.26,
      fontSize: 9.5, bold: true, color: C.white, fontFace: "Calibri",
    });
    slide.addText(p.body, {
      x: px + 0.1, y: py + 0.32, w: cw2 - 0.2, h: ch - 0.38,
      fontSize: 8.5, color: "333333", fontFace: "Calibri",
    });
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 5 – TECHNICAL ARCHITECTURE (FLOW WIREFRAME)
//  Style: horizontal flow diagram like the reference screenshot
//  Columns: DATA SOURCES → PROCESSING → APPLICATION LAYER → OUTPUT
// ════════════════════════════════════════════════════════════
(function buildTechArchFlow() {
  const slide = pptx.addSlide();

  // Dark background for the whole slide (like the reference)
  slide.background = { color: "0D1833" };

  addHeader(slide, "04  |  Technical Architecture", "End-to-end data flow — from source to delivery");
  addFooter(slide, 5, TOTAL_SLIDES);

  // ── Layout constants ────────────────────────────────────
  const BY = 1.28;                   // top of content area
  const BH = H - BY - 0.45;         // content height
  const BX = 0.22;                   // left margin
  const TW = W - 0.44;              // total usable width

  // Column definitions (proportional widths)
  const colDefs = [
    { label: "DATA SOURCES",     pct: 0.22 },
    { label: "DATA PROCESSING",  pct: 0.22 },
    { label: "APPLICATION LAYER",pct: 0.34 },
    { label: "OUTPUT",           pct: 0.18 },
  ];

  // Compute absolute x, w for each column (with 0.18" gap between)
  const GAP = 0.18;
  const totalGap = GAP * (colDefs.length - 1);
  const usableW = TW - totalGap;
  let curX = BX;
  const cols = colDefs.map(c => {
    const cw = usableW * c.pct;
    const col = { ...c, x: curX, w: cw };
    curX += cw + GAP;
    return col;
  });

  // ── Column header labels ─────────────────────────────────
  cols.forEach(col => {
    slide.addText(col.label, {
      x: col.x, y: BY + 0.05, w: col.w, h: 0.32,
      fontSize: 9, bold: true, color: C.teal,
      fontFace: "Calibri", align: "center",
    });
    // thin underline
    slide.addShape(pptx.ShapeType.line, {
      x: col.x, y: BY + 0.37, w: col.w, h: 0,
      line: { color: C.teal, width: 0.75 },
    });
  });

  // ── Helper: draw a dark wireframe box with title ─────────
  function wBox(slide, x, y, w, h, title, subtitle, opts = {}) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h, rectRadius: 0.06,
      fill: { color: opts.bg || "152244" },
      line: { color: opts.border || "2B5EA7", width: opts.bw || 1 },
    });
    if (title) {
      slide.addText(title, {
        x: x + 0.1, y: y + 0.08, w: w - 0.2, h: subtitle ? 0.3 : h - 0.16,
        fontSize: opts.titleSize || 9, bold: true,
        color: opts.titleColor || C.white,
        align: "center", valign: "middle", fontFace: "Calibri",
      });
    }
    if (subtitle) {
      slide.addText(subtitle, {
        x: x + 0.1, y: y + 0.36, w: w - 0.2, h: h - 0.44,
        fontSize: opts.subSize || 7.5, color: opts.subColor || "8BBCE8",
        align: "center", valign: "top", fontFace: "Calibri",
      });
    }
  }

  // ── Helper: draw right-pointing arrow between columns ────
  function arrow(slide, fromX, toX, midY) {
    slide.addShape(pptx.ShapeType.line, {
      x: fromX, y: midY, w: toX - fromX, h: 0,
      line: { color: C.arrowBlue, width: 1.5 },
    });
    // arrowhead triangle approximation
    slide.addText("▶", {
      x: toX - 0.18, y: midY - 0.12, w: 0.22, h: 0.24,
      fontSize: 8, color: C.arrowBlue, align: "center",
    });
  }

  // ── Helper: vertical down arrow ──────────────────────────
  function downArrow(slide, cx, fromY, toY) {
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: fromY, w: 0, h: toY - fromY,
      line: { color: C.arrowBlue, width: 1.5 },
    });
    slide.addText("▼", {
      x: cx - 0.11, y: toY - 0.18, w: 0.22, h: 0.2,
      fontSize: 8, color: C.arrowBlue, align: "center",
    });
  }

  // ════ COL 0: DATA SOURCES ════
  const c0 = cols[0];
  const c0y = BY + 0.45;

  // Top box: EPD Incentive File
  wBox(slide, c0.x, c0y, c0.w, 0.62,
    "EPD Incentive\nFile.xlsx",
    null,
    { bg: "1A2E5A", border: C.green, titleSize: 8.5 }
  );
  // Green "X" excel icon indicator
  slide.addShape(pptx.ShapeType.rect, {
    x: c0.x + 0.12, y: c0y + 0.12, w: 0.22, h: 0.22,
    fill: { color: C.green }, line: { color: C.green },
  });
  slide.addText("X", {
    x: c0.x + 0.12, y: c0y + 0.12, w: 0.22, h: 0.22,
    fontSize: 8, bold: true, color: C.white, align: "center",
  });

  // Middle: CSV Exports container
  const csvY = c0y + 0.78;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: c0.x, y: csvY, w: c0.w, h: 2.65, rectRadius: 0.06,
    fill: { color: "111E3C" }, line: { color: "2B5EA7", width: 0.75 },
  });
  slide.addText("CSV Exports", {
    x: c0.x + 0.08, y: csvY + 0.06, w: c0.w - 0.16, h: 0.26,
    fontSize: 8, bold: true, color: "8BBCE8", align: "center", fontFace: "Calibri",
  });
  const csvFiles = [
    "Staff_Input.csv", "Promo_Product.csv",
    "Summary_Calc.csv", "TCFA.csv", "TIC.csv",
  ];
  csvFiles.forEach((f, i) => {
    const fy = csvY + 0.35 + i * 0.44;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: c0.x + 0.08, y: fy, w: c0.w - 0.16, h: 0.36,
      rectRadius: 0.04,
      fill: { color: "1B3066" }, line: { color: "3B6CC5", width: 0.5 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: c0.x + 0.1, y: fy + 0.07, w: 0.14, h: 0.22,
      fill: { color: C.green }, line: { color: C.green },
    });
    slide.addText(f, {
      x: c0.x + 0.28, y: fy + 0.05, w: c0.w - 0.38, h: 0.26,
      fontSize: 7.5, color: C.white, fontFace: "Calibri",
    });
  });

  // Bottom: Manual Uploads
  const muY = csvY + 2.8;
  wBox(slide, c0.x, muY, c0.w, 0.52,
    "Manual Uploads",
    "Admin CSV ingestion",
    { bg: "1A2E5A", border: "2B5EA7", titleSize: 8.5 }
  );
  // upload icon
  slide.addText("⬆", {
    x: c0.x + 0.1, y: muY + 0.08, w: 0.26, h: 0.26,
    fontSize: 14, color: C.abbottBlue, align: "center",
  });

  // ════ COL 1: DATA PROCESSING ════
  const c1 = cols[1];
  const c1y = BY + 0.45;

  // PowerShell parser box
  wBox(slide, c1.x, c1y, c1.w, 1.1,
    "PowerShell\nParser Scripts",
    "CSV → structured data\nparse_data.ps1\nparse_detailed.ps1",
    { bg: "1A2E5A", border: "5B6DB0", titleSize: 9 }
  );
  // PS icon
  slide.addShape(pptx.ShapeType.roundRect, {
    x: c1.x + c1.w/2 - 0.18, y: c1y + 0.08, w: 0.36, h: 0.3, rectRadius: 0.04,
    fill: { color: "2244AA" }, line: { color: "2244AA" },
  });
  slide.addText(">_", {
    x: c1.x + c1.w/2 - 0.18, y: c1y + 0.08, w: 0.36, h: 0.3,
    fontSize: 9, bold: true, color: C.white, align: "center",
  });

  downArrow(slide, c1.x + c1.w / 2, c1y + 1.1, c1y + 1.42);

  // Supabase Migration node
  wBox(slide, c1.x, c1y + 1.42, c1.w, 0.72,
    "Supabase Migration\nSeed Pipeline",
    "seed_supabase.ts\nCSV → 13 DB tables",
    { bg: "1A2E5A", border: C.teal, titleSize: 8.5 }
  );

  downArrow(slide, c1.x + c1.w / 2, c1y + 2.14, c1y + 2.46);

  // JS Data Files (legacy / archival)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: c1.x, y: c1y + 2.46, w: c1.w, h: 1.5, rectRadius: 0.06,
    fill: { color: "111E3C" }, line: { color: "2B5EA7", width: 0.75 },
  });
  slide.addText("JS Data Files", {
    x: c1.x + 0.08, y: c1y + 2.52, w: c1.w - 0.16, h: 0.26,
    fontSize: 8, bold: true, color: "8BBCE8", align: "center", fontFace: "Calibri",
  });
  ["comprehensive_data.js", "data.js"].forEach((f, i) => {
    wBox(slide, c1.x + 0.08, c1y + 2.82 + i * 0.52, c1.w - 0.16, 0.42,
      f, null, { bg: "1B3066", border: "3B6CC5", titleSize: 7.5 }
    );
  });

  // ════ COL 2: APPLICATION LAYER ════
  const c2 = cols[2];
  const c2y = BY + 0.45;

  // Big outer container for the app layer (like the reference screenshot)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: c2.x, y: c2y, w: c2.w, h: BH - 0.65, rectRadius: 0.08,
    fill: { color: "0C1A3A" }, line: { color: C.abbottBlue, width: 1.5 },
  });

  // Next.js label at top
  slide.addText("Next.js 14  ·  App Router  ·  TypeScript", {
    x: c2.x + 0.12, y: c2y + 0.08, w: c2.w - 0.24, h: 0.26,
    fontSize: 7.5, bold: true, color: C.abbottBlue, align: "center", fontFace: "Calibri",
  });

  // Supabase Auth / Role Guard
  wBox(slide, c2.x + 0.12, c2y + 0.38, c2.w - 0.24, 0.48,
    "Supabase Auth  ·  Role Guard",
    "DVP  |  RBM  |  FLM  |  Med. Rep.",
    { bg: "1A2E5A", border: C.teal, titleSize: 8.5, subSize: 7.5 }
  );

  downArrow(slide, c2.x + c2.w / 2, c2y + 0.86, c2y + 1.1);

  // Filter Engine
  wBox(slide, c2.x + 0.12, c2y + 1.1, c2.w - 0.24, 0.44,
    "Filter Engine",
    "Year · Quarter · Rep · Promo Line · Country",
    { bg: "1A2E5A", border: "8BBCE8", titleSize: 9, subSize: 7.5 }
  );

  downArrow(slide, c2.x + c2.w / 2, c2y + 1.54, c2y + 1.76);

  // Dual-View Renderer
  wBox(slide, c2.x + 0.12, c2y + 1.76, c2.w - 0.24, 0.38,
    "Dual-View Renderer",
    null,
    { bg: "1B3066", border: "8BBCE8", titleSize: 9 }
  );

  // 5 module boxes (Detailed, Summary, etc.)
  downArrow(slide, c2.x + c2.w / 2, c2y + 2.14, c2y + 2.4);

  const modules = [
    { t: "Summary\nDashboard",    sub: "KPI cards\n86 Reps Live" },
    { t: "Detailed\nView",        sub: "Rep-level\nproduct breakdown" },
    { t: "Product\nPromo",        sub: "Portfolio vs\nPlan Achievement" },
    { t: "Sign-Off\nWorkflow",    sub: "Digital approval\ne-signature" },
    { t: "Staff\nDirectory",      sub: "Roster · Leave\nTracking" },
  ];
  const mw = (c2.w - 0.24 - (modules.length - 1) * 0.08) / modules.length;
  modules.forEach((m, i) => {
    const mx = c2.x + 0.12 + i * (mw + 0.08);
    wBox(slide, mx, c2y + 2.4, mw, 0.98,
      m.t, m.sub,
      { bg: "132040", border: "3B82F6", titleSize: 8, subSize: 7, subColor: "7AADE8" }
    );
  });

  // Export row at bottom
  downArrow(slide, c2.x + c2.w / 2, c2y + 3.38, c2y + 3.6);
  wBox(slide, c2.x + 0.12, c2y + 3.6, c2.w - 0.24, 0.4,
    "Export Engine  ·  Excel (XLSX)  ·  PDF",
    null,
    { bg: "1A2E5A", border: C.teal, titleSize: 8.5 }
  );

  // ════ COL 3: OUTPUT ════
  const c3 = cols[3];
  const c3y = BY + 0.45;

  const outputs = [
    { icon: "🖥️",  title: "Web\nDashboard UI",  sub: "Real-time\nincentive portal" },
    { icon: "📄",  title: "Incentive\nReports",  sub: "Per rep / per qtr\nbreakdown" },
    { icon: "📊",  title: "Export to\nExcel",    sub: "XLSX download\nper role scope" },
    { icon: "✅",  title: "Sign-Off\nRecord",    sub: "Digital audit\ntrail PDF" },
  ];
  const oh = (BH - 0.65 - outputs.length * 0.12) / outputs.length;
  outputs.forEach((o, i) => {
    const oy = c3y + i * (oh + 0.12);
    wBox(slide, c3.x, oy, c3.w, oh,
      o.title, o.sub,
      { bg: "152244", border: "2B5EA7", titleSize: 8.5, subSize: 7.5, subColor: "7AADE8" }
    );
    slide.addText(o.icon, {
      x: c3.x + c3.w / 2 - 0.22, y: oy + 0.08, w: 0.44, h: 0.36,
      fontSize: 16, align: "center",
    });
  });

  // ════ HORIZONTAL ARROWS between column panels ════
  const arrowMidY = BY + 0.45 + (BH - 0.65) / 2;

  // Col0 → Col1
  arrow(slide, c0.x + c0.w, c1.x, arrowMidY);
  // Col1 → Col2
  arrow(slide, c1.x + c1.w, c2.x, arrowMidY);
  // Col2 → Col3
  arrow(slide, c2.x + c2.w, c3.x, arrowMidY);
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 6 – RISKS
// ════════════════════════════════════════════════════════════
(function buildRisks() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "05  |  Risk Register", "Identified risks with mitigation strategies");
  addAccentBar(slide);
  addFooter(slide, 6, TOTAL_SLIDES);

  const colWidths = [0.55, 3.2, 1.0, 1.0, 5.4];
  const colX = [0.25, 0.8, 4.0, 5.0, 6.0];
  const headers = ["#", "Risk Description", "Likelihood", "Impact", "Mitigation Strategy"];

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.25, y: 1.35, w: W - 0.5, h: 0.4,
    fill: { color: C.navyDark }, line: { color: C.navyDark },
  });
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: colX[i] + 0.05, y: 1.37, w: colWidths[i] - 0.1, h: 0.36,
      fontSize: 9, bold: true, color: C.white, fontFace: "Calibri",
    });
  });

  const risks = [
    { id: "R01", desc: "Data quality issues from source CSVs (Cyrillic names, comma-formatted numbers, blank columns)", likelihood: "HIGH", impact: "HIGH", mitigation: "Pre-migration data cleanse script; strict TypeScript validators; QA pass comparing DB output vs. source Excel row-by-row.", lColor: C.red, iColor: C.red },
    { id: "R02", desc: "Supabase service outage or free-tier limitations during critical quarter close", likelihood: "LOW", impact: "HIGH", mitigation: "Export read-only Excel fallback at quarter open; Pro-tier upgrade SLA for go-live; nightly pg_dump backups to Supabase Storage.", lColor: C.green, iColor: C.red },
    { id: "R03", desc: "Scope creep from additional country onboarding (Georgia) or new promo lines mid-quarter", likelihood: "MED", impact: "MED", mitigation: "Change-control board approval required; modular schema allows country/region rows without structural changes; phased rollout plan.", lColor: C.orange, iColor: C.orange },
    { id: "R04", desc: "User adoption resistance from field force / managers accustomed to Excel workflows", likelihood: "MED", impact: "HIGH", mitigation: "Hypercare support during Q1 go-live; in-app contextual tooltips; role-specific training sessions (DVP, RBM, FLM); Excel export always available.", lColor: C.orange, iColor: C.red },
    { id: "R05", desc: "Delay in sign-off chain blocking quarterly payroll processing timelines", likelihood: "LOW", impact: "HIGH", mitigation: "Automated email reminders at 48hr & 24hr before deadline; escalation flag in DVP dashboard; offline approval workaround via PDF export.", lColor: C.green, iColor: C.red },
    { id: "R06", desc: "Security / unauthorized access to sensitive incentive data via misconfigured RLS policies", likelihood: "LOW", impact: "HIGH", mitigation: "Supabase Row Level Security enforced at DB layer; penetration test prior to launch; role tokens scoped per user; audit logs enabled.", lColor: C.green, iColor: C.red },
  ];

  risks.forEach((r, i) => {
    const ry = 1.76 + i * 0.75;
    const bg = i % 2 === 0 ? C.lightGrey : C.white;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.25, y: ry, w: W - 0.5, h: 0.72,
      fill: { color: bg }, line: { color: "CCCCCC" },
    });
    slide.addText(r.id, { x: colX[0] + 0.05, y: ry + 0.04, w: colWidths[0] - 0.1, h: 0.64, fontSize: 8.5, bold: true, color: C.navyDark, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addText(r.desc, { x: colX[1] + 0.04, y: ry + 0.04, w: colWidths[1] - 0.08, h: 0.64, fontSize: 8, color: "333333", valign: "middle", fontFace: "Calibri" });
    [{ val: r.likelihood, c: r.lColor, ci: 2 }, { val: r.impact, c: r.iColor, ci: 3 }].forEach(b => {
      slide.addShape(pptx.ShapeType.roundRect, { x: colX[b.ci] + 0.08, y: ry + 0.2, w: colWidths[b.ci] - 0.16, h: 0.32, rectRadius: 0.04, fill: { color: b.c }, line: { color: b.c } });
      slide.addText(b.val, { x: colX[b.ci] + 0.08, y: ry + 0.2, w: colWidths[b.ci] - 0.16, h: 0.32, fontSize: 8, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });
    });
    slide.addText(r.mitigation, { x: colX[4] + 0.06, y: ry + 0.04, w: colWidths[4] - 0.12, h: 0.64, fontSize: 7.5, color: "444444", valign: "middle", fontFace: "Calibri" });
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 7 – DEPENDENCY LIST
// ════════════════════════════════════════════════════════════
(function buildDependencies() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "06  |  Dependency Register", "External dependencies required for successful delivery");
  addAccentBar(slide);
  addFooter(slide, 7, TOTAL_SLIDES);

  const deps = [
    { cat: "Technology", id: "D01", name: "Supabase Project (Prod)", owner: "BSS / IT", duePhase: "Phase 1", status: "PENDING", desc: "Production Supabase project with Pro tier subscription. URL & service_role key required for DB schema deployment and seeding.", sColor: C.orange },
    { cat: "Technology", id: "D02", name: "Vercel Deployment Account", owner: "BSS / IT", duePhase: "Phase 2", status: "PENDING", desc: "Vercel Pro or Abbott-managed hosting for Next.js app. Custom domain (epd-incentive.abbott.com) DNS record required.", sColor: C.orange },
    { cat: "Technology", id: "D03", name: "GitHub Repository & CI/CD", owner: "BSS", duePhase: "Phase 1", status: "DONE", desc: "GitHub repo (Arslan664/EPD_Incentive_Calculator) is live. GitHub Actions workflow for lint, test, and Vercel deploy to be configured.", sColor: C.green },
    { cat: "Data", id: "D04", name: "Complete Q1–Q4 Source CSVs (all quarters)", owner: "Abbott KZ Team", duePhase: "Phase 1", status: "PARTIAL", desc: "Q1 2017 and Q2 2017 CSVs available. Q3/Q4 and 2018+ data required for full historical load. Georgia (Country 87) records needed.", sColor: C.orange },
    { cat: "Data", id: "D05", name: "BC_KZ_2017_V10_FINAL.XLSM (External Formulas)", owner: "Abbott KZ Team", duePhase: "Phase 1", status: "PENDING", desc: "Source Excel file containing linked formula definitions. Required to validate seed script accuracy before DB migration.", sColor: C.red },
    { cat: "People", id: "D06", name: "Abbott DVP Sign-Off on Roles & Access Matrix", owner: "Abbott Management", duePhase: "Phase 2", status: "PENDING", desc: "Formal approval of RBAC matrix: which role (DVP/RBM/FLM/Rep) sees which data — prerequisite for Supabase Auth configuration.", sColor: C.red },
    { cat: "People", id: "D07", name: "UAT Participants (FLMs & RBMs for pilot quarter)", owner: "Abbott KZ HR", duePhase: "Phase 3", status: "NOT STARTED", desc: "Minimum 3 FLMs + 1 RBM to conduct structured UAT against Q2 2017 data. Feedback window: 5 business days.", sColor: C.midGrey },
    { cat: "Process", id: "D08", name: "Exchange Rate Policy (LC/USD historical locking)", owner: "Abbott Finance", duePhase: "Phase 1", status: "PENDING", desc: "Decision required: lock historical rates per quarter at ingestion (Q1=314.79, Q2=332.70) or allow finance team override.", sColor: C.orange },
  ];

  const colWidths2 = [0.4, 0.55, 2.2, 1.1, 1.1, 0.9, 5.97];
  const colX2     = [0.25, 0.65, 1.2, 3.4, 4.5, 5.6, 6.5];
  const headers2  = ["CAT", "ID", "Dependency Name", "Owner", "Phase", "Status", "Description / Notes"];
  const catColors = { Technology: C.navyDark, Data: C.abbottBlue, People: C.green, Process: C.orange };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.25, y: 1.35, w: W - 0.5, h: 0.37,
    fill: { color: C.navyDark }, line: { color: C.navyDark },
  });
  headers2.forEach((h, i) => {
    slide.addText(h, { x: colX2[i] + 0.04, y: 1.37, w: colWidths2[i] - 0.08, h: 0.33, fontSize: 8.5, bold: true, color: C.white, fontFace: "Calibri", valign: "middle" });
  });

  deps.forEach((d, i) => {
    const ry2 = 1.73 + i * 0.61;
    const bg = i % 2 === 0 ? C.lightGrey : C.white;
    slide.addShape(pptx.ShapeType.rect, { x: 0.25, y: ry2, w: W - 0.5, h: 0.59, fill: { color: bg }, line: { color: "DDEEFF" } });
    slide.addShape(pptx.ShapeType.rect, { x: colX2[0] + 0.04, y: ry2 + 0.12, w: 0.32, h: 0.34, fill: { color: catColors[d.cat] || C.accent1 }, line: { color: catColors[d.cat] || C.accent1 } });
    slide.addText(d.cat[0], { x: colX2[0] + 0.04, y: ry2 + 0.12, w: 0.32, h: 0.34, fontSize: 7, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addText(d.id,   { x: colX2[1] + 0.04, y: ry2 + 0.04, w: colWidths2[1] - 0.08, h: 0.52, fontSize: 8, bold: true, color: C.navyDark, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addText(d.name, { x: colX2[2] + 0.04, y: ry2 + 0.04, w: colWidths2[2] - 0.08, h: 0.52, fontSize: 8, bold: true, color: C.navyDark, valign: "middle", fontFace: "Calibri" });
    slide.addText(d.owner, { x: colX2[3] + 0.04, y: ry2 + 0.04, w: colWidths2[3] - 0.08, h: 0.52, fontSize: 7.5, color: "444444", valign: "middle", fontFace: "Calibri" });
    slide.addText(d.duePhase, { x: colX2[4] + 0.04, y: ry2 + 0.04, w: colWidths2[4] - 0.08, h: 0.52, fontSize: 7.5, color: "444444", align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addShape(pptx.ShapeType.roundRect, { x: colX2[5] + 0.04, y: ry2 + 0.14, w: colWidths2[5] - 0.08, h: 0.3, rectRadius: 0.04, fill: { color: d.sColor }, line: { color: d.sColor } });
    slide.addText(d.status, { x: colX2[5] + 0.04, y: ry2 + 0.14, w: colWidths2[5] - 0.08, h: 0.3, fontSize: 6.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });
    slide.addText(d.desc, { x: colX2[6] + 0.05, y: ry2 + 0.04, w: colWidths2[6] - 0.1, h: 0.52, fontSize: 7.5, color: "333333", valign: "middle", fontFace: "Calibri" });
  });

  const legendItems = [
    { lbl: "DONE", c: C.green }, { lbl: "PARTIAL", c: C.orange },
    { lbl: "PENDING", c: C.orange }, { lbl: "NOT STARTED", c: C.midGrey }, { lbl: "CRITICAL", c: C.red },
  ];
  slide.addText("STATUS KEY:", { x: 0.25, y: H - 0.82, w: 1.0, h: 0.25, fontSize: 7.5, bold: true, color: C.navyDark, fontFace: "Calibri" });
  legendItems.forEach((li, i) => {
    const lx = 1.25 + i * 1.6;
    slide.addShape(pptx.ShapeType.roundRect, { x: lx, y: H - 0.82, w: 1.1, h: 0.22, rectRadius: 0.03, fill: { color: li.c }, line: { color: li.c } });
    slide.addText(li.lbl, { x: lx, y: H - 0.82, w: 1.1, h: 0.22, fontSize: 6.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });
  });
})();

// ════════════════════════════════════════════════════════════
//  SLIDE 8 – CURRENT PLATFORM PROTOTYPE
// ════════════════════════════════════════════════════════════
(function buildPrototypeWalkthrough() {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(slide, "07  |  Current Platform Prototype", "Live POC resolving critical pain points");
  addAccentBar(slide);
  addFooter(slide, 8, TOTAL_SLIDES);

  // Left panel: Prototype Features
  card(slide, 0.25, 1.35, 4.5, 5.3, { bg: C.navyDark, border: C.navyDark });
  slide.addText("POC HIGHLIGHTS", {
    x: 0.35, y: 1.45, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: C.white, fontFace: "Calibri",
  });
  
  const features = [
    { title: "Live Prototype", body: "Configured with Kazakhstan data across 8 quarters. Not just a mockup." },
    { title: "Role-Based Access", body: "Authentication restricts DVP vs RBM vs FLM to their authorized data scope only." },
    { title: "Data Scale", body: "Tracking 86 Medical Representatives, 15 Products, and 6 Promo Lines." },
    { title: "Modern Tech Stack", body: "Built on Next.js 14 (React) with a Supabase (PostgreSQL) backend." }
  ];

  features.forEach((f, i) => {
    const fy = 2.0 + i * 1.1;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y: fy, w: 0.08, h: 0.8,
      fill: { color: C.abbottBlue }, line: { color: C.abbottBlue },
    });
    slide.addText(f.title, {
      x: 0.55, y: fy, w: 4.0, h: 0.3,
      fontSize: 12, bold: true, color: C.white, fontFace: "Calibri",
    });
    slide.addText(f.body, {
      x: 0.55, y: fy + 0.35, w: 4.0, h: 0.45,
      fontSize: 10, color: "AACCEE", fontFace: "Calibri",
    });
  });

  // Right Panel: Walkthrough/UI Representation
  card(slide, 4.9, 1.35, 8.1, 5.3, { bg: C.lightGrey, border: C.accent1 });

  // Mock UI Header
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.1, y: 1.5, w: 7.7, h: 0.6, rectRadius: 0.05,
    fill: { color: C.white }, line: { color: "CCCCCC" }
  });
  slide.addText("👋 Good Evening, Arslan Sohail (Regional Manager)", {
    x: 5.2, y: 1.5, w: 5.0, h: 0.6,
    fontSize: 11, bold: true, color: C.navyDark, fontFace: "Calibri", valign: "middle"
  });

  // Mock KPI Cards
  const kpis = [
    { lbl: "Active Reps", val: "86" },
    { lbl: "Total Actual (LC)", val: "78.8M" },
    { lbl: "Total Incentive (LC)", val: "75.0M" },
    { lbl: "Overall Achievement", val: "112.3%" }
  ];
  
  const kpW = (7.7 - (kpis.length - 1) * 0.15) / kpis.length;
  kpis.forEach((k, i) => {
    const kx = 5.1 + i * (kpW + 0.15);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: kx, y: 2.25, w: kpW, h: 0.8, rectRadius: 0.05,
      fill: { color: C.white }, line: { color: "CCCCCC" }
    });
    slide.addText(k.lbl, {
      x: kx, y: 2.3, w: kpW, h: 0.3,
      fontSize: 8, color: "555555", align: "center", fontFace: "Calibri",
    });
    slide.addText(k.val, {
      x: kx, y: 2.6, w: kpW, h: 0.4,
      fontSize: 14, bold: true, color: C.abbottBlue, align: "center", fontFace: "Calibri",
    });
  });

  // Main UI Content area Mockup
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.1, y: 3.2, w: 7.7, h: 3.2, rectRadius: 0.05,
    fill: { color: C.white }, line: { color: "CCCCCC" }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.1, y: 3.2, w: 7.7, h: 0.4,
    fill: { color: "E8EEF5" }, line: { color: "E8EEF5" }
  });
  slide.addText("Live Modules Accessible to Role", {
    x: 5.2, y: 3.2, w: 5.0, h: 0.4,
    fontSize: 9, bold: true, color: C.navyDark, fontFace: "Calibri", valign: "middle"
  });

  const modules = [
    { title: "Performance Dashboard", desc: "Detailed summary and breakdowns" },
    { title: "Staff Directory", desc: "Manage reps, tracking leave, profiles" },
    { title: "Product Validation", desc: "View portoflio matrices and achievements" }
  ];
  
  modules.forEach((m, i) => {
    const my = 3.8 + i * 0.8;
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.3, y: my, w: 0.1, h: 0.6,
      fill: { color: C.green }, line: { color: C.green }
    });
    slide.addText(m.title, {
      x: 5.5, y: my, w: 7.0, h: 0.3,
      fontSize: 10, bold: true, color: C.navyDark, fontFace: "Calibri"
    });
    slide.addText(m.desc, {
      x: 5.5, y: my + 0.3, w: 7.0, h: 0.3,
      fontSize: 9, color: "666666", fontFace: "Calibri"
    });
  });
})();

// ── Write ───────────────────────────────────────────────────
const OUT = path.resolve(__dirname, "PPT/EPD_Executive_Summary_v3.pptx");
pptx.writeFile({ fileName: OUT })
  .then(() => console.log(`\n✅  PPT saved → ${OUT}\n`))
  .catch(err => console.error("❌  Error:", err));
