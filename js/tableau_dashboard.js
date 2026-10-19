/**
 * EV Market Performance & Insights - Real Dynamic CSV-Driven Engine
 * Powers the Tableau dashboard using 100% genuine records from data/ev_market_data.csv (window.EV_RAW_DATA)
 */

(function () {
  'use strict';

  // State
  let rawData = [];
  let filteredData = [];
  let currentCountry = 'ALL';
  let currentMfg = 'ALL';
  let currentCat = 'ALL';

  const chartInstances = {};

  // Custom Chart.js Plugin for crisp data labels matching Tableau
  const tableauDataLabelsPlugin = {
    id: 'tableauDataLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;

        meta.data.forEach((element, index) => {
          ctx.save();
          ctx.font = '700 10px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          if (chart.config.type === 'bar') {
            if (chart.config.options.indexAxis === 'y') {
              // Horizontal bar
              const val = dataset.dataLabels ? dataset.dataLabels[index] : (dataset.data[index] + 'M');
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#1c2e22';
              ctx.fillText(val, element.x + 6, element.y);
            } else {
              // Vertical bar
              const val = dataset.dataLabels ? dataset.dataLabels[index] : dataset.data[index];
              ctx.fillStyle = '#1c2e22';
              ctx.fillText(val, element.x, element.y - 4);
            }
          } else if (chart.config.type === 'line') {
            const val = dataset.data[index].toFixed(1) + 'M';
            ctx.fillStyle = dataset.borderColor || '#333';
            ctx.fillText(val, element.x, element.y - 6);
          }
          ctx.restore();
        });
      });
    }
  };

  Chart.register(tableauDataLabelsPlugin);

  // Palette generator
  const palette = [
    { fill: '#82c974', border: '#5da74e' },
    { fill: '#7e817a', border: '#5c5f59' },
    { fill: '#58a59f', border: '#3b7a75' },
    { fill: '#f19a53', border: '#cf752b' },
    { fill: '#e86b43', border: '#c04a25' },
    { fill: '#3b82f6', border: '#1d4ed8' },
    { fill: '#a855f7', border: '#7e22ce' },
    { fill: '#ec4899', border: '#be185d' }
  ];

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    // 1. Ingest Data from window.EV_RAW_DATA or fetch CSV
    if (window.EV_RAW_DATA && window.EV_RAW_DATA.length > 0) {
      rawData = window.EV_RAW_DATA;
      setupDashboard();
    } else {
      fetch('data/ev_market_data.csv')
        .then(res => res.text())
        .then(csvText => {
          rawData = parseCSV(csvText);
          setupDashboard();
        })
        .catch(err => {
          console.error("Error loading CSV:", err);
        });
    }
  }

  function setupDashboard() {
    populateFilterDropdowns();
    bindFilterEvents();
    bindModalEvents();
    applyFilters();
  }

  // Parse CSV if loaded via fetch
  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCSVLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h.trim()] = values[idx] ? values[idx].trim() : '';
      });
      records.push(obj);
    }
    return records;
  }

  function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  // Populate Dropdowns dynamically from actual CSV records
  function populateFilterDropdowns() {
    const countrySel = document.getElementById('filterCountry');
    const mfgSel = document.getElementById('filterMfg');
    const catSel = document.getElementById('filterCategory');

    const countries = [...new Set(rawData.map(r => r.Manufacturing_Country).filter(Boolean))].sort();
    const mfgs = [...new Set(rawData.map(r => r.Manufacturer).filter(Boolean))].sort();
    const categories = [...new Set(rawData.map(r => r.Vehicle_Category).filter(Boolean))].sort();

    if (countrySel) {
      countrySel.innerHTML = '<option value="ALL">(All)</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (mfgSel) {
      mfgSel.innerHTML = '<option value="ALL">(All)</option>' + mfgs.map(m => `<option value="${m}">${m}</option>`).join('');
    }
    if (catSel) {
      catSel.innerHTML = '<option value="ALL">(All)</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  // Filter application
  function applyFilters() {
    filteredData = rawData.filter(row => {
      if (currentCountry !== 'ALL' && row.Manufacturing_Country !== currentCountry) return false;
      if (currentMfg !== 'ALL' && row.Manufacturer !== currentMfg) return false;
      if (currentCat !== 'ALL' && row.Vehicle_Category !== currentCat) return false;
      return true;
    });

    renderKPIs();
    renderCategoryChart();
    renderManufacturerChart();
    renderTreemap();
    renderSalesTrendChart();
    renderBatteryChart();
    renderWorldMap();
    renderModalTable();
  }

  // 1. Calculate and Render KPIs directly from filtered dataset
  function renderKPIs() {
    const count = filteredData.length;
    if (count === 0) {
      document.getElementById('kpi-mfg').textContent = '0';
      document.getElementById('kpi-models').textContent = '0';
      document.getElementById('kpi-sales').textContent = '$0.0M Units';
      document.getElementById('kpi-rating').textContent = '0.0/5';
      document.getElementById('kpi-range').textContent = '0 KM';
      document.getElementById('kpi-battery').textContent = '0 kWh';
      return;
    }

    const uniqueMfgs = new Set(filteredData.map(r => r.Manufacturer)).size;
    const totalUnitsSold = filteredData.reduce((sum, r) => sum + (parseFloat(r.Units_Sold_Annual) || 0), 0);
    const avgRating = filteredData.reduce((sum, r) => sum + (parseFloat(r.Customer_Rating) || 0), 0) / count;
    const avgRange = filteredData.reduce((sum, r) => sum + (parseFloat(r.Driving_Range_km) || 0), 0) / count;
    const avgBattery = filteredData.reduce((sum, r) => sum + (parseFloat(r.Battery_Capacity_kWh) || 0), 0) / count;

    // Convert sales to Million units
    const salesMillions = (totalUnitsSold / 1000000).toFixed(1);

    document.getElementById('kpi-mfg').textContent = uniqueMfgs.toLocaleString();
    document.getElementById('kpi-models').textContent = count.toLocaleString();
    document.getElementById('kpi-sales').textContent = `$${salesMillions}M Units`;
    document.getElementById('kpi-rating').textContent = `${avgRating.toFixed(2)}/5`;
    document.getElementById('kpi-range').textContent = `${avgRange.toFixed(1)} KM`;
    document.getElementById('kpi-battery').textContent = `${avgBattery.toFixed(1)} kWh`;
  }

  // 2. Chart 1: EV Category Performance & Distribution (Real Counts)
  function renderCategoryChart() {
    const canvas = document.getElementById('chartCategory');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstances.category) chartInstances.category.destroy();

    // Group by Vehicle_Category
    const catMap = {};
    filteredData.forEach(r => {
      const cat = r.Vehicle_Category || 'Unknown';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sortedCats = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);
    const labels = sortedCats;
    const dataVals = sortedCats.map(c => catMap[c]);
    const dataLabels = dataVals.map(v => v.toString());
    const colors = sortedCats.map((_, i) => palette[i % palette.length].fill);

    chartInstances.category = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: dataVals,
          dataLabels: dataLabels,
          backgroundColor: colors,
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 22, right: 10 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Count: ${ctx.raw} vehicles (${((ctx.raw / (filteredData.length || 1)) * 100).toFixed(1)}%)`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#3a2210',
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' },
              maxRotation: 25
            }
          },
          y: {
            title: {
              display: true,
              text: 'Count of Vehicles',
              color: '#4a3b2c',
              font: { family: 'Playfair Display', size: 10.5, weight: 'bold' }
            },
            ticks: {
              color: '#555',
              font: { size: 10 }
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 3. Chart 2: Market Share by Manufacturer (Real Sales Units)
  function renderManufacturerChart() {
    const canvas = document.getElementById('chartManufacturer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstances.mfg) chartInstances.mfg.destroy();

    // Group by Manufacturer & sum Units_Sold_Annual
    const mfgMap = {};
    filteredData.forEach(r => {
      const m = r.Manufacturer || 'Unknown';
      mfgMap[m] = (mfgMap[m] || 0) + (parseFloat(r.Units_Sold_Annual) || 0);
    });

    const sortedMfgs = Object.keys(mfgMap).sort((a, b) => mfgMap[b] - mfgMap[a]).slice(0, 6);
    const labels = sortedMfgs;
    const dataVals = sortedMfgs.map(m => parseFloat((mfgMap[m] / 1000000).toFixed(2)));
    const dataLabels = dataVals.map(v => `$${v}M`);
    const colors = sortedMfgs.map((_, i) => palette[(i + 3) % palette.length].fill);

    chartInstances.mfg = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: dataVals,
          dataLabels: dataLabels,
          backgroundColor: colors,
          borderRadius: 3,
          barThickness: 18
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 55 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Annual Sales: $${ctx.raw}M Units`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Annual Sales (Millions)',
              color: '#3a2210',
              font: { family: 'Playfair Display', size: 10.5, weight: 'bold' }
            },
            ticks: {
              callback: (val) => val + 'M',
              color: '#555',
              font: { size: 10 }
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            beginAtZero: true
          },
          y: {
            ticks: {
              color: '#111827',
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' }
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 4. Chart 3: Treemap Component (Real Category Counts & Avg Rating)
  function renderTreemap() {
    const container = document.getElementById('treemapContainer');
    if (!container) return;
    container.innerHTML = '';

    const catStats = {};
    filteredData.forEach(r => {
      const cat = r.Vehicle_Category || 'Other';
      if (!catStats[cat]) catStats[cat] = { count: 0, ratingSum: 0 };
      catStats[cat].count += 1;
      catStats[cat].ratingSum += (parseFloat(r.Customer_Rating) || 0);
    });

    const entries = Object.keys(catStats).sort((a, b) => catStats[b].count - catStats[a].count);
    if (entries.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1; display:flex; align-items:center; justify-content:center; color:#888; font-size:12px;">No matching records</div>';
      return;
    }

    const tileClasses = ['tm-scooter', 'tm-suv-comp', 'tm-sedan', 'tm-hatch', 'tm-cross', 'tm-sedan-lux', 'tm-suv-full', 'tm-micro'];

    entries.forEach((cat, idx) => {
      const item = catStats[cat];
      const avgR = (item.ratingSum / item.count).toFixed(2);
      const el = document.createElement('div');
      el.className = `tm-tile ${tileClasses[idx % tileClasses.length] || 'tm-scooter'}`;
      el.title = `${cat}: ${item.count} models, Avg Rating: ${avgR} ★`;

      el.innerHTML = `
        <div class="tm-label">${cat}</div>
        <div class="tm-val">${item.count} models (${avgR} ★)</div>
      `;

      el.addEventListener('click', () => {
        const catSel = document.getElementById('filterCategory');
        if (catSel) {
          catSel.value = cat;
          currentCat = cat;
          applyFilters();
        }
      });

      container.appendChild(el);
    });
  }

  // 5. Chart 4: Annual EV Sales Trend by Model Year (Real Year Sums)
  function renderSalesTrendChart() {
    const canvas = document.getElementById('chartSalesTrend');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstances.trend) chartInstances.trend.destroy();

    const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
    const yearSales = {};
    years.forEach(y => yearSales[y] = 0);

    filteredData.forEach(r => {
      const y = r.Year;
      if (yearSales[y] !== undefined) {
        yearSales[y] += (parseFloat(r.Units_Sold_Annual) || 0);
      }
    });

    const dataVals = years.map(y => parseFloat((yearSales[y] / 1000000).toFixed(2)));

    chartInstances.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Total Deliveries',
          data: dataVals,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.12)',
          fill: true,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#2e7d32',
          pointBorderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 22, right: 12 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}M Units`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Model Year',
              color: '#3a2210',
              font: { family: 'Playfair Display', size: 10.5, weight: 'bold' }
            },
            ticks: { color: '#3a2210', font: { size: 10, weight: '700' } },
            grid: { display: false }
          },
          y: {
            title: {
              display: true,
              text: 'Annual Sales (Millions)',
              color: '#3a2210',
              font: { family: 'Playfair Display', size: 10.5, weight: 'bold' }
            },
            ticks: {
              callback: (val) => val + 'M',
              color: '#555',
              font: { size: 10 }
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 6. Chart 5: Battery Technology Market Share (Real Counts)
  function renderBatteryChart() {
    const canvas = document.getElementById('chartBattery');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstances.battery) chartInstances.battery.destroy();

    const techMap = {};
    filteredData.forEach(r => {
      const tech = r.Battery_Technology || 'Other';
      techMap[tech] = (techMap[tech] || 0) + 1;
    });

    const techs = Object.keys(techMap).sort((a, b) => techMap[b] - techMap[a]);
    const total = filteredData.length || 1;
    const labels = techs.map(t => `${Math.round((techMap[t] / total) * 100)}% ${t}`);
    const dataVals = techs.map(t => techMap[t]);

    const batteryColors = {
      'NMC': '#e05345',
      'LFP': '#2b6cb0',
      'Solid-State': '#10b981',
      'Sodium-Ion': '#06b6d4',
      'NCA': '#f59e0b'
    };

    const bgColors = techs.map((t, idx) => batteryColors[t] || palette[idx % palette.length].fill);

    chartInstances.battery = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataVals,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '46%',
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 8,
              font: { family: 'Plus Jakarta Sans', size: 9.5, weight: '700' },
              color: '#2c3e2f'
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} models`
            }
          }
        }
      }
    });
  }

  // 7. Interactive SVG World Map (Real Country Counts)
  function renderWorldMap() {
    const svg = document.getElementById('worldMapSvg');
    if (!svg) return;

    const countryCounts = {};
    filteredData.forEach(r => {
      const c = r.Manufacturing_Country;
      if (c) countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    const usaVal = (countryCounts['USA'] || 0).toLocaleString();
    const gerVal = (countryCounts['Germany'] || 0).toLocaleString();
    const indVal = (countryCounts['India'] || 0).toLocaleString();
    const korVal = (countryCounts['South Korea'] || 0).toLocaleString();
    const chnVal = (countryCounts['China'] || 0).toLocaleString();

    svg.innerHTML = `
      <defs>
        <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4caf50" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#2e7d32" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <!-- Continents Outlines -->
      <g fill="#d8ecdc" stroke="#b2d8ba" stroke-width="0.8">
        <path d="M 30 40 Q 50 30 90 40 Q 120 70 90 100 Q 60 110 40 80 Z" />
        <path d="M 80 115 Q 110 125 105 160 Q 95 190 85 165 Z" />
        <path d="M 170 35 Q 210 30 220 55 Q 200 70 170 65 Z" />
        <path d="M 175 75 Q 225 75 220 135 Q 185 155 170 110 Z" />
        <path d="M 230 35 Q 330 30 340 90 Q 280 110 230 75 Z" />
        <path d="M 310 130 Q 350 135 345 165 Q 315 160 310 130 Z" />
      </g>
      
      <!-- Interactive Pins with Real Counts -->
      <g class="map-pin" onclick="selectCountry('USA')" transform="translate(75, 65)">
        <circle r="11" fill="url(#pinGlow)" opacity="0.6"/>
        <circle r="6" fill="#2e7d32" stroke="#ffffff" stroke-width="1.8"/>
        <text x="10" y="4" class="map-pin-label">USA: ${usaVal}</text>
      </g>

      <g class="map-pin" onclick="selectCountry('Germany')" transform="translate(190, 52)">
        <circle r="11" fill="url(#pinGlow)" opacity="0.6"/>
        <circle r="6" fill="#2e7d32" stroke="#ffffff" stroke-width="1.8"/>
        <text x="10" y="4" class="map-pin-label">Germany: ${gerVal}</text>
      </g>

      <g class="map-pin" onclick="selectCountry('India')" transform="translate(255, 82)">
        <circle r="12" fill="url(#pinGlow)" opacity="0.7"/>
        <circle r="6.5" fill="#1b5e20" stroke="#ffffff" stroke-width="1.8"/>
        <text x="-65" y="16" class="map-pin-label">India: ${indVal}</text>
      </g>

      <g class="map-pin" onclick="selectCountry('South Korea')" transform="translate(305, 68)">
        <circle r="11" fill="url(#pinGlow)" opacity="0.6"/>
        <circle r="6" fill="#2e7d32" stroke="#ffffff" stroke-width="1.8"/>
        <text x="10" y="4" class="map-pin-label">S. Korea: ${korVal}</text>
      </g>

      <g class="map-pin" onclick="selectCountry('China')" transform="translate(270, 60)">
        <circle r="11" fill="url(#pinGlow)" opacity="0.6"/>
        <circle r="6" fill="#2e7d32" stroke="#ffffff" stroke-width="1.8"/>
        <text x="10" y="-4" class="map-pin-label">China: ${chnVal}</text>
      </g>
    `;
  }

  window.selectCountry = function(countryName) {
    const sel = document.getElementById('filterCountry');
    if (sel) {
      sel.value = countryName;
      currentCountry = countryName;
      applyFilters();
    }
  };

  // 8. Event Listeners for Filters
  function bindFilterEvents() {
    const filterCountry = document.getElementById('filterCountry');
    const filterMfg = document.getElementById('filterMfg');
    const filterCategory = document.getElementById('filterCategory');
    const btnReset = document.getElementById('btnResetFilters');

    if (filterCountry) {
      filterCountry.addEventListener('change', () => {
        currentCountry = filterCountry.value;
        applyFilters();
      });
    }
    if (filterMfg) {
      filterMfg.addEventListener('change', () => {
        currentMfg = filterMfg.value;
        applyFilters();
      });
    }
    if (filterCategory) {
      filterCategory.addEventListener('change', () => {
        currentCat = filterCategory.value;
        applyFilters();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (filterCountry) filterCountry.value = 'ALL';
        if (filterMfg) filterMfg.value = 'ALL';
        if (filterCategory) filterCategory.value = 'ALL';
        currentCountry = 'ALL';
        currentMfg = 'ALL';
        currentCat = 'ALL';
        applyFilters();
      });
    }
  }

  // 9. Real Modal Table with Filtered Records
  function renderModalTable() {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;

    const slice = filteredData.slice(0, 50);
    tbody.innerHTML = slice.map(r => `
      <tr>
        <td><strong>${r.Vehicle_ID}</strong></td>
        <td>${r.Manufacturer}</td>
        <td>${r.Model_Name || ''}</td>
        <td>${r.Vehicle_Category}</td>
        <td>${r.Battery_Technology}</td>
        <td>${r.Battery_Capacity_kWh}</td>
        <td>${r.Driving_Range_km}</td>
        <td>$${parseInt(r.Base_Price_USD || 0).toLocaleString()}</td>
        <td>${parseInt(r.Units_Sold_Annual || 0).toLocaleString()}</td>
        <td>${r.Customer_Rating} ★</td>
        <td>${r.Manufacturing_Country}</td>
      </tr>
    `).join('');
  }

  function bindModalEvents() {
    const btnOpenTable = document.getElementById('btnOpenDataTable');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const modal = document.getElementById('dataTableModal');

    if (btnOpenTable && modal) {
      btnOpenTable.addEventListener('click', () => modal.classList.add('active'));
    }
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  }

})();
