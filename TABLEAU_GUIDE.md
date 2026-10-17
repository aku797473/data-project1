# 📊 Tableau Desktop & Tableau Public Implementation Guide

This guide walks you through building and publishing the **Electric Vehicle (EV) Industry Analytics Dashboard** in **Tableau Desktop** or **Tableau Public** using the dataset generated in this project.

---

## 📁 1. Data Connection
1. Launch **Tableau Desktop** or **Tableau Public**.
2. Under **Connect** (left panel), click **Text file**.
3. Browse and select:
   ```
   c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\ev_market_data.csv
   ```
4. Verify the Data Source preview. All 20 fields will automatically detect their correct data types:
   * **Strings:** `Vehicle_ID`, `Manufacturer`, `Model_Name`, `Vehicle_Category`, `Battery_Technology`, `Manufacturing_Country`, `Market_Segment`
   * **Numbers (Whole):** `Year`, `Driving_Range_km`, `Base_Price_USD`, `Units_Sold_Annual`, `Efficiency_Wh_per_km`, `Charging_Speed_kW`, `Fast_Charge_Time_min`, `Safety_Rating_Stars`
   * **Numbers (Decimal):** `Battery_Capacity_kWh`, `Annual_Revenue_USD`, `Customer_Rating`, `CO2_Offset_Tons_Annual`, `Price_per_km_USD`

---

## 📐 2. Calculated Fields to Create in Tableau

In Tableau, right-click any blank space in the **Data Pane** on the left and select **Create Calculated Field**:

### Calculation 1: `[Revenue in Billions]`
```tableau
SUM([Annual Revenue USD]) / 1000000000
```
*(Format as Currency (Custom): Prefix `$`, Suffix `B`, 2 decimal places).*

### Calculation 2: `[Market Share %]`
```tableau
SUM([Units Sold Annual]) / TOTAL(SUM([Units Sold Annual]))
```
*(Format as Percentage with 1 decimal place).*

### Calculation 3: `[Price per km Ratio]`
```tableau
AVG([Base Price USD] / [Driving Range km])
```
*(Format as Currency with `$`, Suffix `/km`).*

### Calculation 4: `[Range Category]`
```tableau
IF [Driving Range km] >= 600 THEN 'Ultra Long Range (600+ km)'
ELSEIF [Driving Range km] >= 400 THEN 'Standard Long Range (400-599 km)'
ELSE 'Urban Range (<400 km)'
END
```

### Calculation 5: `[Fast Charge Efficiency]`
```tableau
AVG([Driving Range km] / [Fast Charge Time min])
```
*(Represents kilometers of range gained per minute of charging).*

---

## 🎨 3. Step-by-Step Worksheet Construction

### Sheet 1: Vehicle Category Sales & Revenue (Dual-Axis)
* **Columns:** `[Vehicle Category]`
* **Rows:** `SUM([Units Sold Annual])` and `[Revenue in Billions]`
* **Marks Card:** Right-click second measure ➔ select **Dual Axis** ➔ right-click axis ➔ select **Synchronize Axis**.
* **Visual Type:** Bar chart for Units Sold, Line chart for Revenue.
* **Colors:** Teal (`#00f0ff`) for Units, Emerald (`#10b981`) for Revenue.

### Sheet 2: Manufacturer Market Share (Doughnut / Tree Map)
* **Columns / Rows:** Leave blank (for Tree Map: drag `[Manufacturer]` to Label, `SUM([Units Sold Annual])` to Size and Color).
* **Tooltip:** Include `[Market Share %]` and `SUM([Units Sold Annual])`.

### Sheet 3: Battery Chemistry Evolution (2021–2026)
* **Columns:** `[Year]` (Continuous or Discrete)
* **Rows:** `SUM([Units Sold Annual])`
* **Color:** `[Battery Technology]`
* **Visual Type:** Line chart or Stacked Area chart.

### Sheet 4: Global Manufacturing Country Map
* **Marks Card:** Change mark type to **Map**.
* **Detail:** Drag `[Manufacturing Country]` to Detail (ensure geographic role is set to Country/Region).
* **Color:** `SUM([Units Sold Annual])`.

### Sheet 5: Price vs Driving Range (Scatter Plot)
* **Columns:** `AVG([Base Price USD])`
* **Rows:** `AVG([Driving Range km])`
* **Detail:** `[Model Name]`
* **Color:** `[Battery Technology]`
* **Shape:** `[Vehicle Category]`

---

## 📱 4. Assembling the Tableau Dashboard
1. Click **New Dashboard** at the bottom.
2. Set Size to **Fixed Size** (e.g., `1440 x 900` or **Automatic**).
3. Drag **Sheet 1**, **Sheet 2**, **Sheet 3**, and **Sheet 5** onto the canvas.
4. Add top KPI text containers:
   * **Total Units Sold:** `<SUM(Units Sold Annual)>`
   * **Gross Revenue:** `<[Revenue in Billions]>`
   * **Avg Range:** `<AVG(Driving Range km)> km`
5. Click on Sheet 1 ➔ Click the **Filter (funnel) icon** on its border to enable *"Use as Filter"*. Do the same for Sheet 2. This enables interactive cross-filtering across the entire dashboard!

---

## 🌐 5. Publishing to Tableau Public (Demo Link)
1. In Tableau, click **Server** from the top menu bar.
2. Select **Tableau Public** ➔ **Save to Tableau Public As...**
3. Log into your free Tableau Public account.
4. Enter workbook title: `Electric Vehicle Industry Analytics Dashboard`.
5. Click **Save**.
6. When your browser opens to your published workbook, click **Share** at the bottom right and copy the **Link**.
7. You can submit this link directly as your **Demo Link**!
