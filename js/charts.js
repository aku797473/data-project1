/**
 * Electric Vehicle (EV) Industry Analytics - Chart Engine
 * Manages all Chart.js instances across Overview & Scenarios
 */

const EVCharts = (function () {
  // Color Tokens matching Design System
  const colors = {
    cyan: '#00f0ff',
    emerald: '#10b981',
    purple: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',
    blue: '#3b82f6',
    teal: '#14b8a6',
    indigo: '#6366f1',
    slate: '#475569',
    grid: 'rgba(255, 255, 255, 0.08)',
    text: '#94a3b8'
  };

  const chartPalette = [
    '#00f0ff', '#10b981', '#8b5cf6', '#f59e0b', 
    '#3b82f6', '#f43f5e', '#14b8a6', '#eab308',
    '#a855f7', '#06b6d4', '#ec4899', '#64748b'
  ];

  // Store active chart instances
  const instances = {};

  function destroyChart(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function getBaseOptions(titleText = '') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { family: 'Inter', size: 12 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
          bodyFont: { family: 'Inter', size: 12 },
          borderColor: 'rgba(0, 240, 255, 0.3)',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: { color: colors.text, font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: { color: colors.text, font: { family: 'Inter', size: 11 } }
        }
      }
    };
  }

  // 1. Overview: Sales by Category
  function renderSalesByCategory(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const catMap = {};
    data.forEach(r => {
      catMap[r.Vehicle_Category] = (catMap[r.Vehicle_Category] || 0) + Number(r.Units_Sold_Annual);
    });

    const labels = Object.keys(catMap);
    const values = labels.map(k => catMap[k]);

    const opts = getBaseOptions();
    opts.scales.y.ticks.callback = val => (val >= 1e6 ? (val / 1e6).toFixed(1) + 'M' : (val / 1e3).toFixed(0) + 'K');

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Annual Units Sold',
          data: values,
          backgroundColor: labels.map((_, i) => chartPalette[i % chartPalette.length] + 'cc'),
          borderColor: labels.map((_, i) => chartPalette[i % chartPalette.length]),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: opts
    });
  }

  // 2. Overview: Market Share Doughnut
  function renderMarketShare(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const mfgMap = {};
    let total = 0;
    data.forEach(r => {
      const units = Number(r.Units_Sold_Annual);
      mfgMap[r.Manufacturer] = (mfgMap[r.Manufacturer] || 0) + units;
      total += units;
    });

    // Top 7 manufacturers, group rest as "Other"
    const sorted = Object.entries(mfgMap).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const otherUnits = sorted.slice(6).reduce((acc, curr) => acc + curr[1], 0);

    const labels = top.map(x => x[0]);
    const values = top.map(x => x[1]);
    if (otherUnits > 0) {
      labels.push('Others');
      values.push(otherUnits);
    }

    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartPalette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#111726'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: colors.text, font: { family: 'Inter', size: 11 }, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw;
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${(val / 1e6).toFixed(2)}M units (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 3. Overview: Battery Tech Adoption Trend over Time
  function renderTechAdoption(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const years = [2021, 2022, 2023, 2024, 2025, 2026];
    const techs = ['LFP', 'NMC', 'NCA', 'Sodium-Ion', 'Solid-State'];

    const datasets = techs.map((tech, idx) => {
      const dataPoints = years.map(yr => {
        const matching = data.filter(r => Number(r.Year) === yr && r.Battery_Technology === tech);
        return matching.reduce((sum, r) => sum + Number(r.Units_Sold_Annual), 0);
      });

      return {
        label: tech,
        data: dataPoints,
        borderColor: chartPalette[idx % chartPalette.length],
        backgroundColor: chartPalette[idx % chartPalette.length] + '22',
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
        pointRadius: 3
      };
    });

    const opts = getBaseOptions();
    opts.scales.y.ticks.callback = val => (val >= 1e6 ? (val / 1e6).toFixed(1) + 'M' : val);

    instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: { labels: years, datasets: datasets },
      options: opts
    });
  }

  // 4. Overview: Geographical Production Breakdown
  function renderGeoDistribution(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const countryMap = {};
    data.forEach(r => {
      countryMap[r.Manufacturing_Country] = (countryMap[r.Manufacturing_Country] || 0) + Number(r.Units_Sold_Annual);
    });

    const sorted = Object.entries(countryMap).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(x => x[0]);
    const values = sorted.map(x => x[1]);

    const opts = getBaseOptions();
    opts.indexAxis = 'y';
    opts.scales.x.ticks.callback = val => (val >= 1e6 ? (val / 1e6).toFixed(1) + 'M' : val);

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Units Manufactured',
          data: values,
          backgroundColor: '#00f0ffaa',
          borderColor: '#00f0ff',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: opts
    });
  }

  // 5. Emily: Category Sales vs Revenue
  function renderEmilyCategoryAnalysis(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const catMap = {};
    data.forEach(r => {
      if (!catMap[r.Vehicle_Category]) {
        catMap[r.Vehicle_Category] = { units: 0, revenue: 0 };
      }
      catMap[r.Vehicle_Category].units += Number(r.Units_Sold_Annual);
      catMap[r.Vehicle_Category].revenue += Number(r.Annual_Revenue_USD);
    });

    const labels = Object.keys(catMap);
    const units = labels.map(k => catMap[k].units / 1e6); // Millions
    const revenue = labels.map(k => catMap[k].revenue / 1e9); // Billions

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sales Volume (Million Units)',
            data: units,
            backgroundColor: '#00f0ffcc',
            borderColor: '#00f0ff',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Total Revenue (Billion $)',
            data: revenue,
            backgroundColor: '#10b981cc',
            borderColor: '#10b981',
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: colors.grid },
            ticks: { color: colors.text, callback: v => v + 'M' },
            title: { display: true, text: 'Units Sold (M)', color: colors.text }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#10b981', callback: v => '$' + v + 'B' },
            title: { display: true, text: 'Revenue ($B)', color: '#10b981' }
          }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true } }
        }
      }
    });
  }

  // 6. Emily: Customer Rating vs Base Price Scatter
  function renderEmilyRatingVsPrice(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Sample 120 points for smooth rendering
    const sampled = data.slice(0, 140).map(r => ({
      x: Number(r.Base_Price_USD),
      y: Number(r.Customer_Rating),
      label: `${r.Manufacturer} ${r.Model_Name} (${r.Vehicle_Category})`
    }));

    instances[canvasId] = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Vehicle Model Rating',
          data: sampled,
          backgroundColor: '#8b5cf6aa',
          borderColor: '#8b5cf6',
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: { color: colors.text, callback: v => '$' + (v / 1e3) + 'k' },
            title: { display: true, text: 'Base Price (USD)', color: colors.text }
          },
          y: {
            min: 3.0,
            max: 5.0,
            grid: { color: colors.grid },
            ticks: { color: colors.text, stepSize: 0.5 },
            title: { display: true, text: 'Customer Rating (1 - 5 Stars)', color: colors.text }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const item = ctx.raw;
                return ` ${item.label}: Rating ${item.y} ★ | $${item.x.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  // 7. David: Manufacturer Market Share & Battery Tech Distribution
  function renderDavidTechDistribution(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const topMfgs = ['Tesla', 'BYD', 'Volkswagen', 'Hyundai-Kia', 'BMW Group', 'Tata Motors', 'Ford'];
    const techs = ['LFP', 'NMC', 'NCA', 'Sodium-Ion', 'Solid-State'];

    const datasets = techs.map((tech, idx) => {
      const counts = topMfgs.map(mfg => {
        return data.filter(r => r.Manufacturer === mfg && r.Battery_Technology === tech).length;
      });

      return {
        label: tech,
        data: counts,
        backgroundColor: chartPalette[idx % chartPalette.length] + 'cc',
        borderColor: chartPalette[idx % chartPalette.length],
        borderWidth: 1
      };
    });

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: { labels: topMfgs, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: colors.grid }, ticks: { color: colors.text } },
          y: { stacked: true, grid: { color: colors.grid }, ticks: { color: colors.text } }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true } }
        }
      }
    });
  }

  // 8. David: Price per km Range Efficiency
  function renderDavidPricePerKm(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const mfgMap = {};
    data.forEach(r => {
      if (!mfgMap[r.Manufacturer]) mfgMap[r.Manufacturer] = [];
      mfgMap[r.Manufacturer].push(Number(r.Price_per_km_USD));
    });

    const labels = Object.keys(mfgMap);
    const avgPrices = labels.map(k => {
      const arr = mfgMap[k];
      return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    });

    const opts = getBaseOptions();
    opts.scales.y.ticks.callback = val => '$' + val + '/km';

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Avg Price-to-Range Ratio ($/km)',
          data: avgPrices,
          backgroundColor: '#f59e0baa',
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: opts
    });
  }

  // 9. Sarah: Battery Tech Comparison (Range vs Fast Charge Time)
  function renderSarahBatteryComparison(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const techs = ['LFP', 'NMC', 'NCA', 'Sodium-Ion', 'Solid-State'];
    const rangeData = [];
    const chargeTimeData = [];
    const effData = [];

    techs.forEach(t => {
      const subset = data.filter(r => r.Battery_Technology === t);
      if (subset.length > 0) {
        const avgRange = subset.reduce((acc, r) => acc + Number(r.Driving_Range_km), 0) / subset.length;
        const avgTime = subset.reduce((acc, r) => acc + Number(r.Fast_Charge_Time_min), 0) / subset.length;
        const avgEff = subset.reduce((acc, r) => acc + Number(r.Efficiency_Wh_per_km), 0) / subset.length;
        rangeData.push(Math.round(avgRange));
        chargeTimeData.push(Math.round(avgTime));
        effData.push(Math.round(avgEff));
      } else {
        rangeData.push(0);
        chargeTimeData.push(0);
        effData.push(0);
      }
    });

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: techs,
        datasets: [
          {
            label: 'Avg Driving Range (km)',
            data: rangeData,
            backgroundColor: '#00f0ffcc',
            borderColor: '#00f0ff',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Fast Charge Time 10-80% (min)',
            data: chargeTimeData,
            backgroundColor: '#f43f5ecc',
            borderColor: '#f43f5e',
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
          y: {
            position: 'left',
            grid: { color: colors.grid },
            ticks: { color: colors.text },
            title: { display: true, text: 'Range (km)', color: colors.text }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#f43f5e' },
            title: { display: true, text: 'Charge Time (mins)', color: '#f43f5e' }
          }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true } }
        }
      }
    });
  }

  // 10. Sarah: CO2 Abatement by Vehicle Category
  function renderSarahCO2Savings(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const catMap = {};
    data.forEach(r => {
      catMap[r.Vehicle_Category] = (catMap[r.Vehicle_Category] || 0) + Number(r.CO2_Offset_Tons_Annual);
    });

    const labels = Object.keys(catMap);
    const values = labels.map(k => Math.round(catMap[k]));

    instances[canvasId] = new Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartPalette.slice(0, labels.length).map(c => c + 'aa'),
          borderColor: '#111726',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: colors.text, usePointStyle: true } }
        },
        scales: {
          r: { grid: { color: colors.grid }, ticks: { display: false } }
        }
      }
    });
  }

  return {
    renderSalesByCategory,
    renderMarketShare,
    renderTechAdoption,
    renderGeoDistribution,
    renderEmilyCategoryAnalysis,
    renderEmilyRatingVsPrice,
    renderDavidTechDistribution,
    renderDavidPricePerKm,
    renderSarahBatteryComparison,
    renderSarahCO2Savings,
    destroyChart
  };
})();

window.EVCharts = EVCharts;
