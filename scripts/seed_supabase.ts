import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function readCSV(filename: string) {
  const filePath = path.join(__dirname, "../../New/csv_exports", filename);
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    });
  } catch (err) {
    console.error(`Error reading ${filename}`, err);
    return [];
  }
}

// Clean percentage strings (e.g. "90%" -> 90)
function parsePct(str: string | null | undefined): number {
  if (!str) return 0;
  return parseFloat(str.toString().replace("%", "")) || 0;
}

function cleanNum(str: string | null | undefined): number {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, "").replace(/\s/g, "")) || 0;
}

async function main() {
  console.log("Starting Supabase seed process...");

  // 1. Quarters
  console.log("Seeding quarters...");
  const quarters = [
    { label: "Q1 2017", year: 2017, quarter_num: 1, exchange_rate_lc_usd: 332.7 },
    { label: "Q2 2017", year: 2017, quarter_num: 2, exchange_rate_lc_usd: 332.7 },
  ];
  
  for (const q of quarters) {
    await supabase.from("quarters").upsert(q, { onConflict: "label" });
  }

  // Get quarter IDs
  const { data: quarterData } = await supabase.from("quarters").select("*");
  const q1_2017 = quarterData?.find(q => q.label === "Q1 2017")?.id;

  // 2. Read Staff Input
  console.log("Reading Staff Input...");
  const staffInput = readCSV("Staff_Input.csv");

  // 3. Extract unique positions, promo lines, etc.
  console.log("Seeding positions, promo lines...");
  const positions = [...new Set(staffInput.map((s: any) => s.Position).filter(Boolean))];
  for (const p of positions) {
    await supabase.from("positions").upsert({ title: p }, { onConflict: "title" });
  }

  // We infer promo lines from TCFA or assumption files normally, 
  // but for simplicity we'll just insert a dummy line or derive it.
  const promoLines = ["Line 1", "Line 2", "Line 3 (big cities)", "Pharma line"];
  for (const pl of promoLines) {
    await supabase.from("promo_lines").upsert({ name: pl }, { onConflict: "name" });
  }

  const { data: positionsData } = await supabase.from("positions").select("*");
  const { data: promoLinesData } = await supabase.from("promo_lines").select("*");

  const posMap = new Map((positionsData || []).map(p => [p.title, p.id]));
  const plMap = new Map((promoLinesData || []).map(pl => [pl.name, pl.id]));

  // 4. Insert Representatives
  console.log(`Seeding ${staffInput.length} representatives...`);
  for (const rep of staffInput as any[]) {
    if (!rep.Name) continue;
    
    // Attempt parsing dates if needed
    const posId = posMap.get(rep.Position) || null;
    
    const insertData = {
      name: rep.Name,
      position_id: posId,
      status: rep['For Q1'] || 'Staff',
    };
    
    // Upsert rep by name (assuming name is reasonably unique for seed)
    // First try to find existing to avoid duplicates if partial name matches
    const { data: existing } = await supabase.from("representatives").select("id").eq("name", rep.Name).single();
    
    if (existing) {
      await supabase.from("representatives").update(insertData).eq("id", existing.id);
    } else {
      await supabase.from("representatives").insert(insertData);
    }
  }

  const { data: repData } = await supabase.from("representatives").select("id, name");
  const repMap = new Map((repData || []).map(r => [r.name, r.id]));

  // 5. Quarterly Performance
  console.log("Reading Input Assumptions and TCFAs...");
  // Assuming we merge data from summary or comprehensiveData since standardizing the raw CSVs requires many specific maps.
  // Instead, since the system expects data logic, we'll read INPUT_ASSUMPTIONS_CALC.csv
  const inputAssumptions = readCSV("INPUT_ASSUMPTIONS_CALC.csv");
  
  let insertedPerf = 0;
  for (const row of inputAssumptions as any[]) {
    if (!row.Name || !repMap.has(row.Name)) continue;
    
    const repId = repMap.get(row.Name);
    
    const totalActual = cleanNum(row['Total ACT']);
    const totalPlan = cleanNum(row['Total PLAN']);
    const achievement_pct = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;
    
    // We'll set Q1 2017 as the quarter for this data
    if (q1_2017) {
      const qpData = {
        representative_id: repId,
        quarter_id: q1_2017,
        total_actual: totalActual,
        total_plan: totalPlan,
        overall_achievement_pct: achievement_pct,
        target_incentive: 395525, // default
        reimbursable_months_pct: 100
      };
      
      const { data: existingQp } = await supabase
        .from("quarterly_performance")
        .select("id")
        .eq("representative_id", repId)
        .eq("quarter_id", q1_2017)
        .single();
        
      if (existingQp) {
        await supabase.from("quarterly_performance").update(qpData).eq("id", existingQp.id);
      } else {
        await supabase.from("quarterly_performance").insert(qpData);
      }
      insertedPerf++;
    }
  }
  
  console.log(`Inserted ${insertedPerf} quarterly performance records.`);
  
  console.log("Seed process completed successfully. NOTE: Due to differences in raw CSV structures, this script seeds basic test reference data to satisfy relationships. To get the UI to connect properly, frontend queries should be adjusted to read from Supabase.");
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
