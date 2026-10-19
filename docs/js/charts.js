/**
 * VOLTIX™ Analytics - Enterprise Chart Engine
 * Professional B2B SaaS Color System (Stripe / Tableau / Retool Standard)
 */

const EVCharts = (function () {
  // Corporate Professional Color Tokens
  const colors = {
    indigo: '#6366f1',
    sky: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    teal: '#14b8a6',
    slate: '#64748b',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94a3b8'
  };

  // Enterprise Curated Palette
  const chartPalette = [
    '#6366f1', /* Royal Indigo */
    '#0ea5e9', /* Sky Blue */
    '#10b981', /* Clean Emerald */
    '#f59e0b', /* Soft Amber */
    '#8b5cf6', /* Violet */
    '#f43f5e', /* Coral Rose */
    '#14b8a6', /* Teal */
    '#38bdf8', /* Light Blue */
    '#a855f7', /* Purple */
    '#eab308', /* Warm Gold */
    '#ec4899', /* Pink */
    '#64748b'  /* Neutral Slate */
  ];

  // Active chart instances cache
  const instances = {};

  function destroyChart(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function getBaseOptions() {
    const isMobile = window.innerWidth < 768;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: colors.text,
            font: { family: 'Inter', size: isMobile ? 10 : 11, weight: '500' },
            usePointStyle: true,
            boxWidth: 7,
            padding: isMobile ? 8 : 12
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
          bodyFont: { family: 'Inter', size: 11 },
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.text,
            font: { family: 'Inter', size: isMobile ? 9 : 11 },
            maxRotation: isMobile ? 45 : 0
          }
        },
        y: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.text,
            font: { family: 'Inter', size: isMobile ? 9 : 11 }
          }
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
          backgroundColor: '#6366f1cc',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 4
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

    const sorted = Object.entries(mfgMap).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const otherUnits = sorted.slice(6).reduce((acc, curr) => acc + curr[1], 0);

    const labels = top.map(x => x[0]);
    const values = top.map(x => x[1]);
    if (otherUnits > 0) {
      labels.push('Others');
      values.push(otherUnits);
    }

    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartPalette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#0e1424'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: isMobile ? 'bottom' : 'right',
            labels: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 10 : 11 },
              usePointStyle: true,
              boxWidth: 7,
              padding: isMobile ? 6 : 10
            }
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
        cutout: isMobile ? '60%' : '66%'
      }
    });
  }

  // 3. Overview: Battery Chemistry Adoption Timeline (2021–2026)
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
        backgroundColor: chartPalette[idx % chartPalette.length] + '18',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 2.5
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
          backgroundColor: '#0ea5e9cc',
          borderColor: '#0ea5e9',
          borderWidth: 1,
          borderRadius: 4
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
    const units = labels.map(k => catMap[k].units / 1e6);
    const revenue = labels.map(k => catMap[k].revenue / 1e9);

    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sales (M Units)',
            data: units,
            backgroundColor: '#6366f1cc',
            borderColor: '#6366f1',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Gross Rev ($B)',
            data: revenue,
            backgroundColor: '#10b981cc',
            borderColor: '#10b981',
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 9 : 11 },
              maxRotation: isMobile ? 45 : 0
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 }, callback: v => v + 'M' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#10b981', font: { family: 'Inter', size: isMobile ? 9 : 11 }, callback: v => '$' + v + 'B' }
          }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true, font: { family: 'Inter', size: isMobile ? 10 : 11 } } }
        }
      }
    });
  }

  // 6. Emily: Customer Rating vs Base Price Scatter
  function renderEmilyRatingVsPrice(canvasId, data) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const sampled = data.slice(0, 140).map(r => ({
      x: Number(r.Base_Price_USD),
      y: Number(r.Customer_Rating),
      label: `${r.Manufacturer} ${r.Model_Name} (${r.Vehicle_Category})`
    }));

    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Vehicle Model Rating',
          data: sampled,
          backgroundColor: '#8b5cf6aa',
          borderColor: '#8b5cf6',
          pointRadius: isMobile ? 3.5 : 4.5,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 9 : 11 },
              callback: v => '$' + (v / 1e3) + 'k'
            },
            title: { display: !isMobile, text: 'Base Price (USD)', color: colors.text }
          },
          y: {
            min: 3.0,
            max: 5.0,
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 }, stepSize: 0.5 },
            title: { display: !isMobile, text: 'Customer Rating (1 - 5 Stars)', color: colors.text }
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

    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: { labels: topMfgs, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 9 : 11 },
              maxRotation: isMobile ? 45 : 0
            }
          },
          y: {
            stacked: true,
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 } }
          }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true, font: { family: 'Inter', size: isMobile ? 10 : 11 } } }
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
          borderWidth: 1,
          borderRadius: 4
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

    techs.forEach(t => {
      const subset = data.filter(r => r.Battery_Technology === t);
      if (subset.length > 0) {
        const avgRange = subset.reduce((acc, r) => acc + Number(r.Driving_Range_km), 0) / subset.length;
        const avgTime = subset.reduce((acc, r) => acc + Number(r.Fast_Charge_Time_min), 0) / subset.length;
        rangeData.push(Math.round(avgRange));
        chargeTimeData.push(Math.round(avgTime));
      } else {
        rangeData.push(0);
        chargeTimeData.push(0);
      }
    });

    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: techs,
        datasets: [
          {
            label: 'Avg Range (km)',
            data: rangeData,
            backgroundColor: '#6366f1cc',
            borderColor: '#6366f1',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Charge Time 10-80% (min)',
            data: chargeTimeData,
            backgroundColor: '#f43f5ecc',
            borderColor: '#f43f5e',
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 9 : 11 },
              maxRotation: isMobile ? 45 : 0
            }
          },
          y: {
            position: 'left',
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 } }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#f43f5e', font: { family: 'Inter', size: isMobile ? 9 : 11 } }
          }
        },
        plugins: {
          legend: { labels: { color: colors.text, usePointStyle: true, font: { family: 'Inter', size: isMobile ? 10 : 11 } } }
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
    const isMobile = window.innerWidth < 768;

    instances[canvasId] = new Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartPalette.slice(0, labels.length).map(c => c + 'aa'),
          borderColor: '#0e1424',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: isMobile ? 'bottom' : 'right',
            labels: {
              color: colors.text,
              font: { family: 'Inter', size: isMobile ? 10 : 11 },
              usePointStyle: true,
              boxWidth: 7
            }
          }
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
