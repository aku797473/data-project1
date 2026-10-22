# 📋 Portal Submission Guide: Epic-by-Epic Walkthrough

**Project Title:** Electric Vehicle Market Performance & Insights  
**Domain:** Transportation & Sustainable Mobility  
**Total Epics:** 8 Epics | **Total Tasks:** 14 Tasks | **Target Progress:** 100%  
**Student / Project Author:** Amit Kumar Mishra  

---

## 🎯 Quick Links for Portal Submission

| Field on Portal | Exact Value / Link to Paste | Description |
| :--- | :--- | :--- |
| **Add Demo Link** | `https://public.tableau.com/app/profile/amit.mishra1535/viz/EV_Market_Analysis/EVMarketAnalysisDashboard` | **Official Live Tableau Public Dashboard Link (Main Demo)** |
| **Add Github Link** | `https://github.com/aku797473/data-project1` | Public GitHub repository containing all source code, datasets & Tableau workbooks |
| **Alternate Web Demo Link** | `https://aku797473.github.io/data-project1/` | GitHub Pages Web Dashboard (Bonus / Alternate) |

---

## 📌 Epic-by-Epic Solution & Submission Checklist

### 1️⃣ Epic 1: Data Collection & Extraction (Duration: 5h 0m)
* **Task 1.1: Downloading the Dataset**
  * **File to use/upload:** [`data/ev_market_data.csv`](data/ev_market_data.csv)
  * **What to enter:** "Dataset contains 1,200 verified records spanning 2021 to 2026 across 12 global EV manufacturers (Tesla, BYD, Volkswagen, Hyundai, BMW, etc.), 6 vehicle categories (SUV, Sedan, Hatchback, Truck, Bus, Two-Wheeler), and 5 battery chemistries (LFP, NMC, NCA, Sodium-Ion, Solid-State) with 20 analytical attributes."
  * **Status:** Mark as **Complete / Done**.

* **Task 1.2: Connect Dataset with Tableau**
  * **Action:** Open Tableau Desktop / Tableau Public ➔ Click *Text File* ➔ Select `data/ev_market_data.csv`.
  * **Guide:** Follow instructions in [`TABLEAU_GUIDE.md`](TABLEAU_GUIDE.md).
  * **Status:** Mark as **Complete / Done**.

---

### 2️⃣ Epic 2: Data Preparation
* **File to use/upload:** [`data/ev_market_data_cleaned.csv`](data/ev_market_data_cleaned.csv) & [`data/data_dictionary.md`](data/data_dictionary.md)
* **What was performed:**
  * Zero missing values / null imputation validated.
  * Computed derived metrics: `Price_per_km_USD` ($/km), `Annual_Revenue_USD` (Sales × Price), `CO2_Offset_Tons_Annual` (Displaced ICE emissions).
  * Data type casting: Categorical string dimensions, numerical continuous measures, and NCAP safety rating integers.
* **Status:** Mark as **Complete / Done**.

---

### 3️⃣ Epic 3: Data Visualizations
* **Visuals Created in Dashboard & Tableau:**
  1. *Annual EV Sales Volume by Vehicle Category* (Bar Chart)
  2. *Automaker Global Market Share Distribution* (Doughnut Chart)
  3. *Battery Chemistry Adoption Trajectory 2021–2026* (Multi-Line Chart)
  4. *Geographical Production & Assembly Concentration* (Horizontal Bar Chart)
  5. *Customer Satisfaction Rating vs Base Price* (Scatter Plot)
  6. *Price-to-Range Cost Efficiency Benchmark ($/km)* (Bar Chart)
  7. *Fast-Charging Duration (10-80%) vs Usable Battery Capacity* (Dual-Axis Chart)
  8. *Life-Cycle CO2 Tailpipe Displacement by Segment* (Polar Area Chart)
* **Status:** Mark as **Complete / Done**.

---

### 4️⃣ Epic 4: Dashboard
* **Solution:** Interactive, executive-grade multi-scenario dashboard with real-time multi-filtering (Year, Brand, Category, Chemistry, and Keyword Search).
* **Live File:** [`index.html`](index.html) (View locally at `http://localhost:8080/index.html` or live on GitHub Pages).
* **Tableau Dashboard:** Configured in Tableau Desktop / Tableau Public with synchronized filter actions (see [`TABLEAU_GUIDE.md`](TABLEAU_GUIDE.md)).
* **Status:** Mark as **Complete / Done**.

---

### 5️⃣ Epic 5: Story
* **Storyboards & Personas Solved:**
  * **Scenario 1 (Emily Johnson — Market Strategy Director):** Product portfolio optimization showing that SUVs and Two-Wheelers command 58%+ of volume, with LFP reducing vehicle BOM costs by 18%.
  * **Scenario 2 (David Chen — BI Manager):** Competitive intelligence proving that dual-sourcing automakers (LFP for entry, NMC for flagship) preserve margins with sub-$95/km price efficiency.
  * **Scenario 3 (Dr. Sarah Williams — Sustainability Analyst):** Research analysis demonstrating commercial electric buses and trucks yield 5.4x greater CO2 abatement per kWh than passenger cars.
* **Status:** Mark as **Complete / Done**.

---

### 6️⃣ Epic 6: Performance Testing
* **Benchmark Report:** [`data/performance_benchmark_report.json`](data/performance_benchmark_report.json)
* **Test Metrics:**
  * 1,200 records ingested in **42 ms**.
  * 1,000 multi-criteria filter queries executed in **7.6 ms/query**.
  * 0 null values, 0 out-of-range records found (100% Pass).
* **Status:** Mark as **Complete / Done**.

---

### 7️⃣ Epic 7: Web Integration
* **Implementation:** Zero-dependency responsive HTML5 + Vanilla CSS + JavaScript web application with bundled offline Chart.js and vector iconography.
* **Deployment:** Hosted directly on GitHub Pages (`https://<YOUR_USERNAME>.github.io/ev-market-data-analytics/`).
* **Status:** Mark as **Complete / Done**.

---

### 8️⃣ Epic 8: Project Demonstration & Documentation
* **Comprehensive Deliverables:**
  * Project Documentation: [`README.md`](README.md)
  * Capstone Report: [`PROJECT_REPORT.md`](PROJECT_REPORT.md)
  * Video Script: [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) (3–5 min presentation script)
  * Tableau Guide: [`TABLEAU_GUIDE.md`](TABLEAU_GUIDE.md)
  * Submission Guide: [`SUBMISSION_GUIDE.md`](SUBMISSION_GUIDE.md)
* **Status:** Mark as **Complete / Done**.
