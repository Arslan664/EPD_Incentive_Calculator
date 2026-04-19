$ErrorActionPreference = "Stop"
$csvPath = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\csv_exports\Summary_calculation.csv"
$outputPath = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\data.js"

# Read all lines
$lines = Get-Content $csvPath
# Find the header row (starts with ,?,Name,,Position or similar)
$headerIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "\?,Name,") {
        $headerIndex = $i
        break
    }
}

if ($headerIndex -eq -1) {
    Write-Host "Header not found!"
    exit 1
}

# The header is slightly messy due to empty columns, but ConvertFrom-Csv can handle it if we fix it or just take the raw lines
$csvData = $lines[$headerIndex..($lines.Count - 1)] | ConvertFrom-Csv

$result = @()
foreach ($row in $csvData) {
    if ([string]::IsNullOrWhiteSpace($row.Name)) { continue }
    
    # Check if the row starts with like 1Q2 or just ?, let's map properties cleanly
    $item = @{
        Id = $row."?"
        Quarter = if ($row." " -match "Q") { $row." " } else { "Q1" } # Hacky way to get Quarter, maybe derived from first col or assumed
        Name = $row.Name
        PromoLine = $row.Column4 # it's under an empty header between Name and Position in earlier rows, but let's just grab the whole array
        Position = $row.Position
        TargetIncentiveForQuarter = $row."Total Target Incentive for Quarter, LC"
        ReimbursableMonths = $row."Reimbursable months, %"
        TargetIncentiveBase = $row."Target Incentive Base, LC"
        TargetIncentiveSalesResult = $row."Target Incentive for Sales Result, LC"
        Product1Incentive = $row.Product1
        Product2Incentive = $row.Product2
        Product3Incentive = $row.Product3
        Product4Incentive = $row.Product4
        IncentiveAmountSalesResult = $row."Incentive Amount for Sales Result, LC"
        TargetIncentiveTCFA = $row."Target Incentive for TCFA, LC"
        IncentiveAmountTCFA = $row."Incentive Amount for TCFA, LC"
        TargetIncentiveCoaching = $row."Target Incentive for Time in Coaching (RM) , LC"
        IncentiveAmountCoaching = $row."Incentive Amount for Time in Coaching, LC"
        TotalIncentiveAmount = $row."Total Incentive Amount, LC"
    }
    
    # Try to extract the Quarter from the first empty column which contains "1Q2" or something
    if ($row.P1 -match "Q(\d)") { $item.Quarter = "Q" + $matches[1] }
    # looking at the first column: $row[0] was empty in header, resulting in some default name. 
    # Let's inspect the keys
    
    $result += $item
}

$json = $result | ConvertTo-Json -Depth 5
Set-Content -Path $outputPath -Value "const incentiveData = $json;"
Write-Host "Created data.js"
