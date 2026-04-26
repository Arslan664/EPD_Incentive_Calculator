const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, ImageRun, PageBreak,
  Header, Footer, PageNumber, NumberFormat, LevelFormat, convertInchesToTwip
} = require("docx");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "proposal_assets");
const OUT = path.join(__dirname, "New Doc", "EPD_POC_User_Guide_and_Platform_Leverage_v1.docx");

const NAVY = "0B1F3A";
const BLUE = "0057A8";
const COBALT = "122D5A";
const WHITE = "FFFFFF";
const LIGHT = "D0DCE8";
const TEXT = "0F1827";
const MUTED = "5B6A9A";

function loadImage(filename) {
  const p = path.join(ASSETS, filename);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

function sectionHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: WHITE, font: "Calibri" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
  });
}

function subHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: NAVY, font: "Calibri" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE } },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri", ...opts })],
    spacing: { after: 120, line: 320 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri" })],
    spacing: { after: 80 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function imgPara(data, w, h, caption) {
  if (!data) return [body(`[Screenshot: ${caption} not available]`, { italics: true, color: MUTED })];
  return [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width: w, height: h }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
        left: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
        right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
      },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, size: 16, color: MUTED, italics: true, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

async function buildDoc() {
  const images = {
    login: loadImage("01_login.png"),
    landing: loadImage("02_landing.png"),
    perf: loadImage("03_performance.png"),
    summ: loadImage("04_summary.png"),
    adminBase: loadImage("admin_overview.png"),
    adminICP: loadImage("admin_icp.png"),
    adminTarget: loadImage("admin_target.png"),
    adminAppr: loadImage("admin_approval.png"),
    sim: loadImage("admin_simulator.png"),
    anltKPI: loadImage("analytics_kpi.png"),
    anltDist: loadImage("analytics_dist.png"),
    anltReg: loadImage("analytics_regression.png"),
    anltBust: loadImage("analytics_boombust.png")
  };

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          ],
        },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) } } },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Abbott EPD | POC User Guide & Leverage Report", bold: true, size: 18, color: NAVY, font: "Calibri" })],
              border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY } }
            })
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "CONFIDENTIAL  |  Page ", size: 16, color: MUTED, font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, font: "Calibri" }),
                new TextRun({ text: " of ", size: 16, color: MUTED, font: "Calibri" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED, font: "Calibri" }),
              ],
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } },
              spacing: { before: 120 },
            }),
          ],
        }),
      },
      children: [
        new Paragraph({ children: [new TextRun({ text: "", size: 20 })], spacing: { before: 0, after: 600 } }),
        new Paragraph({ children: [new TextRun({ text: "  EPD Incentive Platform", bold: true, size: 52, color: WHITE, font: "Calibri" })], shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY }, spacing: { before: 0, after: 0 } }),
        new Paragraph({ children: [new TextRun({ text: "  POC User Guide & Value Leverage", size: 28, color: "A0BFCE", font: "Calibri" })], shading: { type: ShadingType.SOLID, color: COBALT, fill: COBALT }, spacing: { before: 0, after: 480 } }),
        
        body("This document serves as the official demonstration guide for the working POC (Proof of Concept) and highlights the strategic leverage it provides to Abbott EPD over traditional, generic SaaS alternatives."),
        
        pageBreak(),
        
        sectionHeading("1. POC Module Walkthrough"),
        
        subHeading("Module 1: Authentication & Dashboard"),
        ...imgPara(images.login, 550, 310, "Secure Corporate Login"),
        body("The system authenticates users securely, instantly routing them to role-based environments (Regional Manager vs FLM vs Rep)."),
        ...imgPara(images.landing, 550, 340, "Interactive Dashboard with Live KPIs"),
        body("Live achievement metrics, top performers breakdown, and cross-quarter trends provided directly upon login."),

        pageBreak(),

        subHeading("Module 2: Real-time Performance Tracking"),
        ...imgPara(images.perf, 550, 330, "Performance Dashboard: Actual vs Plan"),
        body("Tracks granular performance per rep including product breakdown, quant/qual distributions, and TCFA contributions in real-time."),

        pageBreak(),

        subHeading("Module 3: Enterprise Admin Control Room"),
        ...imgPara(images.adminBase, 550, 310, "Admin Module Overview"),
        body("A centralized hub for HR and Finance to configure the engine without writing any code. Scale to 70+ countries directly through this UI."),
        
        ...imgPara(images.adminICP, 550, 310, "No-Code ICP Configuration Element"),
        bullet("Dynamic parameter control (e.g. 85/15 weighting adjustments)"),
        bullet("Direct Payout Grid editing logic (e.g. accelerating caps past 110%)"),

        pageBreak(),
        
        subHeading("Module 4: Workflow & Compliance"),
        ...imgPara(images.adminAppr, 550, 330, "Approval Chain Workflow Configuration"),
        body("Multi-tier approval sequences integrated natively. Set routing conditions passing through FLM > NM > HR > DVP dynamically depending on branch and scope."),

        pageBreak(),

        subHeading("Module 5: Executive Analytics & Simulators"),
        ...imgPara(images.sim, 550, 330, "Incentive Output Simulator"),
        body("Simulate 'What If' scenarios. Allow country managers to see raw payout predictions based on variable modeling."),
        
        ...imgPara(images.anltKPI, 550, 330, "Analytics: KPI Control"),
        ...imgPara(images.anltDist, 550, 330, "Analytics: Payout and Performance Distribution"),
        body("Visualize macro metrics such as Bell Curves, Boom/Bust analyses, and Pay-for-Performance Regression (R²) seamlessly mapping organizational health."),
        
        pageBreak(),

        sectionHeading("2. Value Leverage: Why This Beats SaaS"),
        subHeading("The Strategic Advantage"),
        body("Traditional SaaS models (like Xactly or Spiff) charge heavy per-seat licensing, enforce rigid generic algorithms, and still require millions in consulting fees for basic pharma alignments. The EPD Incentive Platform is a completely bespoke asset:"),
        bullet("100% IP Ownership: No annual recurring seat-license costs. Designed specifically for EPD's exact logic (e.g., precise TCFA splits and promo-lines)."),
        bullet("Absolute Flexibility: A custom generic engine cannot gracefully handle Abbott's unique global variation requirements without hacks. This POC handles it natively."),
        bullet("Modern Scale: Built on Next.js + PostgreSQL, this platform rivals top tier SaaS platforms in speed and UI, while remaining internally hosted, compliant, and infinitely moldable."),
        
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT, buffer);
  console.log("SUCCESS: " + OUT);
}

buildDoc().catch(console.error);
