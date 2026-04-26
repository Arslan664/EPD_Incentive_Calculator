"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2,
  X, ChevronDown, Globe, Database, RefreshCw, Eye,
  FileCheck, Info, Layers, ArrowRight,
} from "lucide-react";
import { UPLOAD_TYPES } from "@/lib/excelParser";

/* ── Design tokens ─────────────────────────────────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BLUE   = "#0057A8";
const BORDER = "#D0DCE8";
const BG     = "#F0F4F8";
const T_MAIN = "#0F1827";
const T_MUT  = "#3D5875";
const T_SUB  = "#6B8499";
const GREEN  = "#0E7A4F";
const AMBER  = "#B45309";
const RED    = "#B91C1C";

/* ── Countries ──────────────────────────────────────────────────── */
const COUNTRIES = [
  { value: "Kazakhstan",   label: "Kazakhstan",   flag: "🇰🇿" },
  { value: "Uzbekistan",   label: "Uzbekistan",   flag: "🇺🇿" },
  { value: "Georgia",      label: "Georgia",      flag: "🇬🇪" },
  { value: "Azerbaijan",   label: "Azerbaijan",   flag: "🇦🇿" },
  { value: "Armenia",      label: "Armenia",      flag: "🇦🇲" },
  { value: "Kyrgyzstan",   label: "Kyrgyzstan",   flag: "🇰🇬" },
  { value: "Tajikistan",   label: "Tajikistan",   flag: "🇹🇯" },
  { value: "Turkmenistan", label: "Turkmenistan", flag: "🇹🇲" },
];

/* ── Upload modes ────────────────────────────────────────────────── */
const UPLOAD_MODES = [
  { value: "upsert",  label: "Upsert",  description: "Add new + update existing rows" },
  { value: "append",  label: "Append",  description: "Add only new rows, skip duplicates" },
  { value: "replace", label: "Replace", description: "Delete existing data for this period first" },
];

type UploadStatus = "idle" | "parsing" | "uploading" | "success" | "error";

interface UploadResult {
  rowsParsed: number;
  rowsMapped: number;
  sheetCount: number;
  fileName:   string;
  table:      string;
  preview:    Record<string, unknown>[];
  dbStatus:   { staged: boolean; message: string };
}

/* ── Custom Select ───────────────────────────────────────────────── */
function Select({
  label, value, onChange, options, placeholder, icon: Icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string; flag?: string; description?: string }[];
  placeholder: string; icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: T_SUB }} />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl py-3 pl-10 pr-10 text-sm font-medium outline-none transition-all cursor-pointer"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${value ? BLUE : BORDER}`,
            color: value ? T_MAIN : T_SUB,
            boxShadow: value ? `0 0 0 3px rgba(0,87,168,0.08)` : "none",
          }}
          onFocus={e => {
            e.target.style.borderColor = BLUE;
            e.target.style.boxShadow = "0 0 0 3px rgba(0,87,168,0.10)";
          }}
          onBlur={e => {
            e.target.style.borderColor = value ? BLUE : BORDER;
            e.target.style.boxShadow = value ? "0 0 0 3px rgba(0,87,168,0.08)" : "none";
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.flag ? `${o.flag} ` : ""}{o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: T_SUB }} />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function DataUploader() {
  const [country,    setCountry]    = useState("");
  const [uploadType, setUploadType] = useState("");
  const [quarter,    setQuarter]    = useState("");
  const [mode,       setMode]       = useState("upsert");
  const [file,       setFile]       = useState<File | null>(null);
  const [status,     setStatus]     = useState<UploadStatus>("idle");
  const [result,     setResult]     = useState<UploadResult | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType   = UPLOAD_TYPES.find(t => t.id === uploadType);
  const selectedCountry = COUNTRIES.find(c => c.value === country);
  const canUpload = !!country && !!uploadType && !!file;

  // Quarter options (dynamic, last 8 quarters)
  const quarterOptions = (() => {
    const opts = [];
    const now = new Date();
    let y = now.getFullYear();
    let q = Math.ceil((now.getMonth() + 1) / 3);
    for (let i = 0; i < 8; i++) {
      opts.push({ value: `Q${q} ${y}`, label: `Q${q} ${y}` });
      q--;
      if (q === 0) { q = 4; y--; }
    }
    return opts;
  })();

  const handleFile = useCallback((f: File) => {
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg("Only .xlsx, .xls, or .csv files are supported.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!canUpload) return;
    setStatus("uploading");
    setResult(null);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file",       file!);
      fd.append("uploadType", uploadType);
      fd.append("country",    country);
      fd.append("quarter",    quarter);
      fd.append("mode",       mode);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || "Upload failed.");
        setStatus("error");
        return;
      }

      setResult(json);
      setStatus("success");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null); setStatus("idle"); setResult(null);
    setErrorMsg(""); setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-7"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #152F60 100%)`,
          boxShadow: "0 8px 40px rgba(11,31,58,0.28)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,87,168,0.18) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,87,168,0.28)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.35)" }}>
                <Upload className="w-3 h-3" /> Data Uploader
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(14,122,79,0.18)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.28)" }}>
                <Database className="w-3 h-3" /> Supabase Connected
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "#FFFFFF" }}>
              Upload Incentive Data
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed max-w-lg" style={{ color: "rgba(160,191,206,0.70)" }}>
              Select country, map your Excel file to the correct database table, and upload.
              Supported formats: <span className="text-white font-semibold">.xlsx · .xls · .csv</span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {[
              { label: "Tables", value: UPLOAD_TYPES.length.toString(), icon: Database },
              { label: "Countries", value: COUNTRIES.length.toString(), icon: Globe },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className="flex flex-col items-center justify-center w-20 h-18 rounded-xl border px-3 py-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(160,191,206,0.18)" }}>
                  <Icon className="w-4 h-4 mb-1" style={{ color: "rgba(160,191,206,0.70)" }} />
                  <p className="text-xl font-black leading-none" style={{ color: "#FFFFFF" }}>{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(160,191,206,0.45)" }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Table Map Reference ────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>
        <div className="px-5 py-3.5 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: BG }}>
          <Layers className="w-4 h-4" style={{ color: T_SUB }} />
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
            Excel → Database Table Mapping
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 divide-x divide-y" style={{ borderColor: BORDER }}>
          {UPLOAD_TYPES.map(t => (
            <div key={t.id} className="px-4 py-3.5 flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                style={{ backgroundColor: `${t.color}14`, color: t.color, border: `1px solid ${t.color}30` }}>
                {t.badge}
              </span>
              <p className="text-[12px] font-bold" style={{ color: T_MAIN }}>{t.label}</p>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: T_SUB }} />
                <code className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: BG, color: BLUE, border: `1px solid ${BORDER}` }}>
                  {t.table}
                </code>
              </div>
              <p className="text-[10px] font-medium leading-relaxed" style={{ color: T_SUB }}>{t.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upload Form ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Config selects */}
        <div className="lg:col-span-1 flex flex-col gap-4 rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>

          <p className="text-[11px] font-black uppercase tracking-widest pb-1" style={{ color: T_SUB, borderBottom: `1px solid ${BORDER}` }}>
            Upload Configuration
          </p>

          {/* Country */}
          <Select
            label="Country *"
            value={country}
            onChange={setCountry}
            options={COUNTRIES}
            placeholder="Select country…"
            icon={Globe}
          />

          {/* Upload type / table */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
              File Type → DB Table *
            </label>
            <div className="flex flex-col gap-2">
              {UPLOAD_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setUploadType(t.id)}
                  className="flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    backgroundColor: uploadType === t.id ? `${t.color}0D` : "#FAFBFC",
                    border: `1.5px solid ${uploadType === t.id ? t.color : BORDER}`,
                    boxShadow: uploadType === t.id ? `0 0 0 3px ${t.color}14` : "none",
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${t.color}14`, border: `1px solid ${t.color}30` }}>
                    <FileSpreadsheet className="w-3.5 h-3.5" style={{ color: t.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold leading-snug" style={{ color: T_MAIN }}>{t.label}</p>
                    <code className="text-[9px] font-bold" style={{ color: t.color }}>→ {t.table}</code>
                  </div>
                  {uploadType === t.id && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.color }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quarter (optional) */}
          <Select
            label="Quarter (optional)"
            value={quarter}
            onChange={setQuarter}
            options={quarterOptions}
            placeholder="Auto-detect from file…"
            icon={Layers}
          />

          {/* Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Upload Mode</label>
            <div className="flex flex-col gap-1.5">
              {UPLOAD_MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    backgroundColor: mode === m.value ? "rgba(0,87,168,0.07)" : "#FAFBFC",
                    border: `1.5px solid ${mode === m.value ? BLUE : BORDER}`,
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: mode === m.value ? BLUE : BORDER }}>
                    {mode === m.value && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BLUE }} />}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: T_MAIN }}>{m.label}</p>
                    <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Drop zone + results */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Drop zone */}
          <div
            className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[260px] relative"
            style={{
              backgroundColor: isDragging ? "rgba(0,87,168,0.06)" : "#FFFFFF",
              border: `2px dashed ${isDragging ? BLUE : file ? GREEN : BORDER}`,
              boxShadow: isDragging ? `0 0 0 4px rgba(0,87,168,0.10)` : "0 1px 4px rgba(11,31,58,0.05)",
            }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-3 px-6 py-8 w-full">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(14,122,79,0.10)", border: "1.5px solid rgba(14,122,79,0.25)" }}>
                  <FileCheck className="w-7 h-7" style={{ color: GREEN }} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold" style={{ color: T_MAIN }}>{file.name}</p>
                  <p className="text-[11px] font-medium mt-1" style={{ color: T_SUB }}>
                    {(file.size / 1024).toFixed(1)} KB · {file.type || "spreadsheet"}
                  </p>
                </div>
                {selectedCountry && selectedType && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(0,87,168,0.08)", color: BLUE, border: "1px solid rgba(0,87,168,0.20)" }}>
                      {selectedCountry.flag} {selectedCountry.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${selectedType.color}14`, color: selectedType.color, border: `1px solid ${selectedType.color}30` }}>
                      → {selectedType.table}
                    </span>
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); reset(); }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: RED }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(185,28,28,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <X className="w-3.5 h-3.5" /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: BG, border: `1.5px solid ${BORDER}` }}>
                  <Upload className="w-7 h-7" style={{ color: T_SUB }} />
                </div>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: T_MAIN }}>Drop your Excel file here</p>
                  <p className="text-[12px] font-medium mt-1" style={{ color: T_SUB }}>
                    or <span className="font-bold" style={{ color: BLUE }}>click to browse</span>
                  </p>
                  <p className="text-[10px] font-medium mt-2" style={{ color: T_SUB }}>
                    Supports .xlsx · .xls · .csv
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation hints */}
          {selectedType && (
            <div className="rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: "rgba(0,87,168,0.04)", border: `1.5px solid rgba(0,87,168,0.14)` }}>
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
              <div>
                <p className="text-[11px] font-bold" style={{ color: BLUE }}>Required columns for <strong>{selectedType.label}</strong>:</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedType.requiredColumns.map(col => (
                    <code key={col} className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(0,87,168,0.08)", color: BLUE, border: "1px solid rgba(0,87,168,0.18)" }}>
                      {col}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!canUpload || status === "uploading"}
            className="w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5"
            style={canUpload && status !== "uploading"
              ? { background: `linear-gradient(135deg, ${BLUE} 0%, #004A91 100%)`, color: "#FFFFFF", boxShadow: "0 4px 20px rgba(0,87,168,0.35)", cursor: "pointer" }
              : { backgroundColor: BORDER, color: T_SUB, cursor: "not-allowed" }}
            onMouseEnter={e => { if (canUpload && status !== "uploading") (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(0,87,168,0.50)"; }}
            onMouseLeave={e => { if (canUpload && status !== "uploading") (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,87,168,0.35)"; }}
          >
            {status === "uploading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing file…</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload to Database</>
            )}
          </button>

          {!canUpload && (
            <p className="text-center text-[11px] font-medium" style={{ color: T_SUB }}>
              {!country ? "① Select a country" : !uploadType ? "② Choose the file type" : "③ Drop your Excel file"}
            </p>
          )}

          {/* ── Result Panel ─────────────────────────────────────────── */}
          {status === "success" && result && (
            <div className="rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ border: `1.5px solid rgba(14,122,79,0.30)`, boxShadow: "0 4px 20px rgba(14,122,79,0.10)" }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, rgba(14,122,79,0.12) 0%, rgba(14,122,79,0.06) 100%)`, borderBottom: "1px solid rgba(14,122,79,0.20)" }}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} />
                  <div>
                    <p className="text-[13px] font-black" style={{ color: GREEN }}>Upload Successful</p>
                    <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{result.fileName}</p>
                  </div>
                </div>
                <button onClick={reset} className="p-1.5 rounded-lg transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <RefreshCw className="w-4 h-4" style={{ color: T_SUB }} />
                </button>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Rows Parsed",   value: result.rowsParsed.toString() },
                  { label: "Rows Mapped",   value: result.rowsMapped.toString() },
                  { label: "Sheets Found",  value: result.sheetCount.toString() },
                  { label: "Target Table",  value: result.table },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>{s.label}</p>
                    <p className="text-lg font-black mt-0.5" style={{ color: T_MAIN }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: result.dbStatus.staged ? GREEN : AMBER }} />
                  <p className="text-[11px] font-semibold" style={{ color: result.dbStatus.staged ? GREEN : AMBER }}>
                    {result.dbStatus.message}
                  </p>
                </div>
                {result.preview?.length > 0 && (
                  <button
                    onClick={() => setShowPreview(v => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-bold transition-colors"
                    style={{ color: BLUE }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showPreview ? "Hide" : "Preview"} data
                  </button>
                )}
              </div>

              {/* Data preview table */}
              {showPreview && result.preview?.length > 0 && (
                <div className="overflow-x-auto px-5 pb-5">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 mt-1" style={{ color: T_SUB }}>
                    First {result.preview.length} rows mapped
                  </p>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr style={{ backgroundColor: BG }}>
                        {Object.keys(result.preview[0]).map(col => (
                          <th key={col} className="px-3 py-2 font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: T_SUB, border: `1px solid ${BORDER}` }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : BG }}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 whitespace-nowrap"
                              style={{ color: T_MAIN, border: `1px solid ${BORDER}` }}>
                              {String(val ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Error panel */}
          {status === "error" && errorMsg && (
            <div className="rounded-2xl p-5 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ backgroundColor: "rgba(185,28,28,0.06)", border: "1.5px solid rgba(185,28,28,0.25)" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: RED }} />
              <div className="flex-1">
                <p className="text-[13px] font-bold" style={{ color: RED }}>Upload Failed</p>
                <p className="text-[12px] font-medium mt-1 leading-relaxed" style={{ color: T_MUT }}>{errorMsg}</p>
                <button onClick={reset} className="mt-3 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: RED }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
