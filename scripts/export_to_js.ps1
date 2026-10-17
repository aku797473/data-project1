$ErrorActionPreference = "Stop"
$csvPath = "c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\ev_market_data.csv"
$jsPath = "c:\Users\HP\OneDrive\Desktop\data anlytics proj\js\ev_data.js"

$rows = Import-Csv $csvPath
$jsonString = $rows | ConvertTo-Json -Depth 4 -Compress
$content = "/** Electric Vehicle (EV) Industry Dataset - 1,200 Clean Records **/" + "`n" + "window.EV_RAW_DATA = " + $jsonString + ";"

[System.IO.File]::WriteAllText($jsPath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated $jsPath with $($rows.Count) records."
