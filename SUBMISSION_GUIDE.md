# 🎓 Mentor Submission Guide: Demo and GitHub Links

This guide provides the exact instructions to generate, test, and paste your **Demo Link** and **GitHub Link** into your project evaluation portal.

---

## 📋 What Links Do You Need to Submit?

| Field Name in Portal | What to Enter | Example URL |
| :--- | :--- | :--- |
| **Add Github Link** | The public URL of your GitHub repository containing all project code, dataset, scripts, and documentation | `https://github.com/john-doe/ev-market-data-analytics` |
| **Add Demo Link** | The live URL where your interactive EV Analytics Dashboard can be viewed directly in a browser (hosted via GitHub Pages or Tableau Public) | `https://john-doe.github.io/ev-market-data-analytics/` |

---

## ⚡ Step 1: Create Your GitHub Repository (Gets your GitHub Link)

1. Open your browser and log into [GitHub](https://github.com/).
2. Click the **`+`** icon at the top right and select **New repository** (or go to [github.com/new](https://github.com/new)).
3. Fill in the repository details:
   - **Repository name:** `ev-market-data-analytics` (or any name you prefer)
   - **Description:** `Electric Vehicle (EV) Industry Analytics & Intelligence Platform - Capstone Project`
   - **Public / Private:** Select **Public** (mentors must be able to view it)
   - **Initialize with README:** Leave **unchecked** (we already created a complete `README.md`)
4. Click **Create repository**.
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/ev-market-data-analytics.git`).

---

## 💻 Step 2: Push Your Code from This Folder to GitHub

Open **PowerShell** or **Command Prompt** in this folder (`c:\Users\HP\OneDrive\Desktop\data anlytics proj`) and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ev-market-data-analytics.git
git branch -M main
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username).*

✅ **Copy this URL for "Add Github Link":**
```
https://github.com/YOUR_USERNAME/ev-market-data-analytics
```

---

## 🌐 Step 3: Enable GitHub Pages in 2 Clicks (Gets your Demo Link)

Your project has `index.html` located right at the root of the repository, making GitHub Pages setup instant:

1. In your GitHub repository, click on the **Settings** tab (the gear icon at the top right).
2. On the left sidebar menu, scroll down and click **Pages**.
3. Under **Build and deployment**:
   - **Source:** Select `Deploy from a branch`
   - **Branch:** Select `main`
   - **Folder:** Leave as `/ (root)`
4. Click **Save**.
5. Wait 30–60 seconds and refresh the page. A green box will appear:
   > *"Your site is live at https://YOUR_USERNAME.github.io/ev-market-data-analytics/"*

✅ **Copy this URL for "Add Demo Link":**
```
https://YOUR_USERNAME.github.io/ev-market-data-analytics/
```

---

## 📊 Alternative / Secondary Demo Link: Tableau Public (Optional)
If your mentor specifically requires a Tableau Public link in addition to the web dashboard:
1. Open **Tableau Public** or **Tableau Desktop**.
2. Connect to `data/ev_market_data.csv` (see detailed instructions in [`TABLEAU_GUIDE.md`](TABLEAU_GUIDE.md)).
3. Click `Server` ➔ `Tableau Public` ➔ `Save to Tableau Public As...`.
4. Copy the published workbook link (e.g., `https://public.tableau.com/views/EV_Industry_Analytics_Dashboard/Overview`).

---

## ✅ Final Pre-Submission Checklist
Before clicking **Submit** on your portal, verify:
- [x] GitHub repository is set to **Public**
- [x] All 8 Epics & 14 Stories are covered in `README.md` and `PROJECT_REPORT.md`
- [x] Dataset files are present in `data/` (`ev_market_data.csv`, `data_dictionary.md`)
- [x] Live Demo Link loads smoothly on mobile and desktop
- [x] Scenarios for Emily Johnson, David Chen, and Dr. Sarah Williams are accessible via tabs
- [x] 3-5 minute presentation script is prepared in `DEMO_SCRIPT.md`
