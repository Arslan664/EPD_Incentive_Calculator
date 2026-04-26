const fs = require('fs');

let code = fs.readFileSync('generate_final_proposal.js', 'utf8');

// Change output path
code = code.replace(
  'const OUT = path.join(__dirname, "EPD_Incentive_Platform_Proposal.docx");',
  'const OUT = path.join(__dirname, "New Doc", "ICM_Commercial_Proposal_v1_Final.docx");'
);

// Add loading images
const newImages = `
  const imgAdmin = loadImage("admin_overview.png");
  const imgTarget = loadImage("admin_target.png");
  const imgConfig = loadImage("admin_icp.png");
  const imgAnalyticsKPI = loadImage("analytics_kpi.png");
  const imgAnalyticsDist = loadImage("analytics_dist.png");
  const imgAnalyticsReg = loadImage("analytics_regression.png");
  const imgAnalyticsPay = loadImage("analytics_paydiff.png");
  const imgSimulator = loadImage("admin_simulator.png");
`;
code = code.replace('const img07 = loadImage("07_product_promo.png");', 'const img07 = loadImage("07_product_promo.png");\n' + newImages);

// Add content sections after Product Promo
const newSections = `
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

`;

code = code.replace(
  '// ─── 5. VISION ─────────────────────────────────────────────────────', 
  newSections + '\n          // ─── 5. VISION ─────────────────────────────────────────────────────'
);

fs.writeFileSync('generate_final_proposal.js', code);
console.log('generate_final_proposal.js customized successfully.');
