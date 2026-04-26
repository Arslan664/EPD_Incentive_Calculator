const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'proposal_assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
}

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  async function takeScreenshot(name) {
    const filename = path.join(ASSETS_DIR, name);
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`Saved screenshot: ${name}`);
  }

  // 1. Login
  console.log('Visiting login...');
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, ));
  await takeScreenshot('01_login.png');

  // Do login
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.type('arslansohail@abbott.com');
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    console.log('Clicked login...');
    await new Promise(r => setTimeout(r, )); // Wait for auth and load
  }

  // 2. Landing (Dashboard)
  await takeScreenshot('02_landing.png');

  // 3. Performance (Detailed View)
  console.log('Switching to detailed view...');
  // Assuming there's a button or tab that says "Detailed" or we just wait if we are already there
  // Based on Dashboard.tsx there are tabs: "Performance Dashboard", "Sales Rep Directory", "Product Promos", "Summary Dashboard", "Approval / Sign-Off"
  // Let's click on the views using querySelectors or evaluating clicks
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Detailed'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, ));
  await takeScreenshot('03_performance.png');

  // 4. Summary View
  console.log('Switching to Summary view...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Summary'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, ));
  await takeScreenshot('04_summary.png');

  // 5. Sign Off View
  console.log('Switching to Sign Off view...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Sign Off'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, ));
  await takeScreenshot('05_sign_off.png');

  // Navigate to Admin View
  console.log('Switching to Admin panel...');
  await page.evaluate(() => {
    // Left navigation sidebar buttons
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Admin Console'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, ));
  await takeScreenshot('admin_overview.png');

  // We should click internal tabs within Admin
  const adminTabs = [
    { label: 'Incentive Plan Config', img: 'admin_icp.png' },
    { label: 'Payout Grids', img: 'admin_payout.png' },
    { label: 'Target Setting', img: 'admin_target.png' },
    { label: 'Qualitative KPIs', img: 'admin_qual.png' },
    { label: 'Approval Chains', img: 'admin_approval.png' },
    { label: 'Compliance (OEC)', img: 'admin_compliance.png' },
    { label: 'Territory Setup', img: 'admin_territory.png' },
    { label: 'Incentive Simulator', img: 'admin_simulator.png' },
    { label: 'Executive Analytics', img: 'admin_analytics.png' },
  ];

  for (const tab of adminTabs) {
    console.log(`Clicking ${tab.label}...`);
    await page.evaluate((label) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes(label));
      if (btn) btn.click();
    }, tab.label);
    await new Promise(r => setTimeout(r, ));
    await takeScreenshot(tab.img);

    if (tab.label === 'Executive Analytics') {
      // Sub-tabs in analytics
      const analyticsTabs = [
        { label: 'KPI Summary', img: 'analytics_kpi.png' },
        { label: 'Performance Distribution', img: 'analytics_dist.png' },
        { label: 'Composition Analysis', img: 'analytics_composition.png' },
        { label: 'Regression Analysis', img: 'analytics_regression.png' },
        { label: 'Pay Differentiation', img: 'analytics_paydiff.png' },
        { label: 'Boom-Bust', img: 'analytics_boombust.png' },
        { label: 'Role Equity', img: 'analytics_equity.png' },
        { label: 'IC Timeline', img: 'analytics_timeline.png' }
      ];
      for (const atab of analyticsTabs) {
        await page.evaluate((label) => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent && b.textContent.includes(label));
          if (btn) btn.click();
        }, atab.label);
        await new Promise(r => setTimeout(r, ));
        await takeScreenshot(atab.img);
      }
    }
  }

  await browser.close();
  console.log('Done!');
}

captureScreenshots().catch(e => {
  console.error("Error capturing screenshots", e);
  process.exit(1);
});
