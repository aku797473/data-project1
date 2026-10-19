/**
 * VOLTIX™ EV Intelligence Platform - Main Application Controller
 * Orchestrates filtering, state, tabs, table pagination & modal workflows
 */

(function () {
  'use strict';

  // Global State
  const state = {
    rawData: [],
    filteredData: [],
    activeTab: 'tab-overview',
    currentPage: 1,
    pageSize: 15,
    sortCol: 'Units_Sold_Annual',
    sortAsc: false,
    filters: {
      year: 'ALL',
      manufacturer: 'ALL',
      category: 'ALL',
      batteryTech: 'ALL',
      search: ''
    }
  };

  // DOM Elements cache
  const el = {};

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    cacheDom();
    bindEvents();
    loadDataset();
  }

  function cacheDom() {
    el.themeToggle = document.getElementById('theme-toggle');
    el.filterYear = document.getElementById('filter-year');
    el.filterMfg = document.getElementById('filter-mfg');
    el.filterCat = document.getElementById('filter-cat');
    el.filterTech = document.getElementById('filter-tech');
    el.filterSearch = document.getElementById('filter-search');
    el.btnResetFilters = document.getElementById('btn-reset-filters');
    el.btnExportCsv = document.getElementById('btn-export-csv');
    el.btnExportCsvTop = document.getElementById('btn-export-csv-top');

    // KPIs
    el.kpiTotalSales = document.getElementById('kpi-total-sales');
    el.kpiTotalRevenue = document.getElementById('kpi-total-revenue');
    el.kpiAvgRange = document.getElementById('kpi-avg-range');
    el.kpiAvgRating = document.getElementById('kpi-avg-rating');
    el.kpiTotalCo2 = document.getElementById('kpi-total-co2');
    el.kpiTotalModels = document.getElementById('kpi-total-models');

    // Tabs
    el.tabButtons = document.querySelectorAll('.nav-tab');
    el.tabPanes = document.querySelectorAll('.view-pane');

    // Table
    el.tableBody = document.getElementById('table-body');
    el.tablePaginationInfo = document.getElementById('table-pagination-info');
    el.btnPrevPage = document.getElementById('btn-prev-page');
    el.btnNextPage = document.getElementById('btn-next-page');

    // Methodology Modal
    el.btnOpenMethodology = document.getElementById('btn-open-methodology');
    el.btnOpenModalTop = document.getElementById('btn-open-modal-top');
    el.modalMethodology = document.getElementById('modal-methodology');
    el.btnCloseMethodology = document.getElementById('btn-close-methodology');
  }

  function bindEvents() {
    // Theme Switcher
    if (el.themeToggle) {
      el.themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        el.themeToggle.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('voltix_ev_theme', isLight ? 'light' : 'dark');
        triggerRenderActiveTabCharts();
      });

      // Restore saved theme
      if (localStorage.getItem('voltix_ev_theme') === 'light') {
        document.body.classList.add('light-theme');
        el.themeToggle.textContent = '🌙';
      }
    }

    // Tab Switching
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        const isHeaderNav = btn.classList.contains('header-nav-link');
        switchTab(targetTab, isHeaderNav);
      });
    });

    // Filter controls
    [el.filterYear, el.filterMfg, el.filterCat, el.filterTech].forEach(select => {
      if (select) {
        select.addEventListener('change', applyFilters);
      }
    });

    if (el.filterSearch) {
      el.filterSearch.addEventListener('input', debounce(applyFilters, 250));
    }

    if (el.btnResetFilters) {
      el.btnResetFilters.addEventListener('click', resetFilters);
    }

    if (el.btnExportCsv) {
      el.btnExportCsv.addEventListener('click', exportFilteredCsv);
    }

    if (el.btnExportCsvTop) {
      el.btnExportCsvTop.addEventListener('click', exportFilteredCsv);
    }

    // Pagination
    if (el.btnPrevPage) {
      el.btnPrevPage.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderTable();
        }
      });
    }

    if (el.btnNextPage) {
      el.btnNextPage.addEventListener('click', () => {
        const maxPages = Math.ceil(state.filteredData.length / state.pageSize);
        if (state.currentPage < maxPages) {
          state.currentPage++;
          renderTable();
        }
      });
    }

    // Methodology Modal Events
    if (el.btnOpenMethodology) {
      el.btnOpenMethodology.addEventListener('click', openMethodologyModal);
    }
    if (el.btnOpenModalTop) {
      el.btnOpenModalTop.addEventListener('click', openMethodologyModal);
    }
    if (el.btnCloseMethodology) {
      el.btnCloseMethodology.addEventListener('click', closeMethodologyModal);
    }
    if (el.modalMethodology) {
      el.modalMethodology.addEventListener('click', e => {
        if (e.target === el.modalMethodology) closeMethodologyModal();
      });
    }

    // Table sorting
    document.querySelectorAll('.styled-table th[data-sort]').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.sortCol === col) {
          state.sortAsc = !state.sortAsc;
        } else {
          state.sortCol = col;
          state.sortAsc = false;
        }
        sortAndRenderTable();
      });
    });

    // Continuous responsive chart re-rendering on window resize / orientation change
    window.addEventListener('resize', debounce(() => {
      triggerRenderActiveTabCharts();
    }, 200));
  }

  function loadDataset() {
    if (window.EV_RAW_DATA && Array.isArray(window.EV_RAW_DATA)) {
      state.rawData = window.EV_RAW_DATA;
      populateFilterOptions();
      applyFilters();
    } else {
      // Fallback fetch if running on HTTP server
      fetch('data/ev_market_data.csv')
        .then(res => res.text())
        .then(csv => {
          state.rawData = parseCsv(csv);
          populateFilterOptions();
          applyFilters();
        })
        .catch(err => {
          console.error("Could not load CSV data", err);
        });
    }
  }

  function populateFilterOptions() {
    const years = [...new Set(state.rawData.map(r => r.Year))].sort((a, b) => b - a);
    const mfgs = [...new Set(state.rawData.map(r => r.Manufacturer))].sort();
    const cats = [...new Set(state.rawData.map(r => r.Vehicle_Category))].sort();
    const techs = [...new Set(state.rawData.map(r => r.Battery_Technology))].sort();

    populateSelect(el.filterYear, years);
    populateSelect(el.filterMfg, mfgs);
    populateSelect(el.filterCat, cats);
    populateSelect(el.filterTech, techs);
  }

  function populateSelect(selectEl, items) {
    if (!selectEl) return;
    const currentVal = selectEl.value;
    selectEl.innerHTML = '<option value="ALL">All Options</option>';
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      selectEl.appendChild(opt);
    });
    selectEl.value = currentVal || 'ALL';
  }

  function applyFilters() {
    state.filters.year = el.filterYear ? el.filterYear.value : 'ALL';
    state.filters.manufacturer = el.filterMfg ? el.filterMfg.value : 'ALL';
    state.filters.category = el.filterCat ? el.filterCat.value : 'ALL';
    state.filters.batteryTech = el.filterTech ? el.filterTech.value : 'ALL';
    state.filters.search = el.filterSearch ? el.filterSearch.value.trim().toLowerCase() : '';

    state.filteredData = state.rawData.filter(row => {
      if (state.filters.year !== 'ALL' && String(row.Year) !== state.filters.year) return false;
      if (state.filters.manufacturer !== 'ALL' && row.Manufacturer !== state.filters.manufacturer) return false;
      if (state.filters.category !== 'ALL' && row.Vehicle_Category !== state.filters.category) return false;
      if (state.filters.batteryTech !== 'ALL' && row.Battery_Technology !== state.filters.batteryTech) return false;

      if (state.filters.search) {
        const query = state.filters.search;
        const matches = (
          row.Manufacturer.toLowerCase().includes(query) ||
          row.Model_Name.toLowerCase().includes(query) ||
          row.Vehicle_Category.toLowerCase().includes(query) ||
          row.Manufacturing_Country.toLowerCase().includes(query) ||
          row.Battery_Technology.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }
      return true;
    });

    state.currentPage = 1;
    updateKpis();
    sortAndRenderTable();
    triggerRenderActiveTabCharts();
    updateScenarioInsights();
  }

  function resetFilters() {
    if (el.filterYear) el.filterYear.value = 'ALL';
    if (el.filterMfg) el.filterMfg.value = 'ALL';
    if (el.filterCat) el.filterCat.value = 'ALL';
    if (el.filterTech) el.filterTech.value = 'ALL';
    if (el.filterSearch) el.filterSearch.value = '';
    applyFilters();
  }

  function updateKpis() {
    const data = state.filteredData;
    const totalSales = data.reduce((acc, r) => acc + Number(r.Units_Sold_Annual || 0), 0);
    const totalRevenue = data.reduce((acc, r) => acc + Number(r.Annual_Revenue_USD || 0), 0);
    const avgRange = data.length ? (data.reduce((acc, r) => acc + Number(r.Driving_Range_km || 0), 0) / data.length).toFixed(0) : 0;
    const avgRating = data.length ? (data.reduce((acc, r) => acc + Number(r.Customer_Rating || 0), 0) / data.length).toFixed(2) : '0.00';
    const totalCo2 = data.reduce((acc, r) => acc + Number(r.CO2_Offset_Tons_Annual || 0), 0);

    if (el.kpiTotalSales) el.kpiTotalSales.textContent = formatNumber(totalSales) + ' Units';
    if (el.kpiTotalRevenue) el.kpiTotalRevenue.textContent = '$' + (totalRevenue >= 1e9 ? (totalRevenue / 1e9).toFixed(1) + 'B' : (totalRevenue / 1e6).toFixed(1) + 'M');
    if (el.kpiAvgRange) el.kpiAvgRange.textContent = `${avgRange} km`;
    if (el.kpiAvgRating) el.kpiAvgRating.textContent = `${avgRating} ★`;
    if (el.kpiTotalCo2) el.kpiTotalCo2.textContent = Math.round(totalCo2).toLocaleString() + ' Tons';
    if (el.kpiTotalModels) el.kpiTotalModels.textContent = data.length.toLocaleString() + ' Models';
  }

  function switchTab(tabId, shouldScroll = false) {
    state.activeTab = tabId;

    el.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    el.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    if (shouldScroll) {
      const pane = document.getElementById(tabId);
      if (pane) {
        pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Re-render charts for newly active tab
    setTimeout(() => {
      triggerRenderActiveTabCharts();
    }, 50);
  }

  function triggerRenderActiveTabCharts() {
    const data = state.filteredData;
    if (!window.EVCharts) return;

    if (state.activeTab === 'tab-overview') {
      window.EVCharts.renderSalesByCategory('chartSalesByCategory', data);
      window.EVCharts.renderMarketShare('chartMarketShare', data);
      window.EVCharts.renderTechAdoption('chartTechAdoption', data);
      window.EVCharts.renderGeoDistribution('chartGeoDistribution', data);
    } else if (state.activeTab === 'tab-emily') {
      window.EVCharts.renderEmilyCategoryAnalysis('chartEmilyCategoryAnalysis', data);
      window.EVCharts.renderEmilyRatingVsPrice('chartEmilyRatingVsPrice', data);
    } else if (state.activeTab === 'tab-david') {
      window.EVCharts.renderDavidTechDistribution('chartDavidTechDistribution', data);
      window.EVCharts.renderDavidPricePerKm('chartDavidPricePerKm', data);
    } else if (state.activeTab === 'tab-sarah') {
      window.EVCharts.renderSarahBatteryComparison('chartSarahBatteryComparison', data);
      window.EVCharts.renderSarahCO2Savings('chartSarahCO2Savings', data);
    }
  }

  function updateScenarioInsights() {
    if (!window.EVScenarios) return;
    const data = state.filteredData;

    // Emily
    const emily = window.EVScenarios.getEmilyInsights(data);
    const emilyElem = document.getElementById('emily-summary-text');
    if (emilyElem) emilyElem.textContent = emily.executiveSummary;

    // David
    const david = window.EVScenarios.getDavidInsights(data);
    const davidElem = document.getElementById('david-summary-text');
    if (davidElem) davidElem.textContent = david.executiveSummary;

    // Sarah
    const sarah = window.EVScenarios.getSarahInsights(data);
    const sarahElem = document.getElementById('sarah-summary-text');
    if (sarahElem) sarahElem.textContent = sarah.executiveSummary;
  }

  function sortAndRenderTable() {
    state.filteredData.sort((a, b) => {
      let valA = a[state.sortCol];
      let valB = b[state.sortCol];

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return state.sortAsc ? -1 : 1;
      if (valA > valB) return state.sortAsc ? 1 : -1;
      return 0;
    });

    renderTable();
  }

  function renderTable() {
    if (!el.tableBody) return;

    const data = state.filteredData;
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const pageItems = data.slice(startIndex, startIndex + state.pageSize);

    if (pageItems.length === 0) {
      el.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: var(--text-muted);">No vehicle models match the selected filter criteria.</td></tr>`;
      if (el.tablePaginationInfo) el.tablePaginationInfo.textContent = 'Showing 0 to 0 of 0 models';
      return;
    }

    let rowsHtml = '';
    pageItems.forEach(r => {
      const chemBadgeClass = getChemBadgeClass(r.Battery_Technology);
      rowsHtml += `
        <tr>
          <td><strong style="color: var(--accent-cyan); font-family: 'Space Grotesk', monospace;">${r.Vehicle_ID}</strong></td>
          <td>${r.Year}</td>
          <td><strong>${r.Manufacturer}</strong></td>
          <td>${r.Model_Name}</td>
          <td><span class="scenario-chip">${r.Vehicle_Category}</span></td>
          <td><span class="badge-chem ${chemBadgeClass}">${r.Battery_Technology}</span></td>
          <td>${r.Battery_Capacity_kWh} kWh</td>
          <td><strong>${r.Driving_Range_km} km</strong></td>
          <td>$${Number(r.Base_Price_USD).toLocaleString()}</td>
          <td><span style="color: #f59e0b; font-weight: 600;">★ ${Number(r.Customer_Rating).toFixed(2)}</span></td>
        </tr>
      `;
    });

    el.tableBody.innerHTML = rowsHtml;

    if (el.tablePaginationInfo) {
      const end = Math.min(startIndex + state.pageSize, data.length);
      el.tablePaginationInfo.textContent = `Showing ${startIndex + 1} to ${end} of ${data.length} models`;
    }
  }

  function getChemBadgeClass(tech) {
    switch (tech) {
      case 'LFP': return 'badge-lfp';
      case 'NMC': return 'badge-nmc';
      case 'NCA': return 'badge-nca';
      case 'Solid-State': return 'badge-solid';
      case 'Sodium-Ion': return 'badge-sodium';
      default: return 'badge-nmc';
    }
  }

  function exportFilteredCsv() {
    if (!state.filteredData.length) return alert('No data to export.');
    const headers = Object.keys(state.filteredData[0]);
    const csvRows = [headers.join(',')];

    state.filteredData.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `voltix_ev_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openMethodologyModal() {
    if (el.modalMethodology) el.modalMethodology.classList.add('active');
  }

  function closeMethodologyModal() {
    if (el.modalMethodology) el.modalMethodology.classList.remove('active');
  }

  function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function parseCsv(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (parts.length === headers.length) {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = parts[idx];
        });
        rows.push(obj);
      }
    }
    return rows;
  }
})();
