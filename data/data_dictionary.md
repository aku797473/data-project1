# Electric Vehicle (EV) Industry Dataset — Data Dictionary

| Column Name | Data Type | Units / Format | Description | Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `Vehicle_ID` | String | Unique Identifier (`EV-XXXX`) | Primary key for vehicle model instance | `EV-1001`, `EV-1005` |
| `Year` | Integer | YYYY (2021–2026) | Market tracking model year | `2021`, `2024`, `2026` |
| `Manufacturer` | String | Brand / OEM Name | Automotive vehicle manufacturer | `Tesla`, `BYD`, `Volkswagen`, `Tata Motors` |
| `Model_Name` | String | Vehicle Name | Commercial nameplate of the model | `Model Y`, `Seal`, `ID.4`, `Ioniq 5` |
| `Vehicle_Category` | String | Categorical | Vehicle class/segmentation | `SUV`, `Sedan`, `Hatchback`, `Truck`, `Bus`, `Two-Wheeler` |
| `Battery_Technology`| String | Categorical | Chemical composition of traction battery | `LFP`, `NMC`, `NCA`, `Sodium-Ion`, `Solid-State` |
| `Battery_Capacity_kWh` | Decimal | Kilowatt-hours (kWh) | Total usable battery pack energy capacity | `62.5`, `75.0`, `100.2`, `250.0` |
| `Driving_Range_km` | Integer | Kilometers (km) | Certified real-world WLTP driving range | `350`, `520`, `680` |
| `Base_Price_USD` | Integer | United States Dollar ($) | Base manufacturer suggested retail price (MSRP) | `$18,500`, `$44,000`, `$75,000` |
| `Units_Sold_Annual` | Integer | Unit Count | Estimated annual global sales volume | `12,450`, `45,200` |
| `Annual_Revenue_USD` | BigInt | USD ($) | Total annual revenue generated (`Units_Sold * Base_Price`) | `$1,250,400,000` |
| `Customer_Rating` | Decimal | 1.0 to 5.0 | Aggregated consumer satisfaction score | `4.2`, `4.65`, `4.8` |
| `Manufacturing_Country` | String | Country Name | Primary country of assembly/production | `China`, `USA`, `Germany`, `South Korea`, `India` |
| `Efficiency_Wh_per_km` | Integer | Watt-hours / km | Average energy consumption per kilometer | `145`, `180`, `280` |
| `Charging_Speed_kW` | Integer | Kilowatts (kW) | Peak direct-current (DC) fast-charging rate | `150`, `250`, `350` |
| `Fast_Charge_Time_min`| Integer | Minutes | 10% to 80% state of charge (SoC) time | `18`, `25`, `40` |
| `CO2_Offset_Tons_Annual`| Decimal | Metric Tons | Estimated annual CO2 emissions avoided vs ICE | `3.2`, `4.5`, `18.5` |
| `Safety_Rating_Stars` | Integer | 1 to 5 Stars | Independent crash safety rating (NCAP) | `4`, `5` |
| `Price_per_km_USD` | Decimal | USD / km | Price efficiency ratio (`Base_Price / Range`) | `50.82`, `86.57` |
| `Market_Segment` | String | Categorical | Target consumer demographic tier | `Mass Market`, `Premium`, `Luxury`, `Commercial`, `Budget` |
