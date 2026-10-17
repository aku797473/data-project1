# PowerShell script to generate realistic EV Industry Dataset (1,200 records)
$ErrorActionPreference = "Stop"

$seed = 2026
$random = [System.Random]::new($seed)

# Define models strictly mapped to their vehicle category
$modelsCatalog = @(
    # Tesla
    @{ Mfg="Tesla"; Country="USA"; Model="Model 3"; Cat="Sedan"; Techs=@("LFP", "NMC"); BasePrice=39000; Tier=1.8 },
    @{ Mfg="Tesla"; Country="USA"; Model="Model Y"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=44000; Tier=2.0 },
    @{ Mfg="Tesla"; Country="USA"; Model="Model S"; Cat="Sedan"; Techs=@("NCA", "Solid-State"); BasePrice=75000; Tier=1.2 },
    @{ Mfg="Tesla"; Country="USA"; Model="Model X"; Cat="SUV"; Techs=@("NCA", "NMC"); BasePrice=80000; Tier=1.1 },
    @{ Mfg="Tesla"; Country="USA"; Model="Cybertruck"; Cat="Truck"; Techs=@("NMC", "Solid-State"); BasePrice=61000; Tier=1.3 },
    @{ Mfg="Tesla"; Country="USA"; Model="Semi"; Cat="Truck"; Techs=@("LFP", "NMC"); BasePrice=150000; Tier=0.5 },
    
    # BYD
    @{ Mfg="BYD"; Country="China"; Model="Dolphin"; Cat="Hatchback"; Techs=@("LFP", "Sodium-Ion"); BasePrice=18000; Tier=2.1 },
    @{ Mfg="BYD"; Country="China"; Model="Atto 3"; Cat="SUV"; Techs=@("LFP", "Sodium-Ion"); BasePrice=28000; Tier=2.2 },
    @{ Mfg="BYD"; Country="China"; Model="Seal"; Cat="Sedan"; Techs=@("LFP", "NMC"); BasePrice=32000; Tier=1.9 },
    @{ Mfg="BYD"; Country="China"; Model="Han EV"; Cat="Sedan"; Techs=@("LFP", "NMC"); BasePrice=38000; Tier=1.6 },
    @{ Mfg="BYD"; Country="China"; Model="Tang EV"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=42000; Tier=1.4 },
    @{ Mfg="BYD"; Country="China"; Model="K9 Electric Bus"; Cat="Bus"; Techs=@("LFP"); BasePrice=280000; Tier=0.3 },

    # Volkswagen
    @{ Mfg="Volkswagen"; Country="Germany"; Model="ID.3"; Cat="Hatchback"; Techs=@("NMC", "LFP"); BasePrice=34000; Tier=1.4 },
    @{ Mfg="Volkswagen"; Country="Germany"; Model="ID.4"; Cat="SUV"; Techs=@("NMC", "LFP"); BasePrice=41000; Tier=1.7 },
    @{ Mfg="Volkswagen"; Country="Germany"; Model="ID.5"; Cat="SUV"; Techs=@("NMC"); BasePrice=46000; Tier=1.2 },
    @{ Mfg="Volkswagen"; Country="Germany"; Model="ID.7"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=53000; Tier=1.1 },
    @{ Mfg="Volkswagen"; Country="Germany"; Model="ID.Buzz"; Cat="Truck"; Techs=@("NMC"); BasePrice=60000; Tier=0.9 },

    # Hyundai-Kia
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="Ioniq 5"; Cat="SUV"; Techs=@("NMC", "LFP"); BasePrice=41500; Tier=1.7 },
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="Ioniq 6"; Cat="Sedan"; Techs=@("NMC"); BasePrice=42500; Tier=1.4 },
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="EV6"; Cat="SUV"; Techs=@("NMC"); BasePrice=42600; Tier=1.5 },
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="EV9"; Cat="SUV"; Techs=@("NMC", "Solid-State"); BasePrice=56000; Tier=1.0 },
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="Kona Electric"; Cat="Hatchback"; Techs=@("NMC", "LFP"); BasePrice=33000; Tier=1.3 },
    @{ Mfg="Hyundai-Kia"; Country="South Korea"; Model="Elec City Bus"; Cat="Bus"; Techs=@("LFP", "NMC"); BasePrice=295000; Tier=0.25 },

    # BMW Group
    @{ Mfg="BMW Group"; Country="Germany"; Model="i4 Gran Coupe"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=57000; Tier=1.2 },
    @{ Mfg="BMW Group"; Country="Germany"; Model="iX3"; Cat="SUV"; Techs=@("NMC"); BasePrice=55000; Tier=1.1 },
    @{ Mfg="BMW Group"; Country="Germany"; Model="iX M60"; Cat="SUV"; Techs=@("NMC", "Solid-State"); BasePrice=87000; Tier=0.8 },
    @{ Mfg="BMW Group"; Country="Germany"; Model="i7 xDrive60"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=105000; Tier=0.6 },
    @{ Mfg="BMW Group"; Country="Germany"; Model="CE 04 Scooter"; Cat="Two-Wheeler"; Techs=@("NMC", "LFP"); BasePrice=12000; Tier=0.9 },

    # Rivian
    @{ Mfg="Rivian"; Country="USA"; Model="R1T Pickup"; Cat="Truck"; Techs=@("NMC", "LFP"); BasePrice=71000; Tier=0.8 },
    @{ Mfg="Rivian"; Country="USA"; Model="R1S Adventure"; Cat="SUV"; Techs=@("NMC", "LFP"); BasePrice=76000; Tier=0.9 },
    @{ Mfg="Rivian"; Country="USA"; Model="EDV Delivery Van"; Cat="Truck"; Techs=@("LFP"); BasePrice=83000; Tier=0.7 },

    # NIO
    @{ Mfg="NIO"; Country="China"; Model="ET5"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=46000; Tier=1.0 },
    @{ Mfg="NIO"; Country="China"; Model="ES6"; Cat="SUV"; Techs=@("NMC", "Solid-State"); BasePrice=52000; Tier=1.1 },
    @{ Mfg="NIO"; Country="China"; Model="ET7"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=69000; Tier=0.7 },
    @{ Mfg="NIO"; Country="China"; Model="ES8"; Cat="SUV"; Techs=@("NMC", "Solid-State"); BasePrice=72000; Tier=0.6 },

    # Volvo
    @{ Mfg="Volvo"; Country="Sweden"; Model="EX30"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=35000; Tier=1.4 },
    @{ Mfg="Volvo"; Country="Sweden"; Model="XC40 Recharge"; Cat="SUV"; Techs=@("NMC"); BasePrice=54000; Tier=1.0 },
    @{ Mfg="Volvo"; Country="Sweden"; Model="EX90"; Cat="SUV"; Techs=@("NMC", "Solid-State"); BasePrice=77000; Tier=0.7 },
    @{ Mfg="Volvo"; Country="Sweden"; Model="FH Electric"; Cat="Truck"; Techs=@("NMC", "LFP"); BasePrice=220000; Tier=0.3 },

    # Mercedes-Benz
    @{ Mfg="Mercedes-Benz"; Country="Germany"; Model="EQA"; Cat="SUV"; Techs=@("NMC"); BasePrice=52000; Tier=0.9 },
    @{ Mfg="Mercedes-Benz"; Country="Germany"; Model="EQE Sedan"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=74000; Tier=0.8 },
    @{ Mfg="Mercedes-Benz"; Country="Germany"; Model="EQS Sedan"; Cat="Sedan"; Techs=@("NMC", "Solid-State"); BasePrice=104000; Tier=0.6 },
    @{ Mfg="Mercedes-Benz"; Country="Germany"; Model="EQS SUV"; Cat="SUV"; Techs=@("NMC"); BasePrice=107000; Tier=0.6 },
    @{ Mfg="Mercedes-Benz"; Country="Germany"; Model="eCitaro Bus"; Cat="Bus"; Techs=@("Solid-State", "NMC"); BasePrice=340000; Tier=0.2 },

    # Ford
    @{ Mfg="Ford"; Country="USA"; Model="Mustang Mach-E"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=43000; Tier=1.4 },
    @{ Mfg="Ford"; Country="USA"; Model="F-150 Lightning"; Cat="Truck"; Techs=@("NMC", "LFP"); BasePrice=55000; Tier=1.2 },
    @{ Mfg="Ford"; Country="USA"; Model="E-Transit"; Cat="Truck"; Techs=@("LFP", "NMC"); BasePrice=51000; Tier=0.8 },

    # Tata Motors
    @{ Mfg="Tata Motors"; Country="India"; Model="Tiago EV"; Cat="Hatchback"; Techs=@("LFP"); BasePrice=11500; Tier=1.8 },
    @{ Mfg="Tata Motors"; Country="India"; Model="Punch EV"; Cat="SUV"; Techs=@("LFP"); BasePrice=14000; Tier=1.9 },
    @{ Mfg="Tata Motors"; Country="India"; Model="Nexon EV"; Cat="SUV"; Techs=@("LFP"); BasePrice=18500; Tier=2.0 },
    @{ Mfg="Tata Motors"; Country="India"; Model="Curvv EV"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=22000; Tier=1.5 },
    @{ Mfg="Tata Motors"; Country="India"; Model="Starbus EV"; Cat="Bus"; Techs=@("LFP"); BasePrice=160000; Tier=0.4 },

    # MG Motor
    @{ Mfg="MG Motor"; Country="UK"; Model="MG4 EV"; Cat="Hatchback"; Techs=@("LFP", "NMC"); BasePrice=27000; Tier=1.6 },
    @{ Mfg="MG Motor"; Country="UK"; Model="ZS EV"; Cat="SUV"; Techs=@("LFP", "NMC"); BasePrice=32000; Tier=1.3 },
    @{ Mfg="MG Motor"; Country="UK"; Model="Cyberster"; Cat="Sedan"; Techs=@("NMC"); BasePrice=58000; Tier=0.6 },

    # Zero / Ola (Two-Wheelers)
    @{ Mfg="Ola Electric"; Country="India"; Model="S1 Pro Gen 2"; Cat="Two-Wheeler"; Techs=@("NMC", "Sodium-Ion"); BasePrice=1700; Tier=2.2 },
    @{ Mfg="Zero Motorcycles"; Country="USA"; Model="Zero DSR/X"; Cat="Two-Wheeler"; Techs=@("NMC"); BasePrice=19995; Tier=0.7 }
)

$years = @(2021, 2022, 2023, 2024, 2025, 2026)
$records = [System.Collections.Generic.List[PSObject]]::new()
$idCounter = 1000

for ($i = 0; $i -lt 1200; $i++) {
    $idCounter++
    $m = $modelsCatalog[$random.Next(0, $modelsCatalog.Count)]
    $year = $years[$random.Next(0, $years.Count)]

    # Pick valid battery tech
    $availableTechs = [string[]]$m.Techs
    # Solid-State / Sodium-Ion only viable in 2024+
    if ($year -lt 2024) {
        $filtered = @($availableTechs | Where-Object { $_ -ne "Solid-State" -and $_ -ne "Sodium-Ion" })
        if ($filtered.Count -gt 0) {
            $availableTechs = $filtered
        } else {
            $availableTechs = @("NMC")
        }
    }
    $batteryTech = $availableTechs[$random.Next(0, $availableTechs.Length)]

    $cat = $m.Cat
    $mfg = $m.Mfg
    $country = $m.Country
    $modelName = $m.Model

    # Calculate realistic specs
    switch ($cat) {
        "Two-Wheeler" {
            $cap = [Math]::Round($random.NextDouble() * 12 + 3.5, 1) # 3.5 to 15.5 kWh
            $range = [Math]::Round($cap * ($random.Next(16, 26)), 0)
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-300, 800)), 0)
            $efficiency = [Math]::Round($random.Next(35, 60), 0)
            $chargeSpeed = [Math]::Round($random.NextDouble() * 4 + 2.5, 1)
            $chargeTime = $random.Next(40, 110)
            $co2Offset = [Math]::Round($random.NextDouble() * 0.9 + 0.6, 2)
            $segment = "Budget"
        }
        "Hatchback" {
            $cap = [Math]::Round($random.NextDouble() * 25 + 35, 1) # 35 - 60 kWh
            $range = [Math]::Round($cap * ($random.Next(6, 8)), 0) # 210 - 480 km
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-2500, 3500)), 0)
            $efficiency = [Math]::Round($random.Next(135, 165), 0)
            $chargeSpeed = $random.Next(50, 135)
            $chargeTime = $random.Next(28, 45)
            $co2Offset = [Math]::Round($random.NextDouble() * 1.2 + 2.2, 2)
            $segment = if ($basePrice -lt 25000) { "Mass Market" } else { "Premium" }
        }
        "Sedan" {
            $cap = [Math]::Round($random.NextDouble() * 40 + 58, 1) # 58 - 98 kWh
            $range = [Math]::Round($cap * ($random.Next(5.5, 7.8)), 0) # 320 - 720 km
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-4000, 6000)), 0)
            $efficiency = [Math]::Round($random.Next(142, 178), 0)
            $chargeSpeed = $random.Next(130, 260)
            $chargeTime = $random.Next(18, 35)
            $co2Offset = [Math]::Round($random.NextDouble() * 1.6 + 2.8, 2)
            $segment = if ($basePrice -gt 60000) { "Luxury" } elseif ($basePrice -gt 35000) { "Premium" } else { "Mass Market" }
        }
        "SUV" {
            $cap = [Math]::Round($random.NextDouble() * 45 + 62, 1) # 62 - 107 kWh
            $range = [Math]::Round($cap * ($random.Next(4.8, 6.6)), 0) # 300 - 680 km
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-3500, 7500)), 0)
            $efficiency = [Math]::Round($random.Next(168, 218), 0)
            $chargeSpeed = $random.Next(130, 275)
            $chargeTime = $random.Next(22, 38)
            $co2Offset = [Math]::Round($random.NextDouble() * 2.2 + 3.2, 2)
            $segment = if ($basePrice -gt 65000) { "Luxury" } elseif ($basePrice -gt 28000) { "Premium" } else { "Mass Market" }
        }
        "Truck" {
            $cap = [Math]::Round($random.NextDouble() * 110 + 110, 1) # 110 - 220 kWh
            $range = [Math]::Round($cap * ($random.Next(3.2, 4.6)), 0) # 360 - 690 km
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-5000, 12000)), 0)
            $efficiency = [Math]::Round($random.Next(260, 370), 0)
            $chargeSpeed = $random.Next(200, 360)
            $chargeTime = $random.Next(30, 48)
            $co2Offset = [Math]::Round($random.NextDouble() * 3.5 + 5.5, 2)
            $segment = "Commercial"
        }
        "Bus" {
            $cap = [Math]::Round($random.NextDouble() * 160 + 220, 1) # 220 - 380 kWh
            $range = [Math]::Round($cap * ($random.Next(1.2, 1.8)), 0) # 260 - 500 km
            $basePrice = [Math]::Round($m.BasePrice + ($random.Next(-15000, 25000)), 0)
            $efficiency = [Math]::Round($random.Next(680, 960), 0)
            $chargeSpeed = $random.Next(180, 350)
            $chargeTime = $random.Next(50, 95)
            $co2Offset = [Math]::Round($random.NextDouble() * 8.0 + 18.0, 2)
            $segment = "Commercial"
        }
    }

    # Battery tech modifier adjustments
    if ($batteryTech -eq "Solid-State") {
        $range = [Math]::Round($range * 1.28, 0)
        $chargeTime = [Math]::Max(12, [Math]::Round($chargeTime * 0.55, 0))
        $chargeSpeed = [Math]::Round($chargeSpeed * 1.4, 0)
        $efficiency = [Math]::Round($efficiency * 0.9, 0)
        $basePrice = [Math]::Round($basePrice * 1.12, 0)
    } elseif ($batteryTech -eq "Sodium-Ion") {
        $range = [Math]::Round($range * 0.82, 0)
        $basePrice = [Math]::Round($basePrice * 0.80, 0)
    } elseif ($batteryTech -eq "LFP") {
        $basePrice = [Math]::Round($basePrice * 0.93, 0)
    }

    # Sales volume calculation based on market tier, year-over-year EV growth rate (~24% CAGR)
    $cagr = [Math]::Pow(1.25, ($year - 2021))
    $volNoise = $random.NextDouble() * 0.4 + 0.8
    $catVol = switch ($cat) {
        "SUV" { 16000 }
        "Sedan" { 11000 }
        "Hatchback" { 13500 }
        "Two-Wheeler" { 24000 }
        "Truck" { 4800 }
        "Bus" { 1200 }
    }
    
    $unitsSold = [Math]::Max(350, [Math]::Round($catVol * $m.Tier * $cagr * $volNoise, 0))
    $annualRevenue = [int64]$unitsSold * [int64]$basePrice

    # Customer Rating (3.5 - 4.9)
    $ratingBase = 4.15 + ($random.NextDouble() * 0.6 - 0.25)
    if ($mfg -in @("Tesla", "BMW Group", "BYD", "Volvo")) { $ratingBase += 0.18 }
    if ($batteryTech -eq "Solid-State") { $ratingBase += 0.22 }
    $customerRating = [Math]::Min(5.0, [Math]::Max(3.4, [Math]::Round($ratingBase, 2)))
    $safetyStars = if ($customerRating -ge 4.25 -and $cat -ne "Two-Wheeler") { 5 } else { 4 }

    $pricePerKm = [Math]::Round($basePrice / [Math]::Max(1, $range), 2)

    $records.Add([PSCustomObject]@{
        Vehicle_ID             = "EV-$idCounter"
        Year                   = $year
        Manufacturer           = $mfg
        Model_Name             = $modelName
        Vehicle_Category       = $cat
        Battery_Technology     = $batteryTech
        Battery_Capacity_kWh   = $cap
        Driving_Range_km       = $range
        Base_Price_USD         = $basePrice
        Units_Sold_Annual      = $unitsSold
        Annual_Revenue_USD     = $annualRevenue
        Customer_Rating        = $customerRating
        Manufacturing_Country  = $country
        Efficiency_Wh_per_km   = $efficiency
        Charging_Speed_kW      = $chargeSpeed
        Fast_Charge_Time_min   = $chargeTime
        CO2_Offset_Tons_Annual = $co2Offset
        Safety_Rating_Stars    = $safetyStars
        Price_per_km_USD       = $pricePerKm
        Market_Segment         = $segment
    })
}

$rawCsvPath = "c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\ev_market_data.csv"
$cleanCsvPath = "c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\ev_market_data_cleaned.csv"

$records | Export-Csv -Path $rawCsvPath -NoTypeInformation -Encoding UTF8
$records | Export-Csv -Path $cleanCsvPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $($records.Count) clean records in $rawCsvPath"

# Summary metrics
$totalUnitsSold = ($records | Measure-Object -Property Units_Sold_Annual -Sum).Sum
$totalRevenue = ($records | Measure-Object -Property Annual_Revenue_USD -Sum).Sum
$avgRange = [Math]::Round(($records | Measure-Object -Property Driving_Range_km -Average).Average, 1)
$avgRating = [Math]::Round(($records | Measure-Object -Property Customer_Rating -Average).Average, 2)
$avgPrice = [Math]::Round(($records | Measure-Object -Property Base_Price_USD -Average).Average, 0)
$totalCO2Offset = [Math]::Round(($records | Measure-Object -Property CO2_Offset_Tons_Annual -Sum).Sum, 1)

$summary = @{
    Total_Records           = $records.Count
    Total_Units_Sold        = $totalUnitsSold
    Total_Revenue_USD       = $totalRevenue
    Average_Range_km        = $avgRange
    Average_Customer_Rating = $avgRating
    Average_Base_Price_USD  = $avgPrice
    Total_CO2_Offset_Tons   = $totalCO2Offset
    Years_Covered           = @(2021..2026)
    Manufacturers           = @($records | Select-Object -ExpandProperty Manufacturer -Unique | Sort-Object)
    Categories              = @($records | Select-Object -ExpandProperty Vehicle_Category -Unique | Sort-Object)
    Battery_Technologies    = @($records | Select-Object -ExpandProperty Battery_Technology -Unique | Sort-Object)
    Countries               = @($records | Select-Object -ExpandProperty Manufacturing_Country -Unique | Sort-Object)
}

$jsonPath = "c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\summary_metrics.json"
$summary | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Updated summary JSON in $jsonPath"
