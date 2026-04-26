const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, ImageRun, PageBreak,
  Header, Footer, PageNumber, NumberFormat, HorizontalPositionAlign,
  VerticalPositionAlign, TableOfContents, BookmarkStart, BookmarkEnd,
  ExternalHyperlink, UnderlineType, convertInchesToTwip, PageOrientation,
  LevelFormat, IndentationLevel
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Paths ────────────────────────────────────────────────────────────────────
const ASSETS = path.join(__dirname, "proposal_assets");
const OUT = path.join(__dirname, "New Doc", "ICM_Commercial_Proposal_v1_Final.docx");

// ─── Colors ───────────────────────────────────────────────────────────────────
const NAVY = "0B1F3A";
const BLUE = "0057A8";
const COBALT = "122D5A";
const WHITE = "FFFFFF";
const GRAY = "F0F4F8";
const LIGHT = "D0DCE8";
const GREEN = "0E7A4F";
const AMBER = "B45309";
const TEXT = "0F1827";
const MUTED = "5B6A9A";
const SUBTLE = "6B8499";

// ─── Helper: load image ───────────────────────────────────────────────────────
function loadImage(filename) {
  const p = path.join(ASSETS, filename);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

// ─── Helper: navy section heading ────────────────────────────────────────────
function sectionHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: WHITE, font: "Calibri" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
  });
}

// ─── Helper: sub heading ─────────────────────────────────────────────────────
function subHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: NAVY, font: "Calibri" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE } },
  });
}

function subHeading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: BLUE, font: "Calibri" })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
  });
}

// ─── Helper: body paragraph ──────────────────────────────────────────────────
function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri", ...opts })],
    spacing: { after: 120, line: 320 },
  });
}

// ─── Helper: bullet ──────────────────────────────────────────────────────────
function bullet(text, bold = false) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri", bold })],
    spacing: { after: 80 },
  });
}

// ─── Helper: note box ────────────────────────────────────────────────────────
function noteBox(text, color = BLUE) {
  return new Paragraph({
    children: [new TextRun({ text: "  ℹ  " + text + "  ", size: 18, color: WHITE, font: "Calibri", bold: true })],
    shading: { type: ShadingType.SOLID, color: color, fill: color },
    spacing: { before: 160, after: 160 },
    indent: { left: convertInchesToTwip(0.1) },
  });
}

// ─── Helper: page break ──────────────────────────────────────────────────────
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Helper: image paragraph ─────────────────────────────────────────────────
function imagePara(filename, w, h, caption) {
  const data = loadImage(filename);
  if (!data) return body(`[Screenshot: ${filename} not found]`, { italics: true, color: MUTED });
  const rows = [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width: w, height: h }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
    }),
  ];
  if (caption) {
    rows.push(new Paragraph({
      children: [new TextRun({ text: caption, size: 16, color: MUTED, italics: true, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }));
  }
  return rows;
}

// ─── Helper: build a styled table ────────────────────────────────────────────
function styledTable(headers, rows, headerColor = NAVY) {
  const makeCell = (text, isHeader, align = AlignmentType.LEFT, shade = null) =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text: String(text),
          bold: isHeader,
          size: isHeader ? 18 : 18,
          color: isHeader ? WHITE : TEXT,
          font: "Calibri",
        })],
        alignment: align,
        spacing: { before: 60, after: 60 },
      })],
      shading: shade
        ? { type: ShadingType.SOLID, color: shade, fill: shade }
        : isHeader
          ? { type: ShadingType.SOLID, color: headerColor, fill: headerColor }
          : {},
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        left: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        right: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
      },
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => makeCell(h, true)),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            makeCell(cell, false, AlignmentType.LEFT,
              ri % 2 === 1 ? "F0F4F8" : null)
          ),
        })
      ),
    ],
    margins: { top: convertInchesToTwip(0.05), bottom: convertInchesToTwip(0.05) },
  });
}

// ─── Helper: divider ─────────────────────────────────────────────────────────
function divider() {
  return new Paragraph({
    children: [new TextRun({ text: "" })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } },
    spacing: { before: 200, after: 200 },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

async function buildDoc() {
  const img01 = loadImage("01_login.png");
  const img02 = loadImage("02_landing.png");
  const img03 = loadImage("03_performance.png");
  const img04 = loadImage("04_summary.png");
  const img05 = loadImage("05_sign_off.png");
  const img06 = loadImage("06_staff.png");
  const img07 = loadImage("07_product_promo.png");

  const imgAdmin = loadImage("admin_overview.png");
  const imgTarget = loadImage("admin_target.png");
  const imgConfig = loadImage("admin_icp.png");
  const imgAnalyticsKPI = loadImage("analytics_kpi.png");
  const imgAnalyticsDist = loadImage("analytics_dist.png");
  const imgAnalyticsReg = loadImage("analytics_regression.png");
  const imgAnalyticsPay = loadImage("analytics_paydiff.png");
  const imgSimulator = loadImage("admin_simulator.png");


  function imgPara(data, w, h, caption) {
    if (!data) return [body(`[Screenshot not available]`, { italics: true, color: MUTED })];
    const result = [
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
    return result;
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: TEXT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.0),
              right: convertInchesToTwip(1.0),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
                rows: [new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "Abbott  |  EPD Incentive Management Platform", bold: true, size: 18, color: NAVY, font: "Calibri" })], alignment: AlignmentType.LEFT })],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: "CONFIDENTIAL", size: 16, color: MUTED, font: "Calibri", bold: true })], alignment: AlignmentType.RIGHT })],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    }),
                  ]
                })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "© 2026 Abbott Laboratories · EPD · All rights reserved  |  Page ", size: 16, color: MUTED, font: "Calibri" }),
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

          // ─── COVER PAGE ────────────────────────────────────────────────────
          new Paragraph({
            children: [new TextRun({ text: "", size: 20 })],
            spacing: { before: 0, after: 600 },
          }),

          // Navy banner
          new Paragraph({
            children: [new TextRun({ text: "  Abbott Laboratories", bold: true, size: 52, color: WHITE, font: "Calibri" })],
            shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
            spacing: { before: 0, after: 0 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "  Established Pharmaceuticals Division", size: 28, color: "A0BFCE", font: "Calibri" })],
            shading: { type: ShadingType.SOLID, color: COBALT, fill: COBALT },
            spacing: { before: 0, after: 480 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "EPD Incentive Management Platform", bold: true, size: 64, color: NAVY, font: "Calibri" })],
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Enterprise Proposal — Global Rollout for 70+ Countries", size: 28, color: BLUE, font: "Calibri", italics: true })],
            spacing: { after: 600 },
          }),

          divider(),

          new Paragraph({
            children: [],
            spacing: { after: 120 },
          }),

          // Cover meta table
          new Table({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
              left: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
              right: { style: BorderStyle.SINGLE, size: 4, color: LIGHT },
              insideH: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
              insideV: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
            },
            rows: [
              ["Prepared By", "Technology Solutions Team"],
              ["Document Version", "1.0 — Initial Client Pitch"],
              ["Classification", "Abbott Confidential"],
              ["Date", "April 2026"],
              ["Current POC", "Kazakhstan · 86 Reps · 8 Quarters"],
              ["Target Scale", "70+ Countries · 5,000–10,000 Reps"],
            ].map(([k, v]) => new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 18, color: NAVY, font: "Calibri" })], spacing: { before: 60, after: 60 } })],
                  shading: { type: ShadingType.SOLID, color: "EEF2F9", fill: "EEF2F9" },
                  margins: { left: 120, right: 120, top: 80, bottom: 80 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    left: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    right: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: v, size: 18, color: TEXT, font: "Calibri" })], spacing: { before: 60, after: 60 } })],
                  margins: { left: 120, right: 120, top: 80, bottom: 80 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    left: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                    right: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
                  },
                }),
              ],
            })),
          }),

          pageBreak(),

          // ─── 1. EXECUTIVE SUMMARY ──────────────────────────────────────────
          sectionHeading("1. Executive Summary"),
          body("Abbott's Established Pharmaceuticals Division (EPD) operates across 70+ countries with hundreds of sales representatives, multiple promo lines, and complex quarter-over-quarter incentive structures. Today, incentive calculations are managed through disconnected Excel models and manual approval chains — a process that is slow, error-prone, and impossible to audit at scale."),
          body("We propose to design, build, and deploy an enterprise-grade Sales Incentive Compensation (SIC) platform — purpose-built for Abbott EPD's pharmaceutical environment — that will deliver:"),
          bullet("Automate incentive calculations in real-time across all countries, promo lines, and products"),
          bullet("Enforce a multi-level digital approval workflow (NSM → GM → HR → Finance Director)"),
          bullet("Support country-by-country flexible compensation configurations"),
          bullet("Scale to 70+ countries through a phased rollout with a proven 4-country POC"),
          bullet("Deliver the intelligence of enterprise tools like Salesforce Spiff and Xactly Incent — at a fraction of the cost, without vendor lock-in, and tailored entirely to Abbott's model"),
          body(""),
          noteBox("The platform will serve as the single source of truth for all incentive data, eliminating manual reconciliation and cutting the monthly close cycle from 2–3 weeks to under 48 hours.", NAVY),

          pageBreak(),

          // ─── 2. THE PROBLEM ────────────────────────────────────────────────
          sectionHeading("2. The Problem We Solve"),
          subHeading("Current Pain Points"),
          styledTable(
            ["Pain Point", "Business Impact"],
            [
              ["Excel-based calculations per country", "High error rate, no version control"],
              ["No multi-level digital approval", "Signatures collected via paper/email"],
              ["No audit trail", "Compliance risk, SOX exposure"],
              ["Country configs hardcoded per file", "Impossible to scale to 70+ markets"],
              ["No real-time visibility for managers", "Blind spots between quarter close and payout"],
              ["No single platform for HR + Finance + Sales", "3 separate systems, manual reconciliation"],
              ["No standardized rep-level reporting", "Each country builds its own format"],
            ]
          ),
          body(""),
          noteBox("75.0M LC in total incentive payouts are currently managed through a manually intensive process. A 2% calculation error rate on this volume equates to millions in incorrect payouts annually. The risk of regulatory non-compliance, rep dissatisfaction, and lost productivity is compounding each quarter.", AMBER),

          pageBreak(),

          // ─── 3. CURRENT SOLUTION ───────────────────────────────────────────
          sectionHeading("3. Current Solution — What We Have Built"),
          body("We have built a fully functional working prototype of the EPD Incentive Platform using a modern, enterprise-ready tech stack. This is not a mockup — it is a live, data-connected application currently managing Kazakhstan EPD data across 86 representatives and 8 quarters."),
          body(""),
          subHeading("Technology Stack (Current POC)"),
          styledTable(
            ["Layer", "Technology"],
            [
              ["Frontend", "Next.js 16 (React, TypeScript)"],
              ["Database", "Supabase (PostgreSQL)"],
              ["Authentication", "Role-based session authentication"],
              ["Hosting", "Node.js / Vercel-compatible"],
              ["Data Integration", "CSV → SQL migration pipeline"],
              ["Export", "Excel export (XLSX)"],
            ]
          ),
          body(""),
          subHeading("Current Roles Supported"),
          styledTable(
            ["Role", "Access Level"],
            [
              ["Regional Manager", "Full access to all reps, all countries"],
              ["FLM (First Line Manager)", "Access restricted to own team only"],
              ["DVP", "Kazakhstan-specific records only"],
            ]
          ),
          body(""),
          subHeading("Current Data Coverage"),
          bullet("86 Medical Representatives tracked"),
          bullet("8 Quarters of data (Q1–Q4 across multiple years)"),
          bullet("6 Promo Lines configured: Line 1, Line 2, Line 2 Big Cities, Line 3 Big Cities, Pharma Line, Regional Manager-1"),
          bullet("15 Products tracked: CREON, HEPTRAL, DUPHASTON, DUPHALAC, PHYSIOTENS, FEMOSTON, BETASERC, GANATON, DUSPATALIN, IRS 19, IMUDON, OMACOR, TRICOR/LIPANTHYL, OVATEL, GASTRO"),

          pageBreak(),

          // ─── 4. USER GUIDE ─────────────────────────────────────────────────
          sectionHeading("4. User Guide — Current Platform Walkthrough"),
          body("The following pages provide a detailed walkthrough of every screen in the current EPD Incentive Platform prototype."),

          // Page 1 — Login
          subHeading("Page 1 — Login / Authentication"),
          ...(img01 ? imgPara(img01, 580, 330, "Figure 1: Abbott-branded login page with navy/cobalt gradient background") : [body("[Login screenshot]", { italics: true })]),
          body("What it shows:"),
          bullet("Abbott-branded login screen with navy/cobalt gradient background"),
          bullet("Corporate email authentication (yourname@abbott.com)"),
          bullet("Role is automatically assigned based on email mapping"),
          bullet("\"Authorized Personnel Only · Abbott Confidential\" security notice"),
          bullet("No password required in POC (email-only auth; full Azure AD SSO in production)"),
          body(""),
          subHeading3("Access Credentials Currently Configured"),
          styledTable(
            ["Email", "Name", "Role"],
            [
              ["arslansohail@abbott.com", "Arslan Sohail", "Regional Manager"],
              ["abdulmanan@abbott.com", "Abdul Manan", "FLM"],
              ["fahad.ayub@abbott.com", "Fahad Ayub", "FLM"],
            ]
          ),

          // Page 2 — Landing
          subHeading("Page 2 — Landing / Home Dashboard"),
          ...(img02 ? imgPara(img02, 580, 390, "Figure 2: Landing home dashboard with KPI cards, module navigation, and top performers panel") : [body("[Landing screenshot]", { italics: true })]),
          body("What it shows:"),
          bullet("Personalized greeting with role badge (e.g., \"Good evening, Arslan 👋\")"),
          bullet("Role & Region context: Regional Manager · Kazakhstan · EPD Programme"),
          bullet("Overall Achievement badge — live calculated (112.3% shown)"),
          bullet("4 Live KPI Cards: Active Reps (86), Total Actual (78.8M LC), Total Incentive (75.0M LC), Quarters Tracked (8)"),
          bullet("3 Module Navigation Cards: Performance Dashboard, Staff Directory, Product Promo"),
          bullet("Top 5 Performers ranked by % achievement (Kaderov Nursultan at 197%)"),

          pageBreak(),

          // Page 3 — Performance
          subHeading("Page 3 — Performance Dashboard (Actual vs Plan View)"),
          ...(img03 ? imgPara(img03, 580, 350, "Figure 3: Performance dashboard showing 86 reps with Actual vs Plan, product breakdown, TCFA score and final incentive") : [body("[Performance screenshot]", { italics: true })]),
          body("What it shows:"),
          bullet("Header KPI Strip: Overall Achievement (112.3%), Total Incentive (74.97M LC), Active Reps (86), Avg Target Base (966K LC)"),
          bullet("5-Dimension Filter Bar: Country, Year, Quarter (year-dependent), Promo Line, Representative (searchable)"),
          bullet("View Format Toggle: Actual vs Plan | Summary | To Sign"),
          body(""),
          subHeading3("Data Table Columns"),
          styledTable(
            ["Column", "Description"],
            [
              ["Representative", "Name, position, country with flag"],
              ["Team / Period", "Promo Line + Quarter"],
              ["Plan (LC)", "Target revenue in local currency"],
              ["Actual (LC)", "Achieved revenue with % badge (green/amber/red)"],
              ["Product Breakdown", "3 products with sub-bar progress (Actual/Plan each)"],
              ["TCFA %", "Coaching/field activity score"],
              ["Target Base", "Base incentive amount for the quarter"],
              ["Final Incentive (LC)", "Computed total incentive payout"],
            ]
          ),

          pageBreak(),

          // Page 4 — Summary
          subHeading("Page 4 — Summary View"),
          ...(img04 ? imgPara(img04, 580, 340, "Figure 4: Summary view with full incentive computation breakdown and Export to Excel button") : [body("[Summary screenshot]", { italics: true })]),
          body("A detailed financial computation table for all 86 representatives showing the full incentive calculation breakdown:"),
          body(""),
          styledTable(
            ["Column", "Description"],
            [
              ["No", "Row number"],
              ["Representative", "Name + Position"],
              ["Target Inc (QTR)", "Quarterly incentive target"],
              ["Reimb. %", "Reimbursable percentage"],
              ["Target Base LC", "Base incentive amount in local currency"],
              ["Target (Sales)", "Sales performance target"],
              ["P1 Val, P2 Val, P3 Val", "Product 1, 2, 3 achievement values"],
              ["Inc (Sales)", "Sales incentive earned"],
              ["Target (TCFA)", "Coaching/field work target"],
              ["Target (TIC)", "Total incentive coaching target"],
              ["Inc (TCFA) / Inc (TIC)", "TCFA and TIC incentives earned"],
              ["Field Work", "Field work incentive component"],
              ["Total Incentive (LC)", "Grand total incentive payout"],
            ]
          ),
          body(""),
          noteBox("Export to Excel button allows Finance team to download the full dataset instantly in XLSX format.", GREEN),

          pageBreak(),

          // Page 5 — Sign Off
          subHeading("Page 5 — Sign-Off / Statement of Bonuses"),
          ...(img05 ? imgPara(img05, 580, 350, "Figure 5: Statement of Bonuses — formal corporate document with Abbott letterhead and signature block") : [body("[Sign-off screenshot]", { italics: true })]),
          body("A formal corporate document — \"Statement of Bonuses\" — ready for management sign-off:"),
          bullet("Abbott Laboratories letterhead with EPD branding"),
          bullet("Region / Period context (e.g., All Regions · Q1 2017)"),
          bullet("Color-coded Payout vs Target badges: Green (≥100%), Amber (>0%), Red (0%)"),
          bullet("TOTAL SUMMARY aggregated row across all representatives"),
          body(""),
          subHeading3("5-Role Signature Block"),
          styledTable(
            ["Signatory Role", "Approval Authority"],
            [
              ["National Sales Manager", "Sales performance sign-off"],
              ["General Manager", "Country-level authority"],
              ["Regional SFE Director Turkey & CIS", "Regional oversight"],
              ["HR Manager", "Compensation validation"],
              ["CIS Finance Director EPD", "Final financial approval"],
            ]
          ),

          pageBreak(),

          // Page 6 — Staff
          subHeading("Page 6 — Staff Directory"),
          ...(img06 ? imgPara(img06, 580, 370, "Figure 6: Staff directory showing 86 reps with promo line assignments and quarterly availability") : [body("[Staff screenshot]", { italics: true })]),
          body("Complete staff roster for all 86 medical representatives:"),
          body(""),
          styledTable(
            ["Column", "Description"],
            [
              ["#", "Row number"],
              ["Name & Position", "Full name, job title, country"],
              ["Promo Line", "Assigned promotional line (badge-styled)"],
              ["Maternity", "Maternity leave status indicator"],
              ["Q1 / Q2 / Q3 / Q4", "Quarterly activity: ✓ = active, — = inactive"],
            ]
          ),
          bullet("Country filter dropdown to isolate specific markets"),
          bullet("Total staff count badge (86 Staff)"),
          bullet("Paginated display (10 records per page)"),
          bullet("Global header search inherited (search by name or position)"),

          pageBreak(),

          // Page 7 — Product Promo
          subHeading("Page 7 — Product Promo Analytics"),
          ...(img07 ? imgPara(img07, 580, 360, "Figure 7: Product Promo with 4 KPI cards, product performance table, and portfolio share configuration cards") : [body("[Product Promo screenshot]", { italics: true })]),
          body("Section A — Hero KPI Cards:"),
          styledTable(
            ["KPI", "Value", "Description"],
            [
              ["Total Products", "10", "Top N configurable (default 10)"],
              ["Total Plan (LC)", "32.6M", "Planned revenue across all products"],
              ["Total Actual (LC)", "36.2M", "Actual achieved revenue"],
              ["Overall Achievement", "111%", "Above target 🎯"],
            ]
          ),
          body(""),
          body("Section B — Product Performance Breakdown:"),
          bullet("Top N slicer (configurable, default 10 products)"),
          bullet("Sort by: Plan / Actual / Achievement"),
          bullet("Columns: #, Product, Promo Lines, Plan (LC), Actual (LC), Achievement (%, color-coded), Portfolio Share (% bar)"),
          body(""),
          body("Section C — Portfolio Share Configuration:"),
          bullet("Per Promo Line product weight breakdown with stacked bar visualizations"),
          bullet("Quarter filter for time-specific analysis"),
          bullet("Portfolio group compositions configurable per country/line"),

          pageBreak(),

          
          pageBreak(),

          subHeading("Page 8 — Admin Control Center"),
          ...(imgAdmin ? imgPara(imgAdmin, 580, 360, "Figure 8: Enterprise Admin Portal") : [body("[Admin Screenshot]")]),
          body("The Admin Control Center enables global governance over 70+ countries through a no-code interface. Key modules include:"),
          bullet("ICP Configuration: Control the 85/15 quant/qual splits dynamically per country/team."),
          bullet("Target Setting & Adjustments: Enable bulk CSV uploads and proration for field staff."),
          bullet("Approval Workflow Engine: Configurable 5-stage sign-off chains (FLM -> GM -> HR -> Finance)."),

          pageBreak(),

          subHeading("Page 9 — Executive Analytics"),
          ...(imgAnalyticsDist ? imgPara(imgAnalyticsDist, 580, 360, "Figure 9: Performance Distribution Analysis") : [body("[Analytics Screenshot]")]),
          body("Enterprise-grade analytics directly integrated into the platform for real-time strategic insights:"),
          bullet("Performance Distribution: Bell curve analysis of achievement percentiles across the field force."),
          bullet("Regression Analysis: Evaluating pay-for-performance correlation (R-squared index)."),
          bullet("Boom/Bust Analysis: Identifying longitudinal rep progression."),
          
          pageBreak(),
          
          subHeading("Page 10 — Real-Time Incentive Simulator"),
          ...(imgSimulator ? imgPara(imgSimulator, 580, 360, "Figure 10: Advanced Incentive Simulator") : [body("[Simulator Screenshot]")]),
          body("Scenario modeling tool allowing analysts and management to adjust plan parameters (payout curves, thresholds, accelerators) and instantly forecast financial impact before deployment."),


          // ─── 5. VISION ─────────────────────────────────────────────────────
          sectionHeading("5. Vision — Enterprise-Grade Platform (Spiff / Xactly Level)"),
          subHeading("Benchmarking vs. Salesforce Spiff & Xactly Incent"),
          styledTable(
            ["Capability", "Salesforce Spiff", "Xactly Incent", "Our EPD Platform"],
            [
              ["Real-time incentive calculation", "✅", "✅", "✅ Planned"],
              ["Multi-tier approval workflow", "✅", "✅", "✅ Planned"],
              ["Country-level config", "✅", "✅", "✅ Planned"],
              ["Custom formula builder", "✅", "✅", "✅ Planned"],
              ["CRM integration", "Salesforce only", "Salesforce/SAP", "✅ API-first"],
              ["White-labeled branding", "❌", "❌", "✅ Abbott branded"],
              ["Pharma-specific logic", "❌", "Partial", "✅ Built-in"],
              ["Per-country TCFA/TIC rules", "❌", "❌", "✅ Native"],
              ["Pricing model", "Per seat (high cost)", "Per seat (high cost)", "✅ Fixed-fee build"],
              ["Vendor lock-in", "High", "High", "✅ None — owned IP"],
              ["Time to add new country", "Weeks + consulting", "Weeks + consulting", "✅ Hours via admin UI"],
              ["Approval chain flexibility", "Rigid", "Configurable", "✅ Fully configurable"],
            ]
          ),
          body(""),

          subHeading("Key Differentiators"),
          subHeading3("1. Flexible Compensation Configuration Engine"),
          body("Every country can have unique, independently configured:"),
          bullet("Incentive formula parameters (Sales %, TCFA %, Field Work %)"),
          bullet("Product portfolio weights per Promo Line"),
          bullet("Reimbursable % rules by rep category and seniority"),
          bullet("Currency handling (LC ↔ USD conversion with live rates)"),
          bullet("Maternity/leave proration rules"),
          bullet("Quarter weighting (equal or stepped across Q1–Q4)"),
          body("All configurable via a no-code admin panel — no developer involvement needed for each new country."),
          body(""),

          subHeading3("2. Multi-Level Digital Approval Workflow"),
          body("The production platform will implement a fully digital, tracked approval chain:"),
          body(""),
          new Paragraph({
            children: [new TextRun({ text: "Rep Data Submitted  →  FLM Review  →  Regional Manager / NSM  →  General Manager  →  HR Manager  →  Finance Director  →  LOCKED & PAID", size: 18, color: WHITE, font: "Calibri", bold: true })],
            shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
          }),
          body(""),
          body("Features of the approval engine:"),
          bullet("Email notifications triggered at each stage transition"),
          bullet("Comments and rejection with mandatory reason field"),
          bullet("Full audit trail with timestamps and user attribution"),
          bullet("Delegation of authority during leave (auto-rerouting)"),
          bullet("Conditional routing for above-threshold payouts"),
          bullet("Bulk approval for standard low-risk records"),
          bullet("Mobile-friendly approval interface"),
          body(""),

          subHeading3("3. Multi-Tenant Global Architecture"),
          body("The system is built from Day 1 as a multi-tenant, multi-country platform — ready to onboard new countries without any code changes. Country configurations are stored as data, not code."),

          pageBreak(),

          // ─── 6. GLOBAL ROLLOUT ─────────────────────────────────────────────
          sectionHeading("6. Global Rollout Strategy — 70+ Countries"),
          subHeading("Overview"),
          styledTable(
            ["Metric", "Detail"],
            [
              ["Total target countries", "70+"],
              ["Estimated employees covered", "5,000–10,000 sales reps"],
              ["Current POC", "Kazakhstan (1 country, 86 reps)"],
              ["Phase 1 (POC Expansion)", "4 countries"],
              ["Phase 2 (Regional Rollout)", "20 countries"],
              ["Phase 3 (Global Scale)", "70+ countries"],
              ["Estimated full deployment", "24 months from Phase 1 kick-off"],
            ]
          ),
          body(""),
          subHeading("Suggested Phase 1 POC Countries"),
          body("Country selection criteria: mix of complexity, geographic spread, clean historical data, and local stakeholder buy-in."),
          body(""),
          styledTable(
            ["Country", "Rationale", "Complexity"],
            [
              ["Kazakhstan", "Already live — serve as reference model", "High"],
              ["UAE", "Regional HQ, high visibility, strong existing data", "Medium"],
              ["Pakistan", "Large rep base, complex promo lines", "High"],
              ["Egypt", "Africa hub, relatively standardized incentive model", "Medium"],
            ]
          ),
          body(""),
          subHeading("Country Onboarding Framework"),
          body("Each new country follows a standardized 4-week onboarding sprint:"),
          body(""),
          styledTable(
            ["Week", "Activities"],
            [
              ["Week 1", "Requirements gathering, formula collection, rep data export from local HR"],
              ["Week 2", "Country configuration build in admin panel, data migration and validation"],
              ["Week 3", "UAT with local NSM/HR team, approval chain setup and testing"],
              ["Week 4", "Go-live, user training sessions, hypercare period begins"],
            ]
          ),

          pageBreak(),

          // ─── 7. PHASED PROJECT PLAN ────────────────────────────────────────
          sectionHeading("7. Phased Project Plan"),

          subHeading("Phase 0 — Foundation & Architecture (Weeks 1–6)"),
          body("Goal: Transform the Kazakhstan POC into an enterprise-ready, multi-country architecture."),
          styledTable(
            ["Task", "Description", "Duration"],
            [
              ["Multi-tenant DB design", "Schema redesign for country isolation with Row-Level Security", "2 weeks"],
              ["Auth & RBAC overhaul", "Azure AD SSO integration, full role permission matrix", "1 week"],
              ["Admin configuration panel", "No-code country config UI for formula & portfolio setup", "2 weeks"],
              ["CI/CD pipeline", "Automated deployments, staging/prod environments", "1 week"],
            ]
          ),
          noteBox("Milestone M1: Production-ready platform deployed to staging with Kazakhstan migrated.", NAVY),
          body(""),

          subHeading("Phase 1 — POC: 4-Country Rollout (Weeks 7–20)"),
          body("Goal: Onboard 4 countries, validate compensation engine, implement full approval workflow."),
          styledTable(
            ["Task", "Description", "Duration"],
            [
              ["Multi-approval workflow engine", "Digital sign-off chain with full audit trail", "3 weeks"],
              ["Kazakhstan onboarding", "Migration + upgrade to enterprise schema", "1 week"],
              ["UAE onboarding", "Configuration + data migration", "1 week"],
              ["Pakistan onboarding", "Configuration + data migration", "1 week"],
              ["Egypt onboarding", "Configuration + data migration", "1 week"],
              ["POC UAT & stabilization", "User acceptance testing, bug fixes", "2 weeks"],
              ["Reporting & analytics enhancement", "Charts, trends, quarter-over-quarter comparisons", "2 weeks"],
            ]
          ),
          noteBox("Milestone M3: 4 countries live, 200+ reps managed, full digital approval operational.", NAVY),
          body(""),

          subHeading("Phase 2 — Regional Scale: 20 Countries (Months 6–12)"),
          body("Goal: Systematically onboard 16 additional countries using the proven POC framework."),
          styledTable(
            ["Task", "Description", "Duration"],
            [
              ["Batch country onboarding (4×4 sprints)", "4 countries per sprint across 4 sprints", "16 weeks"],
              ["Performance & scalability optimization", "DB indexing, caching, global CDN", "2 weeks"],
              ["Advanced analytics module", "Cohort analysis, trend forecasting, leaderboards", "4 weeks"],
              ["Mobile application", "iOS + Android apps for approvals and dashboards", "6 weeks"],
              ["ERP integration planning", "SAP/Oracle connectivity scoping", "3 weeks"],
            ]
          ),
          noteBox("Milestone M5: 20 countries live, 1,500+ reps managed, mobile app released.", NAVY),
          body(""),

          subHeading("Phase 3 — Global Deployment: 70+ Countries (Months 12–24)"),
          body("Goal: Complete global rollout, enterprise integrations, advanced AI-driven features."),
          styledTable(
            ["Task", "Description", "Duration"],
            [
              ["Bulk country onboarding", "50+ countries via template import", "20 weeks"],
              ["SAP/CRM integration", "Bi-directional data sync with ERP systems", "6 weeks"],
              ["AI-powered anomaly detection", "Flag unusual payout patterns automatically", "4 weeks"],
              ["Predictive quota setting", "ML-based target recommendations per rep", "6 weeks"],
              ["SOC 2 Type II compliance", "Full security audit and certification", "8 weeks"],
              ["Localization (15 languages)", "Full UI translation including RTL languages", "4 weeks"],
            ]
          ),
          noteBox("Milestone M7: Full global platform live, 70+ countries, 5,000+ reps managed, AI features active.", NAVY),

          pageBreak(),

          // ─── 8. RESOURCE PLAN ──────────────────────────────────────────────
          sectionHeading("8. Resource Plan & Team Structure"),
          subHeading("Core Team"),
          styledTable(
            ["Role", "Level", "Phase 0", "Phase 1", "Phase 2", "Phase 3"],
            [
              ["Solution Architect", "Senior", "100%", "50%", "25%", "25%"],
              ["Lead Full-Stack Developer", "Senior", "100%", "100%", "100%", "75%"],
              ["Backend Developer", "Mid", "100%", "100%", "100%", "100%"],
              ["Frontend Developer", "Mid", "50%", "100%", "100%", "75%"],
              ["DevOps / Cloud Engineer", "Mid", "75%", "50%", "50%", "25%"],
              ["Business Analyst", "Senior", "100%", "100%", "75%", "50%"],
              ["QA Engineer", "Mid", "50%", "100%", "100%", "75%"],
              ["UX Designer", "Mid", "50%", "50%", "25%", "25%"],
              ["Project Manager", "Senior", "100%", "100%", "100%", "100%"],
              ["Country Onboarding Specialist ×2", "Junior", "—", "100%", "100%", "100%"],
              ["Data Migration Engineer", "Mid", "100%", "100%", "75%", "50%"],
            ]
          ),
          body(""),
          subHeading("Extended Team (As Needed)"),
          bullet("Security / Compliance Consultant (Phase 3 — SOC 2)"),
          bullet("Mobile Developer — iOS + Android (Phase 2)"),
          bullet("ML/AI Engineer (Phase 3)"),
          bullet("Translation/Localization Vendor (Phase 3)"),
          bullet("SAP Integration Specialist (Phase 2–3)"),

          pageBreak(),

          // ─── 9. HOUR BREAKDOWN ─────────────────────────────────────────────
          sectionHeading("9. Hour Breakdown by Phase & Role"),

          subHeading("Phase 0 — Foundation & Architecture (6 Weeks)"),
          styledTable(
            ["Role", "Hours", "Key Activities"],
            [
              ["Solution Architect", "160", "Architecture design, tech decisions, schema design"],
              ["Lead Full-Stack Developer", "200", "Multi-tenant setup, auth system, core API"],
              ["Backend Developer", "200", "DB redesign, Supabase migration, API layer"],
              ["Frontend Developer", "80", "Admin panel foundation, design system"],
              ["DevOps Engineer", "120", "CI/CD, environments, Docker, secrets management"],
              ["Business Analyst", "160", "Requirements workshops, process mapping"],
              ["QA Engineer", "60", "Test plan setup, environment testing"],
              ["UX Designer", "80", "Admin UI wireframes, design system tokens"],
              ["Project Manager", "120", "Project setup, stakeholder comms, risk register"],
              ["Data Migration Engineer", "160", "POC data model migration, ETL pipeline"],
              ["PHASE 0 TOTAL", "1,340 hours", ""],
            ]
          ),
          body(""),

          subHeading("Phase 1 — POC: 4-Country Rollout (14 Weeks)"),
          styledTable(
            ["Role", "Hours", "Key Activities"],
            [
              ["Solution Architect", "140", "Approval engine design, country config schema"],
              ["Lead Full-Stack Developer", "400", "Approval workflow, notification engine, country admin"],
              ["Backend Developer", "400", "Multi-approval API, audit trail, country onboarding APIs"],
              ["Frontend Developer", "350", "Approval UI, country dashboards, reporting views"],
              ["DevOps Engineer", "120", "Multi-region deployment, monitoring, alerting"],
              ["Business Analyst", "280", "4-country requirements, UAT coordination"],
              ["QA Engineer", "240", "End-to-end test suites, UAT support"],
              ["UX Designer", "120", "Approval flow UI, mobile-first improvements"],
              ["Project Manager", "200", "Sprint management, stakeholder updates, go-live"],
              ["Country Onboarding Specialists ×2", "320", "Data collection, config build, local training"],
              ["Data Migration Engineer", "240", "4-country data migration and validation"],
              ["PHASE 1 TOTAL", "2,810 hours", ""],
            ]
          ),
          body(""),

          subHeading("Phase 2 — Regional Scale: 20 Countries (26 Weeks)"),
          styledTable(
            ["Role", "Hours", "Key Activities"],
            [
              ["Solution Architect", "200", "Scalability review, integration architecture"],
              ["Lead Full-Stack Developer", "600", "Analytics module, mobile API, performance optimization"],
              ["Backend Developer", "600", "Auto-scaling, caching, ERP integration planning"],
              ["Frontend Developer", "500", "Mobile-responsive overhaul, analytics charts"],
              ["DevOps Engineer", "300", "Load testing, CDN, global deployment infrastructure"],
              ["Business Analyst", "400", "16-country requirements, change management"],
              ["QA Engineer", "400", "Regression automation, performance testing"],
              ["UX Designer", "200", "Mobile UX design, analytics dashboard UI"],
              ["Project Manager", "400", "Sprint ceremonies, exec reporting, risk management"],
              ["Country Onboarding Specialists ×2", "800", "16 country onboardings (~50 hrs each)"],
              ["Data Migration Engineer", "400", "16-country data migrations"],
              ["Mobile Developer (iOS + Android)", "600", "Mobile application build and deployment"],
              ["PHASE 2 TOTAL", "5,400 hours", ""],
            ]
          ),
          body(""),

          subHeading("Phase 3 — Global Deployment: 70+ Countries (48 Weeks)"),
          styledTable(
            ["Role", "Hours", "Key Activities"],
            [
              ["Solution Architect", "300", "AI integration, SOC 2 prep, global architecture"],
              ["Lead Full-Stack Developer", "800", "AI/ML features, SAP integration, localization"],
              ["Backend Developer", "800", "Global scale, SAP connectors, anomaly detection"],
              ["Frontend Developer", "600", "15-language localization, AI dashboard features"],
              ["DevOps Engineer", "400", "Multi-region, 99.99% uptime, disaster recovery"],
              ["Business Analyst", "400", "50+ country requirements, training curriculum"],
              ["QA Engineer", "500", "Global regression, localization QA"],
              ["UX Designer", "200", "RTL language support, accessibility upgrade"],
              ["Project Manager", "600", "Global rollout coordination, executive reporting"],
              ["Country Onboarding Specialists ×4", "2,500", "50+ country onboardings"],
              ["Data Migration Engineer", "400", "Ongoing migrations + SAP sync"],
              ["ML/AI Engineer", "600", "Quota prediction model, anomaly detection"],
              ["Security Consultant", "300", "SOC 2 Type II, GDPR compliance audit"],
              ["PHASE 3 TOTAL", "8,400 hours", ""],
            ]
          ),
          body(""),

          subHeading("Total Project Hour Summary"),
          styledTable(
            ["Phase", "Duration", "Hours", "Cumulative Hours"],
            [
              ["Phase 0 — Foundation", "6 weeks", "1,340", "1,340"],
              ["Phase 1 — 4-Country POC", "14 weeks", "2,810", "4,150"],
              ["Phase 2 — 20 Countries", "26 weeks", "5,400", "9,550"],
              ["Phase 3 — 70+ Countries", "48 weeks", "8,400", "17,950"],
              ["GRAND TOTAL", "~24 months", "17,950 hrs", "17,950"],
            ]
          ),

          pageBreak(),

          // ─── 10. PROJECT MANAGEMENT ────────────────────────────────────────
          sectionHeading("10. Project Management Approach"),
          subHeading("Methodology: Agile-Waterfall Hybrid"),
          body("We will use a hybrid delivery model combining the structure of Waterfall for phase-level architecture decisions with the flexibility of Agile Scrum within each phase."),
          bullet("Waterfall: Fixed phase milestones, architecture sign-offs, waterfall-gated go/no-go reviews"),
          bullet("Agile Scrum: 2-week sprints within each phase with continuous delivery"),
          body(""),

          subHeading("Sprint Structure"),
          styledTable(
            ["Event", "Timing", "Duration"],
            [
              ["Sprint Planning", "Day 1 of every sprint", "2 hours"],
              ["Daily Standup", "Every business day", "15 minutes"],
              ["Sprint Review & Demo", "Day 14 of every sprint", "1 hour"],
              ["Sprint Retrospective", "Day 14 of every sprint", "45 minutes"],
            ]
          ),
          body(""),

          subHeading("Governance Model"),
          styledTable(
            ["Meeting", "Frequency", "Participants"],
            [
              ["Steering Committee", "Monthly", "CTO, NSM, HR Director, Finance Director, PM"],
              ["Country Sponsor Review", "Bi-weekly", "Country GM, Regional Manager, PM, BA"],
              ["Technical Review", "Weekly", "Solution Architect, Lead Dev, DevOps"],
              ["Sprint Demo", "Bi-weekly", "All stakeholders"],
              ["Risk Review", "Monthly", "PM, Solution Architect, Country Sponsors"],
            ]
          ),
          body(""),

          subHeading("Key Milestones"),
          styledTable(
            ["Milestone", "Target", "Success Criteria"],
            [
              ["M0 — Architecture Approved", "Week 2", "Sign-off from CTO + Solution Architect"],
              ["M1 — Foundation Complete", "Week 6", "Multi-tenant platform staging-deployed"],
              ["M2 — Approval Engine Live", "Week 10", "Digital approval chain tested end-to-end"],
              ["M3 — 4-Country POC Live", "Week 20", "4 countries active, 200+ reps managed"],
              ["M4 — POC Business Review", "Week 22", "Stakeholder sign-off on POC outcomes"],
              ["M5 — 20-Country Go-Live", "Month 12", "20 countries, 1,500+ reps managed"],
              ["M6 — Mobile App Launch", "Month 12", "iOS + Android apps in app stores"],
              ["M7 — Global Platform Live", "Month 24", "70+ countries, 5,000+ reps managed"],
            ]
          ),
          body(""),

          subHeading("Change Management & Training"),
          body("Each country rollout includes a structured change management package:"),
          bullet("Train-the-Trainer sessions for local HR/NSM (4 hours per country)"),
          bullet("End-user role-specific video guides (5–10 min per module)"),
          bullet("Quick-reference laminated card for each role (1-pager)"),
          bullet("Helpdesk ticketing system integration for issue logging"),
          bullet("30-day hypercare period with dedicated support post-go-live"),

          pageBreak(),

          // ─── 11. ARCHITECTURE ──────────────────────────────────────────────
          sectionHeading("11. Technology Architecture"),
          subHeading("Key Technology Decisions"),
          styledTable(
            ["Decision", "Choice", "Rationale"],
            [
              ["Frontend", "Next.js 16 (TypeScript)", "Proven, SEO-ready, TypeScript native, already built"],
              ["Database", "PostgreSQL (Supabase)", "Row-level security, real-time subscriptions, scalable"],
              ["Authentication", "Azure AD SSO", "Enterprise SSO, Abbott corporate standard"],
              ["Hosting", "AWS Multi-region", "99.99% SLA, HIPAA/GDPR compliance capability"],
              ["Mobile", "React Native", "Single codebase covers iOS + Android"],
              ["Notifications", "SendGrid + Firebase", "Email + push notification coverage"],
              ["Monitoring", "Datadog", "Real-time APM, error tracking, alerting dashboards"],
              ["Security", "SOC 2 Type II", "Enterprise compliance requirement for global rollout"],
              ["API Gateway", "Kong", "Rate limiting, auth, multi-tenant routing"],
            ]
          ),
          body(""),
          subHeading("Enterprise Architecture Layers"),
          bullet("Global CDN (Cloudflare) — edge caching, DDoS protection, global routing"),
          bullet("Web App + Mobile App + Admin Portal — Next.js 16 + React Native"),
          bullet("API Gateway (Kong) — rate limiting, auth validation, request routing"),
          bullet("Incentive Engine — TypeScript calculation engine, formula processor"),
          bullet("Approval Service — state machine, notification triggers, audit logger"),
          bullet("Notification Service — SendGrid email + Firebase push"),
          bullet("PostgreSQL (Supabase) — multi-tenant DB with row-level security per country"),
          bullet("SSO Provider (Azure AD / Okta) — enterprise identity management"),
          bullet("SAP/ERP Connector — bi-directional sync for Phase 3"),
          bullet("Data Lake (S3 + BigQuery) — historical analytics, AI model training"),

          pageBreak(),

          // ─── 12. RISK REGISTER ─────────────────────────────────────────────
          sectionHeading("12. Risk Register"),
          styledTable(
            ["Risk", "Probability", "Impact", "Mitigation Strategy"],
            [
              ["Country data quality issues", "High", "High", "Dedicated data audit sprint before each onboarding"],
              ["SSO integration delays", "Medium", "High", "Phase 0 prototype with email auth fallback"],
              ["Stakeholder UAT availability", "Medium", "Medium", "UAT windows pre-booked 4 weeks in advance"],
              ["Formula complexity per country", "High", "Medium", "Modular formula engine with country-override capability"],
              ["Scope creep from country-specific requests", "High", "Medium", "Formal change control board and backlog grooming"],
              ["Performance at 5,000+ users", "Low", "High", "Load testing at Phase 2, auto-scaling infra"],
              ["SAP integration complexity", "Medium", "High", "Discovery sprint before Phase 3 kick-off"],
              ["Key personnel dependency", "Low", "High", "Knowledge transfer sessions and documentation sprints"],
            ]
          ),

          pageBreak(),

          // ─── 13. INVESTMENT SUMMARY ────────────────────────────────────────
          sectionHeading("13. Investment Summary"),
          noteBox("Note: Pricing below is indicative based on team composition and hours. Final pricing subject to commercial agreement.", MUTED),
          body(""),

          subHeading("Phase Investment Estimate"),
          styledTable(
            ["Phase", "Hours", "Indicative Cost (USD)", "Timeline"],
            [
              ["Phase 0 — Foundation", "1,340 hrs", "$67,000 – $80,400", "6 weeks"],
              ["Phase 1 — 4-Country POC", "2,810 hrs", "$140,500 – $168,600", "14 weeks"],
              ["Phase 2 — 20 Countries", "5,400 hrs", "$270,000 – $324,000", "26 weeks"],
              ["Phase 3 — 70+ Countries", "8,400 hrs", "$420,000 – $504,000", "48 weeks"],
              ["TOTAL PROGRAM", "17,950 hrs", "$897,500 – $1,077,000", "~24 months"],
            ]
          ),
          body(""),

          subHeading("Build vs Buy Comparison"),
          styledTable(
            ["Solution", "Year 1 Cost", "Year 2+ Annual Cost", "Abbott IP", "Vendor Lock-in"],
            [
              ["Salesforce Spiff", "$300K–$1M+", "$200K+ per year (per seat)", "None", "High"],
              ["Xactly Incent", "$500K–$2M+", "$300K+ per year", "None", "High"],
              ["Our Custom Platform", "$208K (P0+P1)", "Maintenance only", "Full ownership", "None"],
            ]
          ),
          body(""),
          noteBox("The business case is clear: A custom build pays for itself in Year 1 vs Xactly Incent licensing alone — and Abbott retains full IP ownership, zero per-seat costs, and complete control over future changes.", GREEN),

          pageBreak(),

          // ─── CLOSING ───────────────────────────────────────────────────────
          new Paragraph({
            children: [new TextRun({ text: "  Next Steps", bold: true, size: 36, color: WHITE, font: "Calibri" })],
            shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
            spacing: { before: 200, after: 200 },
          }),
          body("We are ready to move forward immediately. The recommended path forward is:"),
          body(""),
          bullet("Step 1: Executive presentation and Q&A session (1 week)", true),
          bullet("Step 2: Sign-off on Phase 0 scope and commercial terms (1 week)", true),
          bullet("Step 3: Kick off Phase 0 — Architecture & Foundation (Week 1 start)", true),
          bullet("Step 4: POC country selection finalized with regional leadership (within 2 weeks)", true),
          body(""),
          divider(),
          new Paragraph({
            children: [new TextRun({ text: "Technology Solutions Team  |  Abbott EPD · Emerging Markets", size: 18, color: MUTED, font: "Calibri", italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "arslansohail@abbott.com", size: 18, color: BLUE, font: "Calibri" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "© 2026 Abbott Laboratories · Established Pharmaceuticals Division · All Rights Reserved", size: 16, color: SUBTLE, font: "Calibri" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "This document is confidential and intended solely for authorized Abbott personnel and its named recipients.", size: 16, color: SUBTLE, font: "Calibri", italics: true })],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT, buffer);
  console.log("SUCCESS: " + OUT);
}

buildDoc().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
