$html = Get-Content "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\index.html" -Raw
$css = Get-Content "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\styles.css" -Raw
$dataJs = Get-Content "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\comprehensive_data.js" -Raw
$appJs = Get-Content "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\app.js" -Raw

# Replace the style link with inline CSS
$html = $html -replace '<link rel="stylesheet" href="styles.css">', "<style>`n$css`n</style>"

# Replace the script tags with inline JS
$scriptDataToInject = "<script>`n$dataJs`n</script>"
$scriptAppToInject = "<script>`n$appJs`n</script>"

$html = $html -replace '<script src="comprehensive_data.js"></script>', $scriptDataToInject
$html = $html -replace '<script src="app.js"></script>', $scriptAppToInject

$outputPath = "c:\Users\ArslanSohail\Desktop\EPD Incentivwe\New\Final_Incentive_Report.html"
Set-Content -Path $outputPath -Value $html -Encoding UTF8

Write-Host "Created single file: $outputPath"
