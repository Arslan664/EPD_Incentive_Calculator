/*
  build_final_docs.js
  Generates:
    1. New Doc/ICM_Commercial_Proposal_FINAL.docx    – Full commercial proposal with screenshots
    2. New Doc/EPD_POC_User_Guide_FINAL.docx         – Standalone POC User Guide & Leverage doc
*/
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, ImageRun, PageBreak,
  Header, Footer, PageNumber, LevelFormat, convertInchesToTwip, UnderlineType
} = require("docx");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "proposal_assets");
const OUT_DIR = path.join(__dirname, "New Doc");

// ── Colors ────────────────────────────────────────────────────────────────────
const NAVY   = "0B1F3A";
const COBALT = "122D5A";
const BLUE   = "0057A8";
const WHITE  = "FFFFFF";
const GRAY   = "F0F4F8";
const LIGHT  = "D0DCE8";
const GREEN  = "0E7A4F";
const AMBER  = "B45309";
const RED    = "B91C1C";
const TEXT   = "0F1827";
const MUTED  = "6B8499";

// ── Helpers ───────────────────────────────────────────────────────────────────
function L(filename) {
  const p = path.join(ASSETS, filename);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

function navyHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text: "  " + text, bold: true, size: 30, color: WHITE, font: "Calibri" })],
    spacing: { before: 400, after: 180 },
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
  });
}

function blueHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: NAVY, font: "Calibri" })],
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
  });
}

function subH(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: BLUE, font: "Calibri" })],
    spacing: { before: 220, after: 80 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri", ...opts })],
    spacing: { after: 100, line: 320 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20, color: TEXT, font: "Calibri" })],
    spacing: { after: 70 },
  });
}

function keyValue(key, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: key + ":  ", bold: true, size: 20, color: NAVY, font: "Calibri" }),
      new TextRun({ text: value, size: 20, color: TEXT, font: "Calibri" }),
    ],
    spacing: { after: 80 },
  });
}

function pb() { return new Paragraph({ children: [new PageBreak()] }); }

function spacer(n = 120) {
  return new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: n } });
}

function imgBlock(filename, w, h, caption) {
  const data = L(filename);
  if (!data) {
    return [
      new Paragraph({
        children: [new TextRun({ text: `[ Screenshot: ${filename} ]`, size: 18, color: MUTED, italics: true, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
      }),
    ];
  }
  const rows = [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width: w, height: h }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 60 },
      border: {
        top:    { style: BorderStyle.SINGLE, size: 3, color: LIGHT },
        bottom: { style: BorderStyle.SINGLE, size: 3, color: LIGHT },
        left:   { style: BorderStyle.SINGLE, size: 3, color: LIGHT },
        right:  { style: BorderStyle.SINGLE, size: 3, color: LIGHT },
      },
    }),
  ];
  if (caption) {
    rows.push(new Paragraph({
      children: [new TextRun({ text: caption, size: 16, color: MUTED, italics: true, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }
  return rows;
}

function styledTable(headers, rows) {
  const makeCell = (txt, isHdr, shadeColor) =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: String(txt), bold: isHdr, size: 18, color: isHdr ? WHITE : TEXT, font: "Calibri" })],
        spacing: { before: 60, after: 60 },
        alignment: isHdr ? AlignmentType.CENTER : AlignmentType.LEFT,
      })],
      shading: shadeColor ? { type: ShadingType.SOLID, color: shadeColor, fill: shadeColor } : {},
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      borders: {
        top:    { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        left:   { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
        right:  { style: BorderStyle.SINGLE, size: 2, color: LIGHT },
      },
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(h => makeCell(h, true, NAVY)) }),
      ...rows.map((row, i) =>
        new TableRow({ children: row.map(c => makeCell(c, false, i % 2 === 1 ? GRAY : null)) })
      ),
    ],
  });
}

function infoBox(text, color = BLUE) {
  return new Paragraph({
    children: [new TextRun({ text: "  ℹ  " + text + "  ", size: 18, color: WHITE, bold: true, font: "Calibri" })],
    shading: { type: ShadingType.SOLID, color, fill: color },
    spacing: { before: 160, after: 160 },
    indent: { left: convertInchesToTwip(0.1) },
  });
}

function makeHeader(title) {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE },
          insideV: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY }
        },
        rows: [new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Abbott  |  " + title, bold: true, size: 18, color: NAVY, font: "Calibri" })] })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CONFIDENTIAL", size: 16, color: MUTED, bold: true, font: "Calibri" })], alignment: AlignmentType.RIGHT })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
        ]})],
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      children: [
        new TextRun({ text: "© 2026 Abbott Laboratories  ·  EPD Incentive Platform  ·  All rights reserved     Page ", size: 16, color: MUTED, font: "Calibri" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, font: "Calibri" }),
        new TextRun({ text: " of ", size: 16, color: MUTED, font: "Calibri" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED, font: "Calibri" }),
      ],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } },
      spacing: { before: 120 },
    })],
  });
}

const pageProps = {
  page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) } }
};

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 1 — ICM Commercial Proposal FINAL
// ══════════════════════════════════════════════════════════════════════════════
async function buildCommercialProposal() {
  const doc = new Document({
    sections: [{
      properties: pageProps,
      headers: { default: makeHeader("ICM Commercial Proposal  ·  v1.0 Final") },
      footers: { default: makeFooter() },
      children: [

        // ── COVER ────────────────────────────────────────────────────────────
        spacer(600),
        new Paragraph({ children: [new TextRun({ text: "  Abbott Laboratories", bold: true, size: 60, color: WHITE, font: "Calibri" })], shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY }, spacing: { before: 0, after: 0 } }),
        new Paragraph({ children: [new TextRun({ text: "  Established Pharmaceuticals Division  ·  Commercial Excellence", size: 26, color: "A0BFCE", font: "Calibri" })], shading: { type: ShadingType.SOLID, color: COBALT, fill: COBALT }, spacing: { before: 0, after: 480 } }),
        new Paragraph({ children: [new TextRun({ text: "Incentive Compensation Management Platform", bold: true, size: 72, color: NAVY, font: "Calibri" })], spacing: { before: 0, after: 160 } }),
        new Paragraph({ children: [new TextRun({ text: "Commercial & Financial Proposal  ·  Phase 1 — Four Countries Rollout  ·  v1.0", size: 26, color: BLUE, italics: true, font: "Calibri" })], spacing: { after: 400 } }),
        new Paragraph({ children: [new TextRun({ text: "", size: 20 })], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } }, spacing: { before: 100, after: 300 } }),
        styledTable(
          ["Field", "Details"],
          [
            ["Prepared By", "BSS Universal"],
            ["Prepared For", "EPD Commercial Excellence"],
            ["Version", "v1.0  —  Final"],
            ["Date", "April 2026"],
            ["Validity", "90 days from date of issue"],
            ["Phase 1 Investment", "$592,500 USD"],
            ["Total Scope", "4 Phases  ·  47+ Countries  ·  Web + Mobile + Admin"],
            ["Classification", "CONFIDENTIAL — DO NOT DISTRIBUTE"],
          ]
        ),
        pb(),

        // ── 1. INTRODUCTION ──────────────────────────────────────────────────
        navyHeading("1.  Introduction"),
        body("This Commercial and Financial Proposal presents a complete, end-to-end solution for the deployment of an Incentive Compensation Management (ICM) platform across all 47+ EPD commercial markets in four structured phases spanning Q2 2026 to Q4 2027."),
        spacer(80),
        body("The proposal is structured around EPD's One ICP Guidelines 2026, which mandate a unified, digitalized approach to incentive compensation — covering all eight commercial function types — with embedded OEC compliance controls, a standardized 85/15 quantitative/qualitative split, and a configurable payout engine running from 70% at 90% ACH to 250% at 120% ACH."),
        spacer(160),
        blueHeading("1.1  Four-Phase Rollout Strategy"),
        styledTable(
          ["Phase", "Countries", "Geography", "Timeline", "Investment"],
          [
            ["Phase 1", "Egypt, Saudi Arabia, Algeria, Kazakhstan", "CIS + MENA Pilot", "Q2–Q4 2026", "$592,500"],
            ["Phase 2", "Brazil, Mexico, Colombia, Chile, Peru, Ecuador, Argentina, UAE, Kuwait, Bahrain, Qatar, Oman, Iraq", "Latam + Gulf", "Q1–Q2 2027", "TBD"],
            ["Phase 3", "Russia ×2, Ukraine, Armenia, Azerbaijan, Georgia, Moldova + Jordan, Lebanon, Morocco, South Africa, Pakistan, Turkey, Indonesia, China", "CIS + Levant + Africa + SE Asia", "Q2–Q3 2027", "TBD"],
            ["Phase 4", "South Korea, Hong Kong, Taiwan, Singapore, Malaysia, Vietnam", "APAC", "Q4 2027", "TBD"],
            ["TOTAL", "47+ countries", "Global", "Q2 2026 – Q4 2027", "Multi-phase"],
          ]
        ),
        spacer(160),
        blueHeading("1.2  Scope"),
        body("Each phase covers full design, development, testing, deployment and hypercare of:"),
        bullet("Web Application — for reps and managers with real-time KPI dashboards"),
        bullet("Mobile Application — for field force (iOS & Android)"),
        bullet("Admin Portal — for global governance, no-code configuration, and compliance"),
        infoBox("Phase 1 deliverables establish the core platform. Phases 2–4 onboard new countries using the same platform via the no-code Country Configuration Wizard."),
        pb(),

        // ── 2. PLATFORM MODULES — SCREENSHOTS ────────────────────────────────
        navyHeading("2.  Platform Modules — Visual Walkthrough"),
        body("Below is a detailed visual walkthrough of every screen in the working POC, currently live with Kazakhstan EPD data covering 86 representatives across 8 quarters."),
        spacer(100),

        // 2.1 Login
        blueHeading("Module 1 — Secure Login & Authentication"),
        ...imgBlock("p_01_login.png", 580, 340, "Figure 1: Abbott-branded login portal with corporate SSO"),
        body("The secure login page authenticates users using their corporate Abbott email, automatically routing them to role-appropriate dashboards."),
        bullet("Abbott-branded UI with navy/cobalt gradient and corporate wordmark"),
        bullet("Email-based authentication mapped to roles: Regional Manager, FLM, Representative"),
        bullet("Security notice: 'Authorized Personnel Only · Abbott Confidential'"),
        bullet("Production-ready for Azure AD SSO integration"),
        spacer(100),
        keyValue("Access Credentials (POC)", "arslansohail@abbott.com → Regional Manager  |  abdulmanan@abbott.com → FLM"),
        pb(),

        // 2.2 Dashboard
        blueHeading("Module 2 — Executive Home Dashboard"),
        ...imgBlock("p_02_dashboard.png", 580, 360, "Figure 2: Personalized executive dashboard with live KPI cards and top performers panel"),
        body("Upon login, users land on a personalized dashboard showing real-time aggregated KPIs, top performers, and quick navigation to all platform sections."),
        bullet("Personalized greeting with role badge and region context (e.g., Regional Manager · Kazakhstan)"),
        bullet("Overall Achievement Badge — dynamically calculated (112.3% shown)"),
        bullet("4 Live KPI Cards: Active Reps (86), Total Actual (78.8M LC), Total Incentive (75.0M LC), Quarters Tracked (8)"),
        bullet("Top 5 Performers panel with ranked achievement percentages"),
        bullet("Module navigation tiles: Performance Dashboard, Staff Directory, Admin Console"),
        pb(),

        // 2.3 Performance
        blueHeading("Module 3 — Performance Dashboard (Actual vs Plan)"),
        ...imgBlock("p_03_performance.png", 580, 350, "Figure 3: Performance data table with 86 reps, product breakdown, TCFA scores, and final incentives"),
        body("The core data table shows every representative's performance in granular detail across all quantitative and qualitative dimensions."),
        spacer(80),
        styledTable(
          ["Column", "Description"],
          [
            ["Representative", "Name, position, country with flag badge"],
            ["Team / Period", "Promo Line assignment + Quarter"],
            ["Plan (LC)", "Quarterly revenue target in local currency"],
            ["Actual (LC)", "Achieved revenue with color-coded achievement % badge"],
            ["Product Breakdown", "Up to 3 products with individual progress bars"],
            ["TCFA %", "Technical Coaching & Field Activity compliance score"],
            ["Target Base", "Quarterly base incentive amount"],
            ["Final Incentive (LC)", "Fully computed total incentive payout"],
          ]
        ),
        spacer(100),
        bullet("5-Dimension Filter Bar: Country, Year, Quarter, Promo Line, Representative (searchable)"),
        bullet("View format toggle: Detailed | Summary | Sign-Off"),
        bullet("Color-coded achievement badges: Green (≥100%), Amber (90–99%), Red (<90%)"),
        pb(),

        // 2.4 Summary
        blueHeading("Module 4 — Summary View (Full Incentive Computation)"),
        ...imgBlock("p_04_summary.png", 580, 350, "Figure 4: Summary view showing complete incentive calculation breakdown with Export to Excel"),
        body("A detailed financial computation table presenting the full incentive calculation engine output for all representatives."),
        bullet("Columns: Target Inc, Reimb. %, Target Base LC, Sales Target, P1/P2/P3 Values, Inc (Sales), TCFA Target, TIC Target, Inc (TCFA), Inc (TIC), Field Work, Total Incentive"),
        bullet("Export to Excel button — instant XLSX download for Finance teams"),
        bullet("Aggregated totals row at the bottom"),
        infoBox("This view replaces the manual Excel model across all countries. A single source of truth for Finance and HR.", GREEN),
        pb(),

        // 2.5 Sign Off
        blueHeading("Module 5 — Sign-Off / Statement of Bonuses"),
        ...imgBlock("p_05_signoff.png", 580, 350, "Figure 5: Formal Statement of Bonuses with Abbott letterhead and 5-role signature block"),
        body("A formal corporate document — 'Statement of Bonuses' — ready for digital or physical management sign-off. Designed to Abbott's exact governance requirements."),
        bullet("Abbott Laboratories letterhead with EPD branding"),
        bullet("Payout vs. Target badges: Green (≥100%), Amber (>0%), Red (not met)"),
        bullet("Aggregated TOTAL SUMMARY row across all representatives"),
        spacer(80),
        styledTable(
          ["Signatory Role", "Authority"],
          [
            ["National Sales Manager", "Sales performance validation"],
            ["General Manager", "Country-level final authority"],
            ["Regional SFE Director — Turkey & CIS", "Regional oversight"],
            ["HR Manager", "Compensation compliance"],
            ["CIS Finance Director EPD", "Final financial approval"],
          ]
        ),
        pb(),

        // 2.6 Staff
        blueHeading("Module 6 — Staff Directory"),
        ...imgBlock("p_06_staff.png", 580, 340, "Figure 6: Staff directory showing 86 reps with assignments, maternity flags, and quarterly availability"),
        body("Complete staff roster for all medical representatives with promo line assignments, leave status, and quarterly activity tracking."),
        bullet("Columns: Name & Position, Promo Line, Maternity Flag, Q1 / Q2 / Q3 / Q4 Activity (✓ / —)"),
        bullet("Country filter dropdown, paginated at 10 records per page"),
        bullet("Total staff count badge, global search inherited from header"),
        pb(),

        // ── ADMIN MODULES ─────────────────────────────────────────────────────
        navyHeading("3.  Admin Control Center — No-Code Governance Engine"),
        body("The Admin Console provides global governance over the entire incentive management lifecycle — from plan configuration to compliance monitoring — through an intuitive, no-code interface. This is the cornerstone of the platform's ability to scale to 70+ countries without developer involvement."),
        pb(),

        // 3.1 Admin Hub
        blueHeading("Admin Module 1 — Main Hub & Navigation"),
        ...imgBlock("p_07_admin.png", 580, 350, "Figure 7: Admin Console hub with all 9 management modules"),
        body("The Admin Console surfaces 9 operational modules, each designed for a specific governance workflow. Accessible only to country admins and regional managers."),
        spacer(80),
        styledTable(
          ["Module", "Purpose"],
          [
            ["ICP Plan Configuration", "Define plan parameters: 85/15 splits, accelerators, thresholds"],
            ["Payout Grid Manager", "Configure ACH-to-payout curves (70% floor, 250% cap)"],
            ["Target Setting & Adjustments", "Bulk upload targets, manage proration, and maternity adjustments"],
            ["Qualitative KPI Setup", "Define TCFA / coaching KPI frameworks and scoring"],
            ["OEC Compliance Monitor", "Track rep-level compliance attestation status"],
            ["Approval Workflow Configuration", "Set up multi-stage sign-off chains per country"],
            ["User & Territory Management", "Manage user accounts, FLM assignments, and territories"],
            ["Incentive Simulator", "Run 'What-If' scenario modeling before deployment"],
            ["Executive Analytics", "8-section analytical suite for IC program health"],
          ]
        ),
        pb(),

        // 3.2 ICP Config
        blueHeading("Admin Module 2 — ICP Plan Configuration"),
        ...imgBlock("p_08_icp.png", 580, 350, "Figure 8: No-code ICP plan configuration with 85/15 split controls"),
        body("The ICP Configuration module is where plan architects define the core incentive formula parameters without writing any code. Every parameter is editable through form controls and validated in real time."),
        bullet("Quantitative vs. Qualitative split configuration (default 85/15)"),
        bullet("Promo Line assignments and product portfolio weightings per line"),
        bullet("Reimbursable % rules by position type and seniority"),
        bullet("Currency configuration (LC to USD conversion rules)"),
        bullet("Quarter weighting — stepped or equal across Q1–Q4"),
        infoBox("Adding a new country configuration takes under 4 hours through this module — vs. weeks of re-engineering in Excel."),
        pb(),

        // 3.3 Payout Grid
        blueHeading("Admin Module 3 — Payout Grid Manager"),
        ...imgBlock("p_09_payout.png", 580, 350, "Figure 9: Payout grid editor with ACH-to-payout curve configuration"),
        body("The Payout Grid Manager controls the exact payout multiplier curve — mapping achievement percentages to incentive payout percentages in accordance with the ICP guidelines."),
        bullet("Standard ICP thresholds: 0% payout below 70% ACH (floor), 250% payout at ≥120% ACH (cap)"),
        bullet("Configurable step points: 70%, 80%, 90%, 100%, 110%, 120%+"),
        bullet("Separate grids per promo line or country as required"),
        bullet("Live preview of curve shape for visual validation"),
        pb(),

        // 3.4 Target Setting
        blueHeading("Admin Module 4 — Target Setting & Adjustments"),
        ...imgBlock("p_10_target.png", 580, 350, "Figure 10: Bulk target upload with CSV import and proration rules"),
        body("Target Setting enables country managers and HR to upload quarterly targets in bulk, apply proration for leave or mid-year joiners, and lock targets per period for governance."),
        bullet("Bulk CSV upload: Import all rep targets for a quarter in a single file"),
        bullet("Maternity/parental leave proration — automatically adjusts targets"),
        bullet("Midyear joiner proration — month-accurate target adjustments"),
        bullet("Target lock mechanism: prevents edits after approval sign-off"),
        bullet("Historical target audit trail — full version history per quarter"),
        pb(),

        // 3.5 Qual KPI
        blueHeading("Admin Module 5 — Qualitative KPI Framework"),
        ...imgBlock("p_11_qual.png", 580, 350, "Figure 11: Qualitative KPI definition and scoring framework"),
        body("The Qualitative KPI Setup module defines the TCFA (Technical Coaching & Field Activity) framework — the 15% qualitative component of every rep's incentive calculation."),
        bullet("Define KPI categories: coaching sessions, product knowledge tests, field visits"),
        bullet("Set scoring weights per KPI (summing to 100%)"),
        bullet("Configure minimum thresholds for qualifying the qualitative component"),
        bullet("Assign field managers as evaluators per KPI category"),
        pb(),

        // 3.6 Approval
        blueHeading("Admin Module 6 — Approval Workflow Configuration"),
        ...imgBlock("p_12_approval.png", 580, 350, "Figure 12: Multi-stage approval workflow configuration"),
        body("The Approval Workflow module configures the digital sign-off chain that every Statement of Bonuses must complete before payouts are released. Fully configurable per country."),
        new Paragraph({
          children: [new TextRun({ text: "FLM Review  →  Regional Manager / NSM  →  General Manager  →  HR Manager  →  Finance Director  →  LOCKED & PAID", size: 18, color: WHITE, bold: true, font: "Calibri" })],
          shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
        }),
        bullet("Email notifications triggered at every stage transition"),
        bullet("Rejection with mandatory reason field and re-submission workflow"),
        bullet("Full audit trail: timestamps, user attribution, IP logging"),
        bullet("Delegation rules: automatic rerouting during leave periods"),
        bullet("Bulk approval for low-risk standard records"),
        pb(),

        // 3.7 Compliance
        blueHeading("Admin Module 7 — OEC Compliance Monitor"),
        ...imgBlock("p_13_compliance.png", 580, 350, "Figure 13: OEC compliance attestation tracking dashboard"),
        body("The OEC (Office of Ethics and Compliance) Compliance module tracks and enforces compliance attestation requirements. Every rep must complete mandatory attestation before their incentive can be processed."),
        bullet("Rep-level compliance attestation status: Attested / Pending / Overdue"),
        bullet("Automated reminder escalation for overdue attestations"),
        bullet("Integration hook for Abbott's central OEC system"),
        bullet("Block payout processing for non-attested reps"),
        bullet("Country compliance summary with percentage completion"),
        pb(),

        // 3.8 Territory
        blueHeading("Admin Module 8 — User & Territory Management"),
        ...imgBlock("p_14_territory.png", 580, 350, "Figure 14: User account management with FLM-team assignments"),
        body("Manages all user accounts, role assignments, and territory mappings across the platform. This module controls who sees what data and which approvals they can action."),
        bullet("User provisioning: Create, suspend, and deactivate accounts"),
        bullet("Role assignments: Regional Manager, FLM, Medical Rep, Country Admin"),
        bullet("FLM-to-Team mappings: Each FLM sees only their own team's data"),
        bullet("Territory definitions: Country, region, promo line boundaries"),
        bullet("SSO group mapping for future Azure AD integration"),
        pb(),

        // 3.9 Simulator
        blueHeading("Admin Module 9 — Incentive Simulator"),
        ...imgBlock("p_15_simulator.png", 580, 370, "Figure 15: Real-time incentive scenario simulator with sensitivity analysis"),
        body("The Incentive Simulator is a strategic planning tool that allows analysts and country managers to model 'What If' scenarios — adjusting plan parameters and instantly seeing the projected financial impact before deployment."),
        bullet("Scenario Builder: Adjust ACH targets, payout multiples, and TCFA weights"),
        bullet("Sensitivity Analysis: See how a 5% change in quota impacts total payout budget"),
        bullet("Population Modeling: Filter by promo line, country, or position to isolate segments"),
        bullet("Budget Impact Calculator: Total incentive cost vs. current plan"),
        bullet("Export scenario summaries to Excel for Finance review"),
        infoBox("The Simulator eliminates the 2–3 week cycle of Excel modeling that currently precedes every quarterly plan revision.", NAVY),
        pb(),

        // ── 4. EXECUTIVE ANALYTICS ────────────────────────────────────────────
        navyHeading("4.  Executive Analytics Suite — ICP Framework"),
        body("The Executive Analytics Suite is an 8-section strategic intelligence layer built directly into the Admin Console. It provides the analytical rigor of enterprise IC management platforms — calibrated to the ICP Executive Summary 2026 framework."),
        spacer(100),

        // 4.1 KPI Summary
        blueHeading("Analytics 1 — KPI Summary Dashboard"),
        ...imgBlock("p_16_analytics_kpi.png", 580, 360, "Figure 16: KPI Summary with ICP best-practice benchmarks"),
        body("The KPI Summary provides a real-time pulse check on the incentive program's overall health. 7 core metrics are visible at a glance, benchmarked against ICP best-practice guidelines."),
        styledTable(
          ["KPI", "Description", "ICP Benchmark"],
          [
            ["Total Reps", "Count of active reps in the filtered population", "—"],
            ["Avg Achievement", "Mean achievement % across all reps", "Target: 100%"],
            ["Total Incentive", "Aggregate incentive payout in LC", "—"],
            ["≥ 100% ACH", "Count of reps meeting or exceeding quota", "60–70% of population"],
            ["% At/Above", "Percentage of reps at or above target", "60–70%"],
            ["Boom (≥110%)", "Count of top performers above 110% ACH", "~10% of population"],
            ["Bust (<90%)", "Count of underperformers below 90% ACH", "~10% of population"],
          ]
        ),
        pb(),

        // 4.2 Performance Distribution
        blueHeading("Analytics 2 — Performance Distribution"),
        ...imgBlock("p_17_analytics_dist.png", 580, 370, "Figure 17: Bell-curve performance distribution across 7 ACH buckets"),
        body("Performance Distribution visualizes how the sales force is spread across achievement buckets — the foundational diagnostic for any IC program. A healthy plan produces a bell curve centered at 100%."),
        styledTable(
          ["Pattern", "Interpretation", "Action Required"],
          [
            ["Bell Curve (Ideal)", "30–40% at target. 60–70% close. ~10% top performers.", "No action needed"],
            ["Skewed Below Quota", "Majority below 100% ACH", "Review quota-setting methodology"],
            ["Skewed Above Quota", "Most overachieving — possible double crediting", "Audit payout grid thresholds"],
            ["Bi-Modal", "Two performance peaks — different roles or misaligned quotas", "Segment by position/line"],
          ]
        ),
        bullet("Top 10 Performers panel — ranked by ACH%"),
        bullet("Bottom 10 (Needs Attention) panel — flagged for coaching action"),
        bullet("Percentile snapshot: 10th, 25th, 50th, 75th, 90th percentile achievement rates"),
        pb(),

        // 4.3 Composition
        blueHeading("Analytics 3 — Composition Analysis"),
        ...imgBlock("p_18_analytics_comp.png", 580, 360, "Figure 18: Pay composition analysis by earnings quartile and promo line"),
        body("Composition Analysis breaks down how incentive dollars are distributed across earnings quartiles and promo lines — ensuring the plan rewards performance proportionally and equitably."),
        bullet("Q1 Top 25% / Q2 50–75% / Q3 25–50% / Q4 Bottom 25% — average incentive per quartile"),
        bullet("Avg Incentive by Promo Line — cross-line equity comparison"),
        bullet("TCFA Score Distribution — 5-bucket breakdown of coaching compliance"),
        infoBox("A well-designed plan should show Q1 earning 3–4× more than Q4. This module validates that principle in real data.", GREEN),
        pb(),

        // 4.4 Regression
        blueHeading("Analytics 4 — Regression Analysis"),
        ...imgBlock("p_19_analytics_reg.png", 580, 360, "Figure 19: ACH% vs Incentive LC scatter plot with R² trend line"),
        body("Regression Analysis tests the fundamental validity of the incentive plan — measuring whether higher achievement actually produces higher pay. An R² above 0.6 indicates a healthy pay-for-performance link."),
        styledTable(
          ["R² Range", "Interpretation", "Action"],
          [
            ["0.80 – 1.00", "Very Strong correlation", "Plan is working as designed"],
            ["0.60 – 0.79", "Strong correlation", "Monitor for outliers"],
            ["0.40 – 0.59", "Moderate — investigate", "Review formula parameters"],
            ["< 0.40", "Weak — plan may be broken", "Full plan audit required"],
          ]
        ),
        bullet("Interactive scatter plot: each dot = one representative"),
        bullet("Linear trend line with R² coefficient displayed prominently"),
        bullet("100% quota line marked in green for visual reference"),
        pb(),

        // 4.5 Pay Differentiation
        blueHeading("Analytics 5 — Pay Differentiation"),
        ...imgBlock("p_20_analytics_pay.png", 580, 360, "Figure 20: Percentile pay spread and top vs bottom performer comparison"),
        body("Pay Differentiation measures whether the plan sufficiently separates top performers from average — a critical test of incentive effectiveness. ICP best practice: the P90-to-P50 ratio should be 2.0–3.0×."),
        bullet("Percentile pay ladder: P10, P25, P50, P75, P90 incentive amounts"),
        bullet("P90/P50 ratio with green/amber best-practice indicator"),
        bullet("Top 5 vs Bottom 5 performers — head-to-head incentive and ACH comparison"),
        infoBox("A ratio below 2.0× indicates the plan does not sufficiently reward top performers. Quota or accelerator revision needed.", AMBER),
        pb(),

        // 4.6 Boom-Bust
        blueHeading("Analytics 6 — Boom-Bust Analysis"),
        ...imgBlock("p_21_analytics_boom.png", 580, 360, "Figure 21: Boom-Bust quadrant analysis tracking rep trajectory across periods"),
        body("Boom-Bust Analysis tracks rep trajectory across periods — identifying who consistently excels, who consistently struggles, and who experienced dramatic performance swings. This is the longitudinal health monitor."),
        styledTable(
          ["Quadrant", "Label", "Meaning"],
          [["Both periods ≥ 100%", "Stars", "Consistently excellent — retain and reward"], ["Below → Above 100%", "Boom", "Improving — consider accelerated development"], ["Above → Below 100%", "Bust", "Declining — coaching intervention required"], ["Both periods < 100%", "At Risk", "Consistently struggling — escalate review"]]),
        pb(),

        // 4.7 Role Equity
        blueHeading("Analytics 7 — Role Equity"),
        ...imgBlock("p_22_analytics_equity.png", 580, 360, "Figure 22: Average incentive and achievement by position and promo line"),
        body("Role Equity validates that incentive outcomes are fair and aligned with job expectations across different positions, seniority levels, and promotional lines — a critical test for HR governance."),
        bullet("Average incentive by position type (e.g., Medical Rep vs. KAM vs. FLM)"),
        bullet("Average achievement by promo line — identifies lines with structural quota issues"),
        bullet("Gender and tenure equity overlay (future module — Phase 2)"),
        pb(),

        // 4.8 IC Timeline
        blueHeading("Analytics 8 — IC Process Timeline"),
        ...imgBlock("p_23_analytics_timeline.png", 580, 360, "Figure 23: Quarter-by-quarter IC process milestone tracker"),
        body("The IC Timeline module provides a Gantt-style view of the incentive compensation process lifecycle — from target setting through to payout release — ensuring every country meets critical milestones on schedule."),
        bullet("Quarter-by-quarter milestone tracking: Target Setting, Data Upload, Calculation, Review, Approval, Payout"),
        bullet("RAG status per milestone: Green (On Track), Amber (At Risk), Red (Delayed)"),
        bullet("Country-level timeline view for multi-country oversight"),
        bullet("Automated escalation flags for approaching deadlines"),
        pb(),

        // ── 5. INVESTMENT ─────────────────────────────────────────────────────
        navyHeading("5.  Commercial Investment Summary"),
        blueHeading("Phase 1 Investment Breakdown — $592,500 USD"),
        styledTable(
          ["Component", "Scope", "Investment (USD)"],
          [
            ["Platform Architecture & Foundation", "Multi-tenant schema, RBAC, CI/CD, Azure SSO", "$95,000"],
            ["Web Application Development", "Full feature build for all 9 admin modules + dashboards", "$180,000"],
            ["Mobile Application", "iOS & Android apps for field force", "$120,000"],
            ["Country Onboarding × 4", "Egypt, Saudi Arabia, Algeria, Kazakhstan — full config + migration", "$80,000"],
            ["Analytics Suite", "All 8 ICP analytics sections", "$60,000"],
            ["QA, UAT & Hypercare", "3-month hypercare period post go-live", "$57,500"],
            ["TOTAL — Phase 1", "4 countries · 200+ reps · Full governance suite", "$592,500"],
          ]
        ),
        spacer(160),
        infoBox("Phases 2–4 leverage Phase 1 infrastructure. Per-country onboarding cost drops by 60%+ after Phase 1 — each new country added via the Country Wizard in under 4 hours.", NAVY),
        spacer(160),
        blueHeading("ROI vs. SaaS Alternatives"),
        styledTable(
          ["Capability", "Salesforce Spiff", "Xactly Incent", "This Platform"],
          [
            ["Annual per-seat license (200 reps)", "$240K+/yr", "$300K+/yr", "Zero — owned IP"],
            ["Custom pharma formula support", "Requires consulting", "Partial support", "Built-in native"],
            ["Abbott-branded UI", "Not possible", "Not possible", "Fully white-labeled"],
            ["TCFA / TIC / qualitative KPIs", "Not supported", "Not supported", "Native support"],
            ["Time to add new country", "Weeks + consulting fees", "Weeks + fees", "< 4 hours, no cost"],
            ["Vendor lock-in", "High", "High", "Zero — your codebase"],
            ["IP ownership", "None", "None", "100% Abbott-owned"],
          ]
        ),
        pb(),

        // ── 6. NEXT STEPS ─────────────────────────────────────────────────────
        navyHeading("6.  Next Steps"),
        body("To move forward with Phase 1, the following steps are recommended:"),
        spacer(80),
        styledTable(
          ["Step", "Activity", "Owner", "Timeline"],
          [
            ["1", "Commercial proposal approval and SOW sign-off", "EPD Commercial Excellence", "Week 1"],
            ["2", "Kick-off meeting — define Phase 1 country contacts", "BSS + EPD Team", "Week 1"],
            ["3", "Technical architecture review and cloud environment setup", "BSS Tech Lead", "Week 2"],
            ["4", "Kazakhstan data migration to enterprise schema", "BSS + IT", "Week 3"],
            ["5", "Phase 1 country data collection (Egypt, KSA, Algeria)", "Country HRs", "Week 3–4"],
            ["6", "Phase 1 UAT with country NSMs and HRs", "BSS + Country Teams", "Week 12"],
            ["7", "Phase 1 Go-Live and hypercare start", "Full Team", "Week 14"],
          ]
        ),
        spacer(200),
        infoBox("This proposal is valid for 90 days from April 2026. Contact: BSS Universal · Prepared for EPD Commercial Excellence.", COBALT),
      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(OUT_DIR, "ICM_Commercial_Proposal_FINAL.docx");
  fs.writeFileSync(out, buf);
  console.log("✅  ICM_Commercial_Proposal_FINAL.docx  →  " + out);
}


// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 2 — EPD POC User Guide & Platform Leverage
// ══════════════════════════════════════════════════════════════════════════════
async function buildPOCGuide() {
  const doc = new Document({
    sections: [{
      properties: pageProps,
      headers: { default: makeHeader("EPD ICM Platform  ·  POC User Guide & Leverage Analysis") },
      footers: { default: makeFooter() },
      children: [

        // COVER
        spacer(600),
        new Paragraph({ children: [new TextRun({ text: "  EPD Incentive Compensation Management", bold: true, size: 52, color: WHITE, font: "Calibri" })], shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY }, spacing: { before: 0, after: 0 } }),
        new Paragraph({ children: [new TextRun({ text: "  Proof of Concept  ·  User Guide  ·  Value Leverage Analysis", size: 26, color: "A0BFCE", font: "Calibri" })], shading: { type: ShadingType.SOLID, color: COBALT, fill: COBALT }, spacing: { before: 0, after: 480 } }),
        new Paragraph({ children: [new TextRun({ text: "Why This POC Outperforms Any SaaS Alternative", bold: true, size: 60, color: NAVY, font: "Calibri" })], spacing: { before: 0, after: 160 } }),
        new Paragraph({ children: [new TextRun({ text: "Kazakhstan Live POC  ·  86 Representatives  ·  8 Quarters  ·  15 Products  ·  6 Promo Lines", size: 24, color: BLUE, italics: true, font: "Calibri" })], spacing: { after: 400 } }),
        new Paragraph({ children: [new TextRun({ text: "", size: 20 })], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } }, spacing: { before: 100, after: 300 } }),
        styledTable(
          ["Field", "Info"],
          [
            ["Platform", "EPD Incentive Compensation Management (ICM)"],
            ["Status", "LIVE — Production-grade POC"],
            ["Data Coverage", "Kazakhstan · 86 Reps · 8 Quarters · Q1 2017–Q4 2019"],
            ["Products", "15 (CREON, HEPTRAL, DUPHASTON, DUPHALAC, and 11 more)"],
            ["Promo Lines", "6 (Line 1, Line 2, Line 2 Big Cities, Line 3 Big Cities, Pharma, RM-1)"],
            ["Technology", "Next.js 16 · React · TypeScript · PostgreSQL"],
            ["Authentication", "Role-based (Regional Manager / FLM / Rep)"],
            ["Prepared By", "BSS Universal  ·  April 2026"],
          ]
        ),
        pb(),

        // ── SECTION 1: WHY THIS EXISTS ───────────────────────────────────────
        navyHeading("1.  Why This POC Exists"),
        body("Abbott EPD currently manages incentive compensation across 47+ countries through a patchwork of Excel models, manual approval emails, and local HR calculations. This creates four fundamental enterprise risks:"),
        spacer(80),
        styledTable(
          ["Risk", "Current Reality", "Platform Solution"],
          [
            ["Calculation Errors", "2%+ error rate on 75M LC incentive pool = millions in incorrect payouts", "100% formula-driven, auditable calculations"],
            ["No Audit Trail", "Approvals via email — no tamper-proof log", "Full digital audit trail, timestamp-stamped"],
            ["Scale Impossibility", "Each country maintains a separate Excel — 70+ files to manage", "One platform, 70+ countries configured as data"],
            ["Rep Dissatisfaction", "Reps receive payouts weeks after quarter close with no visibility", "Real-time dashboard — reps track their own earnings live"],
            ["OEC Compliance Risk", "Attestation tracked in spreadsheets", "Automated compliance gating before payout release"],
          ]
        ),
        spacer(160),
        infoBox("This POC is not a mockup or prototype — it is a live, data-connected application managing Kazakhstan's real incentive data today.", NAVY),
        pb(),

        // ── SECTION 2: COMPLETE USER GUIDE ──────────────────────────────────
        navyHeading("2.  Complete User Guide — All Screens"),

        // Login
        blueHeading("Screen 1 — Login & Authentication"),
        ...imgBlock("p_01_login.png", 570, 330, "Fig 1: Secure corporate login portal"),
        body("Users access the platform with their corporate Abbott email address. The system auto-routes them based on their pre-configured role."),
        spacer(60),
        styledTable(
          ["Email Address", "User Name", "Role", "Data Access"],
          [
            ["arslansohail@abbott.com", "Arslan Sohail", "Regional Manager", "All countries, all reps, all data"],
            ["abdulmanan@abbott.com", "Abdul Manan", "First Line Manager", "Own team only (filtered by FLM assignment)"],
            ["fahad.ayub@abbott.com", "Fahad Ayub", "First Line Manager", "Own team only"],
          ]
        ),
        bullet("Production implementation: Azure AD SSO — no password required"),
        bullet("Session timeout: 8 hours of inactivity"),
        bullet("Full Audit: every login event is logged with IP, timestamp, and device"),
        pb(),

        // Dashboard
        blueHeading("Screen 2 — Executive Home Dashboard"),
        ...imgBlock("p_02_dashboard.png", 570, 340, "Fig 2: Personalized executive dashboard"),
        body("The landing dashboard provides an immediate health overview of the entire incentive program. Data is computed live from the underlying database on every page load."),
        bullet("Greeting: 'Good evening, Arslan 👋' with role and region badge"),
        bullet("Live KPIs: Total Reps (86), Total Actual LC (78.8M), Total Incentive (75.0M), Quarters Tracked (8)"),
        bullet("Overall Achievement Badge: Computed across all reps — 112.3% in current data"),
        bullet("Top 5 Performers leaderboard — ranked by achievement %"),
        bullet("One-click navigation tiles to all platform sections"),
        pb(),

        // Performance
        blueHeading("Screen 3 — Performance Dashboard (Detailed View)"),
        ...imgBlock("p_03_performance.png", 570, 330, "Fig 3: Full-detail performance data table for all 86 reps"),
        body("The primary working view for managers. Displays every rep's complete performance profile for the selected period."),
        bullet("Filter Bar: Country > Year > Quarter > Promo Line > Rep (searchable)"),
        bullet("Achievement badge colors: Green 100%+ | Amber 70-99% | Red <70%"),
        bullet("Product column: shows top 3 products with mini progress bars (Act vs Plan)"),
        bullet("Column export: entire filtered dataset downloadable to Excel"),
        bullet("FLMs see only their own team (enforced at database query level — not just UI)"),
        pb(),

        // Summary
        blueHeading("Screen 4 — Summary View (Financial Computation Table)"),
        ...imgBlock("p_04_summary.png", 570, 330, "Fig 4: Complete incentive computation breakdown per rep"),
        body("The Summary View exposes the full incentive calculation engine. Every column maps to a specific formula component in the ICP logic."),
        styledTable(
          ["Column", "Formula Component"],
          [
            ["Target Inc (QTR)", "Agreed quarterly incentive target per rep"],
            ["Reimb. %", "Reimbursable percentage based on contract type"],
            ["Target Base LC", "Target Inc × Reimb. % = base incentive quantum"],
            ["Target (Sales)", "85% of Target Base LC = quantitative component"],
            ["P1 / P2 / P3 Val", "Weighted achievement per product in the promo line"],
            ["Inc (Sales)", "Sales Target × Weighted Achievement = quant payout"],
            ["Target (TCFA)", "15% of Target Base LC = qualitative component target"],
            ["Inc (TCFA)", "TCFA Target × TCFA score achieved"],
            ["Total Incentive (LC)", "Inc (Sales) + Inc (TCFA) = final payout"],
          ]
        ),
        infoBox("Export to Excel: one click downloads the full dataset in XLSX format. Finance team can import directly into SAP or Oracle without any reformatting.", GREEN),
        pb(),

        // Sign Off
        blueHeading("Screen 5 — Statement of Bonuses (Sign-Off View)"),
        ...imgBlock("p_05_signoff.png", 570, 330, "Fig 5: Formal Statement of Bonuses ready for digital sign-off"),
        body("The Sign-Off view generates a formal 'Statement of Bonuses' document that mirrors the physical corporate document currently used. In production, this is digitally signed by each role in sequence."),
        bullet("Abbott letterhead with EPD corporate branding at top"),
        bullet("Country/region/quarter context header"),
        bullet("Color-coded Payout vs. Target badges for instant visual validation"),
        bullet("TOTAL row summarizing all representative payouts"),
        bullet("5-block signature section at the bottom of each page"),
        pb(),

        // Staff
        blueHeading("Screen 6 — Staff Directory"),
        ...imgBlock("p_06_staff.png", 570, 320, "Fig 6: Complete staff roster with promo lines and quarterly status"),
        body("The Staff Directory provides a single view of all active field force personnel — their assignments, leave status, and which quarters they were active in."),
        bullet("86 medical representatives currently tracked"),
        bullet("Promo Line assignment shown as colored badges per ICP line"),
        bullet("Maternity flag: identifies reps eligible for target proration"),
        bullet("Quarter activity: checkmarks (✓) per Q1/Q2/Q3/Q4 show active periods"),
        bullet("Country filter for multi-country Regional Managers"),
        pb(),

        // ── SECTION 3: ADMIN MODULES ─────────────────────────────────────────
        navyHeading("3.  Admin Console — No-Code Governance"),
        body("The Admin Console is the control tower for the entire incentive management lifecycle. Every country configuration, approval chain, compliance rule, and analytical parameter is managed here — without any developer involvement after initial setup."),
        pb(),

        blueHeading("Admin 1 — ICP Plan Configuration"),
        ...imgBlock("p_08_icp.png", 570, 330, "Fig 7: ICP plan configuration — no-code formula editing"),
        body("Configure the incentive formula engine for any country through form controls. Parameters include quant/qual splits, product weightings, reimbursable percentages, and currency rules. All validated in real-time before saving."),
        pb(),

        blueHeading("Admin 2 — Payout Grid Manager"),
        ...imgBlock("p_09_payout.png", 570, 330, "Fig 8: Payout grid — ACH-to-incentive multiplier configuration"),
        body("The payout grid maps achievement percentages to incentive multipliers in accordance with the One ICP guidelines. Configurable per country, per promo line, with a visual curve preview for validation."),
        bullet("ICP standard: 0% payout at <70% ACH, scaling to 250% at ≥120% ACH"),
        bullet("Step-wise configuration: 5 configurable points between floor and cap"),
        pb(),

        blueHeading("Admin 3 — Target Setting & Adjustments"),
        ...imgBlock("p_10_target.png", 570, 330, "Fig 9: Bulk target upload with proration and maternity adjustments"),
        body("Replaces the quarterly manual Excel target distribution process with a governed, audited upload workflow. CSV import, automatic proration rules, and target locking are all managed here."),
        pb(),

        blueHeading("Admin 4 — Qualitative KPI Framework"),
        ...imgBlock("p_11_qual.png", 570, 330, "Fig 10: Qualitative KPI definition — TCFA scoring setup"),
        body("Defines the 15% qualitative TCFA component of each rep's incentive. KPI categories, weights, and scoring thresholds are fully configurable per country or promo line."),
        pb(),

        blueHeading("Admin 5 — Approval Workflow Configuration"),
        ...imgBlock("p_12_approval.png", 570, 330, "Fig 11: Multi-stage digital approval workflow setup"),
        body("Configure the digital sign-off chain that every Statement of Bonuses must traverse before payouts are released. Supports conditional routing, delegation, and multi-country parallel chains."),
        pb(),

        blueHeading("Admin 6 — OEC Compliance Monitor"),
        ...imgBlock("p_13_compliance.png", 570, 330, "Fig 12: OEC compliance attestation tracking by rep and country"),
        body("Tracks OEC compliance attestation status for every rep across all countries. Non-attested reps are automatically blocked from incentive processing until attestation is confirmed."),
        pb(),

        blueHeading("Admin 7 — User & Territory Management"),
        ...imgBlock("p_14_territory.png", 570, 330, "Fig 13: User provisioning with role and territory assignments"),
        body("Manages user accounts, FLM-to-team mappings, and territory boundaries. The role engine enforces data visibility at the database query level — not just the UI."),
        pb(),

        blueHeading("Admin 8 — Incentive Simulator"),
        ...imgBlock("p_15_simulator.png", 570, 360, "Fig 14: Real-time incentive scenario simulator"),
        body("The Simulator is the planning analyst's most powerful tool. Adjust any plan parameter and instantly see the projected payout impact — before committing any change to production. Eliminates the 2–3 week Excel modeling cycle."),
        bullet("Scenario: 'What happens if we raise the 110% ACH accelerator from 150% to 175%?'"),
        bullet("Impact: +$X total payout for Y reps — shown instantly in the budget table"),
        bullet("Export: Scenario summary to Excel for Finance review and CFO sign-off"),
        pb(),

        // ── SECTION 4: ANALYTICS ─────────────────────────────────────────────
        navyHeading("4.  Executive Analytics Suite — 8 Sections"),
        body("The Analytics Suite provides the strategic intelligence layer that transforms raw performance data into actionable IC governance insights. All 8 sections are calibrated to the ICP Executive Summary 2026 framework."),
        pb(),

        blueHeading("Analytics 1 — KPI Summary"),
        ...imgBlock("p_16_analytics_kpi.png", 570, 350, "Fig 15: KPI Summary — 7 live metrics benchmarked against ICP guidelines"),
        body("Pulse-check dashboard for the IC program. 7 core metrics shown with ICP best-practice benchmark targets. Best-practice panel includes bell-curve guidance for interpreting distribution shape."),
        pb(),

        blueHeading("Analytics 2 — Performance Distribution"),
        ...imgBlock("p_17_analytics_dist.png", 570, 360, "Fig 16: Performance Distribution — bell curve across 7 ACH buckets"),
        body("The foundational diagnostic: how is the field force distributed across achievement bands? A healthy plan shows a bell curve centered at 100%. Outlier tails indicate quota or formula issues."),
        bullet("7 ACH buckets: <70%, 70-80%, 80-90%, 90-100%, 100-110%, 110-120%, >120%"),
        bullet("Top 10 and Bottom 10 performer lists with promo line context"),
        bullet("Percentile snapshot: 10th, 25th, 50th, 75th, 90th"),
        pb(),

        blueHeading("Analytics 3 — Composition Analysis"),
        ...imgBlock("p_18_analytics_comp.png", 570, 350, "Fig 17: Pay composition by quartile and promo line"),
        body("Shows how incentive dollars are distributed across earnings quartiles and product lines. Validates that top performers earn substantially more than average — the proof that the plan drives behavior."),
        pb(),

        blueHeading("Analytics 4 — Regression Analysis"),
        ...imgBlock("p_19_analytics_reg.png", 570, 360, "Fig 18: ACH% vs Incentive LC regression scatter with R² coefficient"),
        body("Quantitative proof of pay-for-performance. The scatter plot shows every rep as a data point. R² measures how tightly earnings correlate with achievement. Values below 0.6 signal plan problems requiring investigation."),
        pb(),

        blueHeading("Analytics 5 — Pay Differentiation"),
        ...imgBlock("p_20_analytics_pay.png", 570, 360, "Fig 19: Percentile pay spread and Top 5 vs Bottom 5 comparison"),
        body("Measures whether top performers are rewarded sufficiently differently from average performers. The P90/P50 ratio is the key ICP governance metric — target: 2.0–3.0×."),
        pb(),

        blueHeading("Analytics 6 — Boom-Bust Analysis"),
        ...imgBlock("p_21_analytics_boom.png", 570, 360, "Fig 20: Boom-Bust quadrant — rep trajectory across periods"),
        body("Longitudinal analysis tracking rep trajectory across reporting periods. Classifies every rep into one of four quadrants: Stars, Boom (improving), Bust (declining), At Risk — enabling targeted coaching interventions."),
        pb(),

        blueHeading("Analytics 7 — Role Equity"),
        ...imgBlock("p_22_analytics_equity.png", 570, 360, "Fig 21: Role equity analysis by position and promo line"),
        body("Validates that incentive outcomes are equitable across roles, seniority levels, and product lines. Identifies structural quota issues in specific promo lines where entire teams consistently under- or over-achieve."),
        pb(),

        blueHeading("Analytics 8 — IC Process Timeline"),
        ...imgBlock("p_23_analytics_timeline.png", 570, 360, "Fig 22: IC process milestone tracker — quarter-by-quarter"),
        body("Operational governance view tracking the incentive calendar from target-setting to payout release. Red/amber/green status per milestone ensures every country stays on schedule for the quarterly close."),
        pb(),

        // ── SECTION 5: LEVERAGE ──────────────────────────────────────────────
        navyHeading("5.  Platform Leverage — Why This Beats Any SaaS Alternative"),
        body("This section quantifies the strategic advantages of the EPD ICM Platform over generic SaaS alternatives. The argument is financial, technical, and operational."),
        spacer(160),

        blueHeading("5.1  Financial Leverage"),
        styledTable(
          ["Cost Factor", "SaaS (e.g. Spiff/Xactly)", "This Platform — EPD"],
          [
            ["Annual license — 500 users", "$600K–$900K/yr (recurring)", "Zero after build — codebase owned"],
            ["Custom pharma logic", "$150K–$300K consulting/yr", "Built-in natively"],
            ["Country onboarding (each)", "4–8 weeks + consulting fees", "< 4 hours, zero cost"],
            ["Analytics customization", "Fixed reports only", "Fully custom — any metric"],
            ["Mobile app", "Extra module, extra license", "Included in Phase 2"],
            ["10-year TCO (47 countries)", "$10M–$15M", "$2M–$3M"],
          ]
        ),
        spacer(160),
        infoBox("Over a 10-year horizon, this platform delivers $7M–$12M in direct cost savings vs. the leading SaaS alternatives — while providing deeper pharma-specific functionality.", GREEN),
        spacer(160),

        blueHeading("5.2  Operational Leverage"),
        styledTable(
          ["Process", "Today (Excel/Manual)", "With This Platform"],
          [
            ["Quarterly incentive calculation", "2–3 weeks per country", "< 15 minutes, automated"],
            ["Approval routing", "Physical/email signatures", "Digital, timestamped, 48 hrs"],
            ["Adding a new country", "New Excel file, weeks of setup", "< 4 hours via Country Wizard"],
            ["Error correction", "Manual re-calculation, re-send", "One-click recalculate, instant"],
            ["OEC compliance tracking", "Spreadsheet per country", "Auto-gated at transaction level"],
            ["Rep visibility into earnings", "None until payout letter", "Real-time dashboard — live"],
            ["Executive analytics", "Manual quarterly reports", "Always-on, live, 8-section suite"],
          ]
        ),
        spacer(160),

        blueHeading("5.3  Strategic Leverage"),
        bullet("IP Ownership: Abbott owns 100% of the codebase. No vendor lock-in, no contract risk."),
        bullet("Competitive Intelligence: Real-time performance data enables faster quota recalibration than any competitor relying on quarterly Excel cycles."),
        bullet("Rep Engagement: Live earnings visibility drives rep behavior and reduces 'surprise payout' grievances — a documented driver of rep turnover."),
        bullet("Auditability: Every calculation, approval, and data change is logged immutably — critical for pharma regulatory environments."),
        bullet("Scale: The platform architecture is designed from day one for 47+ countries. Adding Phase 2 countries uses the same codebase, same infra — zero rebuild cost."),
        spacer(200),

        blueHeading("5.4  Capability Benchmark vs. Enterprise Peers"),
        styledTable(
          ["Capability", "Salesforce Spiff", "Xactly Incent", "CaptivateIQ", "EPD Platform"],
          [
            ["Real-time calculation", "✅", "✅", "✅", "✅"],
            ["Multi-tier approval", "✅", "✅", "⚠ Basic", "✅"],
            ["Custom pharma logic", "❌", "⚠ Partial", "❌", "✅ Native"],
            ["TCFA / qualitative KPIs", "❌", "❌", "❌", "✅ Built-in"],
            ["ICP payout grid engine", "❌", "❌", "❌", "✅ Built-in"],
            ["Executive analytics suite", "⚠ Basic", "✅", "⚠ Basic", "✅ 8-section"],
            ["Incentive simulator", "❌", "✅", "⚠ Basic", "✅ Full"],
            ["Abbott-branded UI", "❌", "❌", "❌", "✅ 100%"],
            ["Per-seat licensing cost", "High", "Very High", "Medium", "Zero"],
            ["IP ownership", "Vendor", "Vendor", "Vendor", "✅ Abbott"],
          ]
        ),
        pb(),

        // ── SECTION 6: NEXT STEPS ─────────────────────────────────────────────
        navyHeading("6.  Recommended Next Steps"),
        styledTable(
          ["Priority", "Action", "Owner", "Timeline"],
          [
            ["#1 — Critical", "Phase 1 commercial approval (Egypt, KSA, Algeria, KZ)", "EPD Commercial Exc.", "Week 1"],
            ["#2 — Critical", "Azure AD SSO configuration for production auth", "IT & BSS", "Week 2"],
            ["#3 — High", "Phase 1 country data collection (rep lists, targets, formulas)", "Country HR teams", "Weeks 2–4"],
            ["#4 — High", "Mobile app UX design review and sign-off", "EPD + BSS Design", "Week 3"],
            ["#5 — Medium", "Phase 2 country pipeline identification", "EPD Regional Teams", "Month 2"],
            ["#6 — Medium", "SAP integration scoping for data sync", "IT Architecture", "Month 2"],
          ]
        ),
        spacer(200),
        infoBox("This POC is live and operational today. Phase 1 deployment can begin within 2 weeks of commercial approval. The infrastructure is already built.", NAVY),

      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  const out = path.join(OUT_DIR, "EPD_POC_User_Guide_FINAL.docx");
  fs.writeFileSync(out, buf);
  console.log("✅  EPD_POC_User_Guide_FINAL.docx  →  " + out);
}

// ── RUN ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log("⏳  Building documents...\n");
  await buildCommercialProposal();
  await buildPOCGuide();
  console.log("\n🎉  Both documents generated successfully.");
})().catch(e => { console.error("❌ Error:", e); process.exit(1); });
