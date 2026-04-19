# EPD Incentive Data Analysis Report

## Overview
This report provides a preliminary data analysis on the provided Excel workbook for EPD Incentive Calculations. The goal is to build an understanding of the structure, logic, and output values that form the basis of the incentive payout to Medical Representatives.

## Data Structure Analysis

The data relies on several interlinked sheets, calculating the overall quarterly incentive:

### 1. **Staff Input**
- Contains core representative information.
- Key fields: `Name`, `Position`, `Starting date`, and indicators for working status per Quarter (e.g., Q1 to Q4).
- Observations: Used to determine whether a representative is active ("Worked" status) or on leave, which feeds into the Reimbursable Months % (usually 3 months in a Quarter, meaning 100% reimbursement).

### 2. **Promo Product Input**
- Contains portfolio mapping per `Promo-line` (e.g., Line 1, Line 2, Pharma line).
- Key fields: Defines up to 4 Portfolios and outlines the products assigned to each portfolio (e.g., CREON, DUPHALAC).
- Defines the target "Share" percentage for each portfolio, indicating the weight of that portfolio in the overall incentive evaluation.

### 3. **Input Assumptions Calc**
- The main unified dataset bringing together Staff and Product expectations against Realized Sales.
- Compares `ACT` (Actual Sales) vs `PLAN` (Planned/Targeted Sales) for all mapped products and portfolios.
- Contains calculating columns for `TCFA` (Target Call Frequency Achievement) and `% ACHIEVEMENT`, which is key to generating the specific incentive payouts mathematically via Payment Coefficients.

### 4. **Summary Calculation (and SOURCE)**
- This is the core final output layer where business logic materializes into final localized values (LC - Local Currency).
- Summarizes the incentive split:
  - **Target Incentive Base (LC)**: The theoretical full amount a representative can earn.
  - **Sales Result Incentive**: Dependent on the sales of the 4 defined products/portfolios, mapped linearly based on performance multipliers from the Assumptions Calc.
  - **TCFA Incentive**: Additional amounts based strictly on Call Frequency performance.
  - **Time in Coaching/Field Achievements**: Optional columns padding out full potential performance compensation.

## Web Application Data MVP Implementation
To demonstrate how this data can be transformed into a functional web application without immediate access to a full database, I wrote a PowerShell automation script (`parse_data.ps1`) to parse the final calculation layer (`Summary calculation.csv`) outputting directly to `data.js`. 

The current **Application Dashboard** serves as the MVP built entirely with `HTML`, `CSS` (Vanilla CSS with highly premium glassmorphism logic), and `JS`. 
- **Rep Search**: Easily find reps by name via the drop-down.
- **Dynamic KPIs**: Updates the Total Incentive Amount, Target Base, Sales Result Incentive, and TCFA explicitly for the selected Medical Representative.
- **Breakdown Charts**: Visually represents how each product contributed to the total performance targets dynamically.

## Open Questions & Future Development Roadmap

As we prepare to migrate this structure entirely to a formal application backed by a SQL/NoSQL Database, I have a few questions/considerations for you:

1. **Exchange Rates / Multiple Quarters**: In the `Summary Calculation` sheet, there are scattered inputs for Exchange Rate LC/USD (e.g., 314.79 for Q1, 332.70 for Q2). Should the Dashboard have a hard toggle that updates historical Quarter data based on the historical conversion rate, or will all historical data be imported and locked in LC directly?
2. **Missing Columns Handling**: When processing the `.csv`, some structure fields in row #8 were un-named or structurally staggered for spacing in Excel. When we move to a Database (e.g., PostgreSQL), we will enforce strict column typing. Will the target upload process be a direct web-upload of this precise layout, or can we design a standard import template?
3. **Product Variables**: Since portfolios have variable products depending on the `Promo-line`, should the UI dynamically name "Product 1" or is keeping these distinct mapped to generic targets acceptable given large amounts of variations?
4. **Linking External Sources**: You mentioned `[BC_KZ_2017_V10_FINAL.XLSM]`. Are there active formulas pointing dynamically to this external document? For the final application setup, we will need to ingest whatever data sits inside `BC_KZ_2017_V10_FINAL` into the DB. 

*Let me know if you are satisfied with this initial Data UI exploration and we can move to integrating server-side routing!*
