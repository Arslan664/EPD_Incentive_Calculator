import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile, validateRows, mapRowsToDbColumns, UPLOAD_TYPES } from "@/lib/excelParser";
import { createClient } from "@supabase/supabase-js";

// Use service role key for write access (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file       = formData.get("file")       as File | null;
    const uploadType = formData.get("uploadType") as string | null;
    const country    = formData.get("country")    as string | null;
    const quarter    = formData.get("quarter")    as string | null;
    const mode       = (formData.get("mode") as string) || "upsert"; // "upsert" | "append" | "replace"

    if (!file || !uploadType || !country) {
      return NextResponse.json({ error: "Missing required fields: file, uploadType, country" }, { status: 400 });
    }

    // Find upload type config
    const config = UPLOAD_TYPES.find(t => t.id === uploadType);
    if (!config) {
      return NextResponse.json({ error: `Unknown upload type: ${uploadType}` }, { status: 400 });
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer();
    const sheets = parseExcelFile(buffer);

    if (!sheets.length || !sheets[0].length) {
      return NextResponse.json({ error: "Excel file is empty or could not be parsed." }, { status: 400 });
    }

    // Use first sheet
    const rows = sheets[0];

    // Validate required columns
    const validation = validateRows(rows, config.requiredColumns);
    if (!validation.valid) {
      return NextResponse.json({
        error: `Missing required columns: ${validation.missing.join(", ")}`,
        detectedColumns: Object.keys(validation.sampleRow || {}),
        requiredColumns: config.requiredColumns,
      }, { status: 422 });
    }

    // Map Excel columns → DB column names
    const mapped = mapRowsToDbColumns(rows, config.columnMap as Record<string, string>);

    // Inject metadata: country + quarter context
    const enriched = mapped.map(row => ({
      ...row,
      country_name: country,
      ...(quarter ? { quarter_label: row.quarter_label || quarter } : {}),
      uploaded_at: new Date().toISOString(),
    }));

    // Write to Supabase — use raw insertion into a staging table
    // Data goes into `uploads_staging` for admin review, not directly into core tables.
    // This is safe and allows validation before promotion.
    const stagingPayload = enriched.map(row => ({
      upload_type: uploadType,
      country: country,
      quarter: quarter || null,
      row_data: row,
      mode,
      created_at: new Date().toISOString(),
    }));

    // Try direct upsert (works if uploads_staging table exists)
    // If not, we still return the parsed preview so the UI can show results
    let dbError = null;
    let dbResult = null;
    try {
      const { data, error } = await supabase
        .from("uploads_staging")
        .insert(stagingPayload);
      dbError = error;
      dbResult = data;
    } catch {
      dbError = { message: "uploads_staging table not found — data preview only" };
    }

    return NextResponse.json({
      success: true,
      rowsParsed: rows.length,
      rowsMapped: enriched.length,
      sheetCount: sheets.length,
      fileName: file.name,
      uploadType,
      country,
      quarter,
      mode,
      table: config.table,
      preview: enriched.slice(0, 5),
      dbStatus: dbError
        ? { staged: false, message: dbError.message }
        : { staged: true, message: `${enriched.length} rows staged successfully` },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({
      error: "Internal server error during file processing.",
      detail: String(err),
    }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
