-- ============================================================
-- EPD Incentive Dashboard — Normalized Database Schema
-- Supabase / PostgreSQL Migration
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. LOOKUP TABLES (Reference / Dimension tables)
-- ============================================================

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Regions (e.g., KZ-ALM1, KZ-AST, KZ-CKO)
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT,
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cities
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, region_id)
);

-- Positions (Medical Representative, Pharm Representative, Regional Manager)
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Promo Lines (Line 1, Line 2, Line 2 (big cities), etc.)
CREATE TABLE promo_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products (CREON, DUPHASTON, HEPTRAL, etc.)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    therapeutic_area TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quarters (Q1 2017, Q2 2017, etc.)
CREATE TABLE quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL UNIQUE,   -- e.g., "Q1 2017"
    year INT NOT NULL,
    quarter_num INT NOT NULL CHECK (quarter_num BETWEEN 1 AND 4),
    exchange_rate_lc_usd NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(year, quarter_num)
);

-- ============================================================
-- 2. CORE ENTITY TABLES
-- ============================================================

-- Representatives (Medical Reps, Pharm Reps, Regional Managers)
CREATE TABLE representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    promo_line_id UUID REFERENCES promo_lines(id) ON DELETE SET NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    starting_date DATE,
    maternity_leave_start DATE,
    maternity_leave_end DATE,
    status TEXT DEFAULT 'Staff',  -- Staff, Newcomer, Maternity leave, freeze
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for name lookups (used heavily in JOINs with CSV data)
CREATE INDEX idx_representatives_name ON representatives(name);

-- Regional Manager assignments (which manager manages which region per quarter)
CREATE TABLE regional_managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id UUID NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(representative_id, region_id, quarter_id)
);

-- ============================================================
-- 3. PERFORMANCE / FACT TABLES
-- ============================================================

-- Quarterly Performance (one row per rep per quarter)
CREATE TABLE quarterly_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id UUID NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    total_actual NUMERIC DEFAULT 0,
    total_plan NUMERIC DEFAULT 0,
    overall_achievement_pct NUMERIC,     -- e.g., 103%
    tcfa_pct NUMERIC,                    -- e.g., 90%
    time_in_coaching_pct NUMERIC,        -- e.g., 61% (RM only)
    reimbursable_months_pct NUMERIC,     -- e.g., 100%, 67%, 33%
    reimbursed_months INT DEFAULT 3,
    target_incentive NUMERIC DEFAULT 0,
    status TEXT,                          -- Staff, Newcomer, Maternity leave
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(representative_id, quarter_id)
);

CREATE INDEX idx_qp_rep ON quarterly_performance(representative_id);
CREATE INDEX idx_qp_quarter ON quarterly_performance(quarter_id);

-- Product Performance (per-product breakdown within a quarterly performance)
CREATE TABLE product_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarterly_performance_id UUID NOT NULL REFERENCES quarterly_performance(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    portfolio_num INT NOT NULL CHECK (portfolio_num BETWEEN 1 AND 4),
    portfolio_share_pct NUMERIC,          -- e.g., 50%, 25%
    actual_value NUMERIC DEFAULT 0,
    plan_value NUMERIC DEFAULT 0,
    achievement_pct NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(quarterly_performance_id, product_id, portfolio_num)
);

CREATE INDEX idx_pp_qp ON product_performance(quarterly_performance_id);

-- ============================================================
-- 4. PAYMENT COEFFICIENTS LOOKUP TABLE
-- ============================================================
-- Achievement % → Payment Multiplier mapping.
-- Incentive calculations are computed at RUNTIME from this lookup
-- combined with quarterly_performance + product_performance data.
-- The Summary_calculation.csv sheet is NOT stored — it is derived.

CREATE TABLE payment_coefficients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_achievement_pct NUMERIC NOT NULL,
    max_achievement_pct NUMERIC NOT NULL,
    coefficient NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(min_achievement_pct, max_achievement_pct)
);

-- Seed the payment coefficient lookup (Achievement % → Payout Multiplier)
INSERT INTO payment_coefficients (min_achievement_pct, max_achievement_pct, coefficient) VALUES
    (0, 89, 0),
    (90, 90, 0.70),
    (91, 91, 0.70),
    (92, 92, 0.70),
    (93, 93, 0.70),
    (94, 94, 0.70),
    (95, 95, 0.80),
    (96, 96, 0.82),
    (97, 97, 0.85),
    (98, 98, 0.90),
    (99, 99, 0.96),
    (100, 100, 1.00),
    (101, 101, 1.10),
    (102, 102, 1.20),
    (103, 103, 1.30),
    (104, 104, 1.40),
    (105, 105, 1.40),
    (106, 106, 1.60),
    (107, 107, 1.70),
    (108, 108, 1.80),
    (109, 109, 1.80),
    (110, 114, 2.00),
    (115, 119, 2.15),
    (120, 124, 2.30),
    (125, 129, 2.50),
    (130, 9999, 2.50);

-- ============================================================
-- 5. TCFA SCORES
-- ============================================================

CREATE TABLE tcfa_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id UUID NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    personal_target_pct NUMERIC,
    grand_total_pct NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(representative_id, quarter_id)
);

CREATE INDEX idx_tcfa_rep ON tcfa_scores(representative_id);

-- ============================================================
-- 6. PROMO LINE ↔ PRODUCT MAPPING (per quarter)
-- ============================================================

CREATE TABLE promo_line_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_line_id UUID NOT NULL REFERENCES promo_lines(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    portfolio_num INT NOT NULL CHECK (portfolio_num BETWEEN 1 AND 4),
    portfolio_share_pct NUMERIC,
    product_position INT DEFAULT 1,   -- position within the portfolio
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(promo_line_id, product_id, quarter_id, portfolio_num)
);

-- ============================================================
-- 7. ROW LEVEL SECURITY (open read for dashboard)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcfa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_line_products ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (dashboard is public/internal)
CREATE POLICY "Allow public read" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON regions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON positions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON promo_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON quarters FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON representatives FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON regional_managers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON quarterly_performance FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON product_performance FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON payment_coefficients FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tcfa_scores FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON promo_line_products FOR SELECT USING (true);

-- ============================================================
-- 8. VIEWS (reconstruct the flat dashboard data)
-- ============================================================

-- View: Dashboard Detailed (matches the original comprehensive_data structure)
-- NOTE: Incentive financials are computed CLIENT-SIDE via incentiveCalculations.ts
-- This view provides the raw performance data needed for those calculations.
CREATE OR REPLACE VIEW v_dashboard_detailed AS
SELECT
    r.id AS rep_id,
    r.name,
    p.title AS position,
    pl.name AS promo_line,
    c.name AS city,
    q.label AS quarter,
    q.year,
    q.quarter_num,
    q.exchange_rate_lc_usd,
    qp.total_actual,
    qp.total_plan,
    qp.overall_achievement_pct,
    qp.tcfa_pct,
    qp.time_in_coaching_pct,
    qp.reimbursable_months_pct,
    qp.reimbursed_months,
    qp.target_incentive,
    qp.status AS work_status,
    MAX(CASE WHEN pp.portfolio_num = 1 THEN pr.name END) AS p1_name,
    MAX(CASE WHEN pp.portfolio_num = 1 THEN pp.actual_value END) AS p1_actual,
    MAX(CASE WHEN pp.portfolio_num = 1 THEN pp.plan_value END) AS p1_plan,
    MAX(CASE WHEN pp.portfolio_num = 2 THEN pr.name END) AS p2_name,
    MAX(CASE WHEN pp.portfolio_num = 2 THEN pp.actual_value END) AS p2_actual,
    MAX(CASE WHEN pp.portfolio_num = 2 THEN pp.plan_value END) AS p2_plan,
    MAX(CASE WHEN pp.portfolio_num = 3 THEN pr.name END) AS p3_name,
    MAX(CASE WHEN pp.portfolio_num = 3 THEN pp.actual_value END) AS p3_actual,
    MAX(CASE WHEN pp.portfolio_num = 3 THEN pp.plan_value END) AS p3_plan,
    MAX(CASE WHEN pp.portfolio_num = 4 THEN pr.name END) AS p4_name,
    MAX(CASE WHEN pp.portfolio_num = 4 THEN pp.actual_value END) AS p4_actual,
    MAX(CASE WHEN pp.portfolio_num = 4 THEN pp.plan_value END) AS p4_plan
FROM representatives r
LEFT JOIN positions p ON r.position_id = p.id
LEFT JOIN promo_lines pl ON r.promo_line_id = pl.id
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN quarterly_performance qp ON qp.representative_id = r.id
LEFT JOIN quarters q ON qp.quarter_id = q.id
LEFT JOIN product_performance pp ON pp.quarterly_performance_id = qp.id
LEFT JOIN products pr ON pp.product_id = pr.id
WHERE qp.id IS NOT NULL
GROUP BY 
    r.id, r.name, p.title, pl.name, c.name, q.label, q.year, q.quarter_num, q.exchange_rate_lc_usd,
    qp.total_actual, qp.total_plan, qp.overall_achievement_pct, qp.tcfa_pct, qp.time_in_coaching_pct,
    qp.reimbursable_months_pct, qp.reimbursed_months, qp.target_incentive, qp.status;

-- View: Dashboard Summary — Base data for computed incentive calculations
-- The actual financial calculations (target base, product amounts, TCFA/coaching
-- incentives, total incentive) are computed client-side in lib/incentiveCalculations.ts
-- using the portfolio shares, achievement %, and payment coefficients.
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
    r.id AS rep_id,
    r.name,
    p.title AS position,
    pl.name AS promo_line,
    q.label AS quarter,
    q.year,
    q.quarter_num,
    q.exchange_rate_lc_usd,
    qp.target_incentive,
    qp.reimbursable_months_pct,
    qp.total_actual,
    qp.total_plan,
    qp.overall_achievement_pct,
    qp.tcfa_pct,
    qp.time_in_coaching_pct,
    qp.status AS work_status
FROM quarterly_performance qp
JOIN representatives r ON qp.representative_id = r.id
JOIN positions p ON r.position_id = p.id
JOIN promo_lines pl ON r.promo_line_id = pl.id
JOIN quarters q ON qp.quarter_id = q.id
WHERE r.name IS NOT NULL AND r.name != ''
ORDER BY q.year, q.quarter_num, r.name;

-- View: Sign-Off / Statement of Bonuses
-- Provides base data for the sign-off page. Financial calculations
-- are computed client-side using the same incentiveCalculations.ts engine.
CREATE OR REPLACE VIEW v_sign_off AS
SELECT
    r.id AS rep_id,
    r.name,
    p.title AS position,
    q.label AS quarter,
    q.year,
    q.quarter_num,
    q.exchange_rate_lc_usd,
    qp.target_incentive,
    qp.reimbursable_months_pct,
    qp.total_actual,
    qp.total_plan,
    qp.overall_achievement_pct,
    qp.tcfa_pct,
    qp.time_in_coaching_pct
FROM quarterly_performance qp
JOIN representatives r ON qp.representative_id = r.id
JOIN positions p ON r.position_id = p.id
JOIN quarters q ON qp.quarter_id = q.id
WHERE r.name IS NOT NULL AND r.name != ''
ORDER BY q.year, q.quarter_num, r.name;
