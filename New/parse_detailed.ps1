$ErrorActionPreference = "Stop"
$inputAssumptions = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\csv_exports\INPUT_ASSUMPTIONS_CALC.csv"
$summaryCalc = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\csv_exports\Summary_calculation.csv"
$tcfaFile = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\csv_exports\TCFA.csv"
$outputPath = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\comprehensive_data.js"

# -- PARSE TCFA --
$linesTCFA = Get-Content $tcfaFile
$dataTCFA = @()
foreach ($line in $linesTCFA) {
    if ($line -match '(\d+),([^,]+),"[^"]+",(\d+%?),(\d+%?)') {
        $dataTCFA += @{
            Name = $matches[2].Trim()
            Q1 = $matches[3]
        }
    } else {
        $parts = $line -split ','
        if ($parts.Count -ge 11 -and $parts[7] -match '[A-Za-z]') {
            $dataTCFA += @{
                Name = $parts[7].Trim()
                Q1 = $parts[9]
            }
        }
    }
}

# --- PARSE INPUT ASSUMPTIONS ---
$linesInput = Get-Content $inputAssumptions
# Headers are at index 0. Because there are duplicate columns (like % ACHIEVEMENT), 
# ConvertFrom-Csv will fail in PS 5.1 without unique headers. 
# Let's generate a unique header list properly without naive splitting.
# We will use Regex to split safely by comma outside quotes:
$headerLine = $linesInput[0]
$pattern = '(?<=^|,)(?:"((?:[^"]|"")*)"|([^,]*))'
$matches = [regex]::Matches($headerLine, $pattern)
$headers = @()
$counter = 1
foreach ($match in $matches) {
    $val = if ($match.Groups[1].Success) { $match.Groups[1].Value } else { $match.Groups[2].Value }
    if ([string]::IsNullOrWhiteSpace($val)) {
        $val = "H_$counter"
    }
    # Make sure header is unique
    while ($headers -contains $val) {
        $val = $val + "_" + $counter
    }
    $headers += $val
    $counter++
}

# Now we can import the CSV using the custom headers, skipping the original header line
$dataInput = $linesInput[1..($linesInput.Count - 1)] | ConvertFrom-Csv -Header $headers

# --- PARSE SUMMARY CALCULATION ---
$linesSummary = Get-Content $summaryCalc
$headerIndexSummary = -1
for ($i = 0; $i -lt $linesSummary.Count; $i++) {
    if ($linesSummary[$i] -match "\?,Name,") {
        $headerIndexSummary = $i
        break
    }
}

# Apply strict safely split headers for Summary Calc as well
$headerLineSummary = $linesSummary[$headerIndexSummary]
$matchesSummary = [regex]::Matches($headerLineSummary, $pattern)
$headersSummary = @()
$counterSum = 1
foreach ($match in $matchesSummary) {
    $val = if ($match.Groups[1].Success) { $match.Groups[1].Value } else { $match.Groups[2].Value }
    if ([string]::IsNullOrWhiteSpace($val)) {
        $val = "H_$counterSum"
    }
    while ($headersSummary -contains $val) {
        $val = $val + "_" + $counterSum
    }
    $headersSummary += $val
    $counterSum++
}

$dataSummary = $linesSummary[($headerIndexSummary + 1)..($linesSummary.Count - 1)] | ConvertFrom-Csv -Header $headersSummary


$resultList = @()

foreach ($row in $dataInput) {
    $rawName = $row.Name
    if ([string]::IsNullOrWhiteSpace($rawName)) { continue }
    if ($rawName -match "Name") { continue }
    
    $cleanName = $rawName.Trim()
    
    # Locate summary row (trim names to match reliably)
    $summaryRow = $dataSummary | Where-Object { $_.Name -and $_.Name.Trim() -eq $cleanName } | Select-Object -First 1
    $tcfaRow = $dataTCFA | Where-Object { $_.Name -and $_.Name -eq $cleanName } | Select-Object -First 1

    $item = @{
        Quarter = "Q1 2017" # Since we know it's Q1 dataset
        Name = $cleanName
        Position = $row.Position
        PromoLine = $row."Promo-line"
        
        P1Name = $row."Portfolio-1/ Product-1"
        P1Act = $row."ACT Portfolio-1/ Product-1"
        P1Plan = $row."PLAN  Portfolio-1/ Product-1"
        
        P2Name = $row."Portfolio-2/ Product-1"
        P2Act = $row."ACT Portfolio-2/ Product-1"
        P2Plan = $row."PLAN  Portfolio-2/ Product-1"

        P3Name = $row."Portfolio-3/ Product-1"
        P3Act = $row."ACT Portfolio-3/ Product-1"
        P3Plan = $row."PLAN  Portfolio-3/ Product-1"

        TotalAct = $row."Total ACT"
        TotalPlan = $row."Total PLAN"
        
        TCFA_Act = if ($tcfaRow) { $tcfaRow.Q1 } else { "0%" }
        
        Id_Sum = if ($summaryRow) { $summaryRow."?" } else { "" }
        Team_Sum = if ($summaryRow) { $summaryRow."H_3" } else { "" }
        Position_Sum = if ($summaryRow) { $summaryRow.Position } else { "" }
        TargetForQuarter_Sum = if ($summaryRow) { $summaryRow."Total Target Incentive for Quarter, LC" } else { "0" }
        ReimbursableMonths_Sum = if ($summaryRow) { $summaryRow."Reimbursable months, %" } else { "100%" }
        TargetBase_Sum = if ($summaryRow) { $summaryRow."Target Incentive Base, LC" } else { "0" }
        TargetSalesResult_Sum = if ($summaryRow) { $summaryRow."Target Incentive for Sales Result, LC" } else { "0" }
        Product1_Sum = if ($summaryRow) { $summaryRow.Product1 } else { "0" }
        Product2_Sum = if ($summaryRow) { $summaryRow.Product2 } else { "0" }
        Product3_Sum = if ($summaryRow) { $summaryRow.Product3 } else { "0" }
        Product4_Sum = if ($summaryRow) { $summaryRow.Product4 } else { "0" }
        IncSalesResult_Sum = if ($summaryRow) { $summaryRow."Incentive Amount for Sales Result, LC" } else { "0" }
        TargetTCFA_Sum = if ($summaryRow) { $summaryRow."Target Incentive for TCFA, LC" } else { "0" }
        TargetCoaching_Sum = if ($summaryRow) { $summaryRow."Target Incentive for Time in Coaching (RM) , LC" } else { "0" }
        IncTCFA_Sum = if ($summaryRow) { $summaryRow."Incentive Amount for TCFA, LC" } else { "0" }
        IncCoaching_Sum = if ($summaryRow) { $summaryRow."Incentive Amount for Time in Coaching, LC" } else { "0" }
        FieldWork_Sum = if ($summaryRow) { $summaryRow."Incentive Amount for Field Work Achievements, LC" } else { "0" }
        TotalIncentive_Sum = if ($summaryRow) { $summaryRow."Total Incentive Amount, LC" } else { "0" }
    }
    
    $resultList += $item
}

$json = $resultList | ConvertTo-Json -Depth 5
Set-Content -Path $outputPath -Value "const comprehensiveData = $json;"
Write-Host "Created robust extended comprehensive_data.js with correctly parsed quoted headers."
