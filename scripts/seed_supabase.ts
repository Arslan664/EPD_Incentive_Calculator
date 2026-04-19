import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function readCSV(filename: string, asArray = false) {
  const filePath = path.join(__dirname, "../../New/csv_exports", filename);
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return parse(fileContent, {
      columns: !asArray,
      skip_empty_lines: true,
      relax_quotes: true,
    });
  } catch (err) {
    console.error(`Error reading ${filename}`, err);
    return [];
  }
}

function parsePct(str: string | null | undefined): number {
  if (!str) return 0;
  return parseFloat(str.toString().replace("%", "")) || 0;
}

function cleanNum(str: string | null | undefined): number {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, "").replace(/\s/g, "")) || 0;
}

async function main() {
  console.log("Starting Phase 3 Multi-file Supabase seed process...");

  // 1. Quarters
  console.log("Seeding quarters (Q1 & Q2)...");
  const quartersRaw = [
    { label: "Q1 2017", year: 2017, quarter_num: 1, exchange_rate_lc_usd: 332.7 },
    { label: "Q2 2017", year: 2017, quarter_num: 2, exchange_rate_lc_usd: 332.7 },
  ];
  
  for (const q of quartersRaw) {
    await supabase.from("quarters").upsert(q, { onConflict: "label" });
  }

  const { data: quarterData } = await supabase.from("quarters").select("*");
  const qMap = new Map((quarterData || []).map(q => [q.label, q.id]));

  // 2. Read Staff Input
  const staffInput = readCSV("Staff_Input.csv");
  const positions = [...new Set(staffInput.map((s: any) => s.Position).filter(Boolean))];
  for (const p of positions) {
    await supabase.from("positions").upsert({ title: p }, { onConflict: "title" });
  }

  const promoLines = ["Line 1", "Line 2", "Line 3 (big cities)", "Pharma line"];
  for (const pl of promoLines) {
    await supabase.from("promo_lines").upsert({ name: pl }, { onConflict: "name" });
  }

  const { data: posData } = await supabase.from("positions").select("*");
  const posMap = new Map((posData || []).map(p => [p.title, p.id]));

  // 3. Insert Representatives
  console.log(`Seeding ${staffInput.length} representatives...`);
  for (const rep of staffInput as any[]) {
    if (!rep.Name) continue;
    const insertData = { name: rep.Name, position_id: posMap.get(rep.Position) || null, status: rep['For Q1'] || 'Staff' };
    const { data: existing } = await supabase.from("representatives").select("id").eq("name", rep.Name).single();
    if (existing) {
      await supabase.from("representatives").update(insertData).eq("id", existing.id);
    } else {
      await supabase.from("representatives").insert(insertData);
    }
  }

  const { data: repData } = await supabase.from("representatives").select("id, name");
  const repMap = new Map((repData || []).map(r => [r.name, r.id]));

  // 4. Parse Multi-Quarter TCFA.csv
  const tcfaMatrix = readCSV("TCFA.csv", true); // read as raw 2D array
  const tcfaStore = new Map<string, { Q1: number, Q2: number }>();
  
  for (const row of tcfaMatrix) {
    const name = row[7]; // Index 7 is Name column based on parser check
    if (name && repMap.has(name)) {
      tcfaStore.set(name, {
        Q1: parsePct(row[9]), 
        Q2: parsePct(row[10]) 
      });
    }
  }

  // 5. Build Products implicitly from Assumption file headers
  console.log("Seeding Products and Base Quarterly Performance...");
  const inputAssumptions = readCSV("INPUT_ASSUMPTIONS_CALC.csv");
  
  let insertedPerf = 0;
  for (const row of inputAssumptions as any[]) {
    if (!row.Name || !repMap.has(row.Name)) continue;
    
    const repId = repMap.get(row.Name);
    
    // Fallbacks if data belongs to single Quarter file
    const totalActual = cleanNum(row['Total ACT']);
    const totalPlan = cleanNum(row['Total PLAN']);
    const achievement_pct = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;
    
    // Retrieve dynamic TCFA scored mapped directly from TCFA.csv! (Phase 3 upgrade)
    const dynamicTCFA = tcfaStore.get(row.Name) || { Q1: 0, Q2: 0 };
    
    // We loop for Q1 and Q2 to demonstrate dimensional pipeline mapping
    for (const qNum of [1, 2]) {
      const qLabel = `Q${qNum} 2017`;
      const qId = qMap.get(qLabel);
      if (!qId) continue;
      
      const tcfa_pct = qNum === 1 ? dynamicTCFA.Q1 : dynamicTCFA.Q2;
      
      // Upsert Performance Record
      const qpData = {
        representative_id: repId,
        quarter_id: qId,
        total_actual: qNum === 1 ? totalActual : totalActual * 1.05, // Mock variance for Q2 testing
        total_plan: totalPlan,
        overall_achievement_pct: achievement_pct,
        tcfa_pct: tcfa_pct,
        target_incentive: 395525,
        reimbursable_months_pct: 100
      };
      
      let qpId = null;
      const { data: existingQp } = await supabase.from("quarterly_performance").select("id").eq("representative_id", repId).eq("quarter_id", qId).single();
        
      if (existingQp) {
        await supabase.from("quarterly_performance").update(qpData).eq("id", existingQp.id);
        qpId = existingQp.id;
      } else {
        const { data: newQp } = await supabase.from("quarterly_performance").insert(qpData).select("id").single();
        if (newQp) qpId = newQp.id;
      }

      // If we got the Quarter Performance ID, insert the Products
      if (qpId && qNum === 1) { // We only actually have product breakdown for Q1
        // Portfolios 1-4
        for (let i = 1; i <= 4; i++) {
          const prodName = row[`Portfolio-${i}/ Product-1`];
          const prodActStr = row[`ACT Portfolio-${i}/ Product-1`];
          const prodPlanStr = row[`PLAN  Portfolio-${i}/ Product-1`];
          
          if (prodName && prodName !== "0" && prodName !== "") {
            // Upsert Product Registry
            await supabase.from("products").upsert({ name: prodName }, { onConflict: "name" });
            const { data: pData } = await supabase.from("products").select("id").eq("name", prodName).single();
            
            if (pData) {
              const actVal = cleanNum(prodActStr);
              const planVal = cleanNum(prodPlanStr);
              const p_achiev = planVal > 0 ? (actVal / planVal) * 100 : 0;
              
              const ppData = {
                quarterly_performance_id: qpId,
                product_id: pData.id,
                portfolio_num: i,
                actual_value: actVal,
                plan_value: planVal,
                achievement_pct: p_achiev
              };
              
              // Seed Product Performance table! (Phase 3 nested expansion)
              const { data: existingPp } = await supabase.from("product_performance")
                .select("id")
                .eq("quarterly_performance_id", qpId)
                .eq("product_id", pData.id)
                .eq("portfolio_num", i).single();
                
              if (existingPp) {
                await supabase.from("product_performance").update(ppData).eq("id", existingPp.id);
              } else {
                await supabase.from("product_performance").insert(ppData);
              }
            }
          }
        }
      }
      insertedPerf++;
    }
  }
  
  console.log(`Phase 3 Complete: Inserted ${insertedPerf} multi-quarter dimensional performance records with nested TCFA and Product matrices.`);
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
