# 🚗 Electric Vehicle Market Analysis - Tableau Step-by-Step Implementation Guide

Yeh guide aapko aapka Tableau project (**Electric Vehicle Market Analysis**) complete karne aur publish karne me madad karegi.

---

## 📂 Ready-to-Use Files Already in Your Folder:
Aapke computer ke project folder (`c:\Users\HP\OneDrive\Desktop\data anlytics proj\`) me humne zaroori files already setup kar di hain:
1. **Cleaned Dataset:** [`data/ev_data_cleaned.csv`](file:///c:/Users/HP/OneDrive/Desktop/data%20anlytics%20proj/data/ev_data_cleaned.csv) (478 EV records with 23 columns)
2. **Pre-built Tableau Workbook:** [`EV_Market_Analysis.twbx`](file:///c:/Users/HP/OneDrive/Desktop/data%20anlytics%20proj/EV_Market_Analysis.twbx) (Isko aap Tableau Public me double click karke directly open kar sakte hain!)

---

## 🛠️ Step-by-Step Build Guide: From Scratch in Tableau

### 🔹 STEP 1: Dataset Connect Karna
1. **Tableau Desktop** ya **Tableau Public** application open karein.
2. Left side **Connect** panel me **Text file** par click karein.
3. Browse karke yeh file select karein:
   ```
   c:\Users\HP\OneDrive\Desktop\data anlytics proj\data\ev_data_cleaned.csv
   ```
4. Data Source tab me ensure karein ki saare columns load ho gaye hain (Total **478 rows** aur **23 fields**):
   - `brand` (String / Dimension)
   - `model` (String / Dimension)
   - `battery_capacity_kWh` (Number Decimal / Measure)
   - `range_km` (Number Whole / Measure)
   - `efficiency_wh_per_km` (Number Whole / Measure)
   - `drivetrain` (String / Dimension)
   - `car_body_type` (String / Dimension)
5. Bottom-left me **Sheet 1** tab par click karein.

---

### 🔹 STEP 2: Teen (3) KPI Cards Banana

#### KPI 1: EV Records (Total Models = 478)
1. Sheet ka naam rename karein: **`KPI - EV Records`**.
2. Left side Data Pane se `model` field ko drag karke **Text (Marks Card)** par drop karein.
3. Drop karne ke baad us par right-click karein ➔ **Measure** ➔ select **Count** (`CNT(model)`).
4. Marks card me **Text** par click karein ➔ Alignment **Center** karein, Font size **16pt Bold** karein.
5. Sheet Title par double-click karein ➔ Title likhein: **EV Records** (Bold, Center).

#### KPI 2: Average Driving Range (Avg = 393 km)
1. Ek nayi sheet open karein (+ icon bottom me) ➔ rename: **`KPI - Average Range`**.
2. `range_km` field ko drag karke **Text (Marks Card)** par drop karein.
3. Right-click on `range_km` on Marks card ➔ **Measure** ➔ select **Average** (`AVG(range_km)`).
4. Number Format set karein: Right-click `AVG(range_km)` ➔ **Format** ➔ Numbers: **Number (Custom)** ➔ Decimal places: **0** (Result: `393 km`).
5. Font ko **16pt Bold, Center** karein.
6. Title set karein: **Avg. Range (km)** (Bold, Center).

#### KPI 3: Average Battery Capacity (Avg = 74.0 kWh)
1. Nayi sheet banayein ➔ rename: **`KPI - Average Battery`**.
2. `battery_capacity_kWh` field ko drag karke **Text (Marks Card)** par drop karein.
3. Right-click on measure ➔ **Measure** ➔ select **Average** (`AVG(battery_capacity_kWh)`).
4. Format: Right-click ➔ **Format** ➔ Decimal places: **1** (Result: `74.0`).
5. Font ko **16pt Bold, Center** karein.
6. Title set karein: **Avg. Battery (kWh)** (Bold, Center).

---

### 🔹 STEP 3: Chaar (4) Main Visualizations Banana

#### Visual 1: Top 10 EV Brands by Models
1. Nayi sheet ➔ rename: **`Top 10 EV Brands`**.
2. **Rows shelf:** Drag `brand`.
3. **Columns shelf:** Drag `model` ➔ Right-click ➔ select **Measure (Count)** (`CNT(model)`).
4. **Sort karein:** Toolbar me **Sort Descending** button par click karein taaki sabse zyada model wali brands upar aayein.
5. **Top 10 Filter lagayein:**
   - `brand` field ko drag karke **Filters** shelf me daalein.
   - Popup window me **Top** tab par click karein.
   - **By field** select karein ➔ **Top 10** by `model` ➔ **Count** ➔ Click **OK**.
6. **Data Labels:** Marks card par **Label** box ko check karein (*Show mark labels*).
7. Sheet Title: **Top 10 EV Brands by Number of Listed Models** (Bold).

#### Visual 2: EV Range Distribution (Histogram)
1. Nayi sheet ➔ rename: **`EV Range Distribution`**.
2. **Bin create karein:**
   - Left side Data Pane me `range_km` par right-click karein ➔ **Create** ➔ **Bins...**
   - New field name: `Range Km (bin)`
   - Size of bins: **50** ➔ Click **OK**.
3. **Columns shelf:** Drag newly created `Range Km (bin)`.
4. **Rows shelf:** Drag `model` ➔ Right-click ➔ Measure: **Count** (`CNT(model)`).
5. Chart type Automatic/Bar hona chahiye. Har bar 50 km ke intervals (e.g., 200-250, 250-300, etc.) me EV models ka distribution dikhayega.
6. Sheet Title: **Distribution of Listed EV Driving Ranges** (Bold).

#### Visual 3: Battery Capacity vs Listed Driving Range (Scatter Plot)
1. Nayi sheet ➔ rename: **`Battery vs Range`**.
2. **Columns shelf:** Drag `battery_capacity_kWh` ➔ Right-click ➔ Measure: **Average** (`AVG(battery_capacity_kWh)`).
3. **Rows shelf:** Drag `range_km` ➔ Right-click ➔ Measure: **Average** (`AVG(range_km)`).
4. Marks card type change karke **Circle** select karein.
5. **Detail & Color:**
   - Drag `model` to **Detail** in Marks card (Isse har gaadi ka alag dot/circle ban jayega).
   - Drag `drivetrain` to **Color** in Marks card (AWD, FWD, RWD alag-alag color me dikhenge).
6. **Trend Line Add karein:**
   - Left panel me Data tab ke paas **Analytics** tab par click karein.
   - **Trend Line** ko drag karke chart par **Linear** par drop karein (Isse strong correlation dikhega ~0.88 R-squared).
7. Sheet Title: **Battery Capacity vs Listed Driving Range** (Bold).

#### Visual 4: EV Models by Body Type
1. Nayi sheet ➔ rename: **`EV Body Type Analysis`**.
2. **Rows shelf:** Drag `car_body_type`.
3. **Columns shelf:** Drag `model` ➔ Right-click ➔ Measure: **Count** (`CNT(model)`).
4. **Sort Descending** click karein (SUV, Hatchback, Sedan, etc. order me aayenge).
5. Marks card me **Label** check karein (*Show mark labels*).
6. Sheet Title: **EV Models by Body Type** (Bold).

---

### 🔹 STEP 4: Dashboard Assemble Karna (Layout & Global Filters)

1. Bottom me **New Dashboard** icon par click karein.
2. Dashboard rename karein: **`EV Market Analysis Dashboard`**.
3. **Dashboard Size:** Left panel me Size dropdown se **Automatic** ya **Fixed Size: 1400 x 900 px** select karein.
4. **Header Title Container:**
   - Left panel me **Show dashboard title** checkbox ko tick karein.
   - Title par double-click karke format karein:
     - Line 1: **Electric Vehicle Market Analysis** (Size 20, Bold)
     - Line 2: *Exploring EV brands, driving range, battery capacity and vehicle types* (Size 12, Regular)
5. **KPI Cards Row:**
   - Ek **Horizontal Container** drag karein top par.
   - Us horizontal container ke andar teeno KPI sheets ko side-by-side drag karein:
     - `KPI - EV Records` (Left)
     - `KPI - Average Range` (Middle)
     - `KPI - Average Battery` (Right)
   - Teeno sheets ke headers par right-click karke "Fit" ➔ **Fit Entire View** karein.
6. **Visualizations 2x2 Grid:**
   - KPI cards ke neeche 4 charts ko 2x2 grid me arrange karein:
     - **Top-Left:** `Top 10 EV Brands`
     - **Top-Right:** `EV Range Distribution`
     - **Bottom-Left:** `Battery vs Range`
     - **Bottom-Right:** `EV Body Type Analysis`
7. **Global Interactive Filters Add Karna:**
   - Kisi bhi sheet (jaise `Battery vs Range`) ke top-right dropdown arrow par click karein.
   - **Filters** ➔ Check **Brand**
   - **Filters** ➔ Check **Drivetrain**
   - **Filters** ➔ Check **Car Body Type**
   - Teeno filters right sidebar me aa jayenge.
   - Har filter ke dropdown arrow par click karke:
     ➔ **Apply to Worksheets** ➔ **All Using This Data Source** select karein.
   - Isse jab aap filter se koi Brand ya Drivetrain select karenge, pura dashboard real-time me update hoga!

---

### 🔹 STEP 5: Tableau Public Par Publish Karna

1. Top menu me **Server** par click karein.
2. Select: **Tableau Public** ➔ **Save to Tableau Public As...**
3. Apne Tableau Public account ka Email aur Password enter karein.
4. Workbook title daalein: **Electric Vehicle Market Analysis**
5. **Save** par click karein.
6. Publish hone ke baad aapke browser me aapka apna live link open ho jayega.
7. Upar share icon se public URL copy karke apne college/portal submission ya resume me daal sakte hain.
