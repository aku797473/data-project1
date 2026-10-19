$csv = Import-Csv 'data/ev_market_data.csv'
$mfg = $csv.Manufacturer | Select-Object -Unique | Sort-Object
$countries = $csv.Manufacturing_Country | Select-Object -Unique | Sort-Object
$categories = $csv.Vehicle_Category | Select-Object -Unique | Sort-Object
$tech = $csv.Battery_Technology | Select-Object -Unique | Sort-Object
$years = $csv.Year | Select-Object -Unique | Sort-Object

Write-Host "Total Rows: $($csv.Count)"
Write-Host "Manufacturers: $($mfg -join ', ')"
Write-Host "Countries: $($countries -join ', ')"
Write-Host "Categories: $($categories -join ', ')"
Write-Host "Batteries: $($tech -join ', ')"
Write-Host "Years: $($years -join ', ')"
