$ErrorActionPreference = "Stop"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$filePath = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\EPD New Incentive File .xlsx"
$outputDir = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\csv_exports"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir
}

try {
    $workbook = $excel.Workbooks.Open($filePath, 0, $true)
    foreach ($worksheet in $workbook.Worksheets) {
        $sheetName = $worksheet.Name
        Write-Host "Exporting $($sheetName)..."
        $csvPath = Join-Path $outputDir "$($sheetName -replace '[^a-zA-Z0-9_\-]', '_').csv"
        $worksheet.SaveAs($csvPath, 6) # 6 is xlCSV
    }
} catch {
    Write-Host "Error: $_"
} finally {
    if ($workbook) { $workbook.Close($false) }
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
