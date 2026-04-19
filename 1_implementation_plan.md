# Supabase Normalized Database Migration Plan

## Background

Migrate the EPD Incentive Dashboard data from flat Excel/CSV files into a normalized PostgreSQL database on **Supabase**. The current data is a denormalized, single-array blob (`comprehensive_data.js`) with ~90 records per quarter, combining staff info, product performance, TCFA scores, and financial summaries into one massive flat object per rep.

## Current Data Sources (9 CSV files)

| File | Purpose | Key Fields |
|---|---|---|
| `Staff_Input.csv` | Employee roster | Name, Position, Start Date, Leave dates, Quarterly work status |
| `Promo_Product_Input.csv` | Product-to-PromoLine mapping per quarter | PromoLine, Portfolio shares, Product names |
| `INPUT_ASSUMPTIONS_CALC.csv` | Detailed performance (actuals vs plans) | Quarter, Rep, Products (P1-P4), Act/Plan values, TCFA%, Achievement% |
| `Summary_calculation.csv` | Financial summary | Target incentives, Product payouts, TCFA/Coaching amounts |
| `TCFA.csv` | TCFA compliance scores | Rep name, Q1-Q4 percentages |
| `Mapping.csv` | Rep-to-Region-to-Manager hierarchy | Rep, City, Regional Manager, PromoLine |
| `TIC.csv` | Time in Coaching data | Manager coaching % |
| `To_sign.csv` | Approval/sign-off data | Sign-off records |

---

## Proposed Normalized Schema (3NF)

```mermaid
erDiagram
    countries ||--o{ regions : has
    regions ||--o{ cities : has
    cities ||--o{ representatives : "based_in"
    positions ||--o{ representatives : "holds"
    promo_lines ||--o{ representatives : "assigned_to"
    representatives ||--o{ quarterly_performance : "achieves"
    quarters ||--o{ quarterly_performance : "in_period"
    quarterly_performance ||--o{ product_performance : "breaks_down_to"
    products ||--o{ product_performance : "tracked_via"
    promo_lines ||--o{ promo_line_products : "contains"
    products ||--o{ promo_line_products : "listed_in"
    quarters ||--o{ promo_line_products : "active_in"
    representatives ||--o{ incentive_calculations : "earns"
    quarters ||--o{ incentive_calculations : "for_period"
    representatives ||--o{ tcfa_scores : "scored_on"
    quarters ||--o{ tcfa_scores : "in_period"
    regions ||--o{ regional_managers : "managed_by"

    countries {
        uuid id PK
        text name UK
        text code
    }

    regions {
        uuid id PK
        text code UK
        text name
        uuid country_id FK
    }

    cities {
        uuid id PK
        text name
        uuid region_id FK
    }

    positions {
        uuid id PK
        text title UK
    }

    promo_lines {
        uuid id PK
        text name UK
    }

    products {
        uuid id PK
        text name UK
        text therapeutic_area
    }

    quarters {
        uuid id PK
        text label UK
        int year
        int quarter_num
        numeric exchange_rate_lc_usd
    }

    representatives {
        uuid id PK
        text name
        uuid position_id FK
        uuid promo_line_id FK
        uuid city_id FK
        date starting_date
        date maternity_leave_start
        date maternity_leave_end
        text status
    }

    regional_managers {
        uuid id PK
        uuid representative_id FK
        uuid region_id FK
        uuid quarter_id FK
    }

    quarterly_performance {
        uuid id PK
        uuid representative_id FK
        uuid quarter_id FK
        numeric total_actual
        numeric total_plan
        numeric overall_achievement_pct
        numeric tcfa_pct
        numeric time_in_coaching_pct
        numeric reimbursable_months_pct
        int reimbursed_months
        numeric target_incentive
    }

    product_performance {
        uuid id PK
        uuid quarterly_performance_id FK
        uuid product_id FK
        int portfolio_num
        numeric portfolio_share_pct
        numeric actual_value
        numeric plan_value
        numeric achievement_pct
    }

    incentive_calculations {
        uuid id PK
        uuid representative_id FK
        uuid quarter_id FK
        numeric target_for_quarter_lc
        numeric target_base_lc
        numeric target_sales_result
        numeric product1_amount
        numeric product2_amount
        numeric product3_amount
        numeric product4_amount
        numeric inc_sales_result
        numeric target_tcfa
        numeric target_coaching
        numeric inc_tcfa
        numeric inc_coaching
        numeric field_work
        numeric total_incentive_lc
    }

    tcfa_scores {
        uuid id PK
        uuid representative_id FK
        uuid quarter_id FK
        numeric personal_target_pct
        numeric grand_total_pct
    }

    promo_line_products {
        uuid id PK
        uuid promo_line_id FK
        uuid product_id FK
        uuid quarter_id FK
        int portfolio_num
        numeric portfolio_share_pct
        int product_position
    }
```

## User Review Required

> [!IMPORTANT]
> **Supabase Project**: You'll need to create a Supabase project at [supabase.com](https://supabase.com) and provide the **project URL** and **anon/service_role key** before we can connect the Next.js app.

> [!WARNING]
> **Data Accuracy**: The CSV data contains some quirks:
> - Numbers use comma thousands separators (`"395,525.00"`) — the migration script will clean these
> - Some names have Cyrillic characters in the Mapping/TCFA files — we'll match on English names only
> - `Country` is not explicit in the data (currently hardcoded as Kazakhstan) — do you have data for Country 87 (Georgia) mentioned in `Summary_calculation.csv`?
> - Some reps appear multiple times (e.g., `Issakova Dina` with different date ranges) — this is handled as separate assignment periods

## Proposed Changes

### Phase 1: Database Schema

#### [NEW] `supabase/migrations/001_create_schema.sql`
- SQL migration file with all 13 tables above
- RLS (Row Level Security) policies for read access
- Indexes on foreign keys and commonly filtered columns (`quarter_id`, `representative_id`)
- Composite unique constraints to prevent duplicate entries

---

### Phase 2: Seed Script

#### [NEW] `scripts/seed_supabase.ts`
A Node.js/TypeScript script that:
1. Reads all 9 CSV files from `New/csv_exports/`
2. Parses and deduplicates **lookup tables** (countries, regions, cities, positions, promo_lines, products, quarters)
3. Creates **representatives** by cross-referencing `Staff_Input.csv` + `Mapping.csv`
4. Inserts **quarterly_performance** + **product_performance** from `INPUT_ASSUMPTIONS_CALC.csv`
5. Inserts **incentive_calculations** from `Summary_calculation.csv`
6. Inserts **tcfa_scores** from `TCFA.csv`
7. Builds **promo_line_products** from `Promo_Product_Input.csv`

Uses `@supabase/supabase-js` for insertion with upsert to be idempotent.

---

### Phase 3: Next.js Integration

#### [NEW] `nextjs/lib/supabase.ts`
- Supabase client initialization using env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

#### [MODIFY] `nextjs/hooks/useFilteredData.ts`
- Replace static import of `comprehensiveData` with a Supabase query
- Use React Server Components or `useEffect` + `useState` for data fetching
- Keep the `useMemo` filtering on the client side after fetch

#### [MODIFY] `nextjs/components/Dashboard.tsx`
- Add loading state while data is fetched from Supabase
- Error state handling for network issues

#### [NEW] `nextjs/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Normalization Benefits

| Before (Flat JSON) | After (Normalized DB) |
|---|---|
| 35+ fields per record, highly redundant | 13 focused tables, no redundancy |
| Rep name duplicated in every record | Single `representatives` row, referenced by UUID |
| Product names repeated per record | `products` lookup table with therapeutic area |
| No referential integrity | Foreign keys + constraints |
| ~107KB static JS file loaded every page | On-demand queries — fetch only what's needed |
| Can't query "show all reps for Line 1" efficiently | SQL JOINs + indexes, sub-millisecond |
| Adding a new quarter = regenerate entire file | Insert new rows, existing data untouched |

## Open Questions

> [!IMPORTANT]
> 1. **Do you already have a Supabase project?** If not, I'll guide you through creating one (free tier is sufficient for this dataset).
> 2. **Country data**: Should I add Georgia (Country 87) as a separate country, or is all current data Kazakhstan-only?
> 3. **Historical quarters**: The data currently has Q1 2017 and Q2 2017. Will you be adding more quarters over time? This affects whether we should build an "upload new quarter" admin feature.
> 4. **Authentication**: Do you need user authentication (Supabase Auth), or is this an internal dashboard with open read access?

## Verification Plan

### Automated Tests
- Run seed script against a fresh Supabase instance
- Query `SELECT COUNT(*)` on all tables to verify row counts match CSV
- Run a JOIN query that reconstructs the original flat record and compare against `comprehensive_data.js`

### Manual Verification
- Open the Next.js dashboard and verify all filters work with live Supabase data
- Switch between Detailed and Summary views to confirm data matches the original
- Compare at least 5 representative records field-by-field against the Excel source
