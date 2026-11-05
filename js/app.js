(() => {
  "use strict";
  const state = { fileName: "", rows: [], columns: [], numericColumns: [], missing: {}, page: 1, pageSize: 8, search: "", chart: null };
  const $ = (id) => document.getElementById(id);
  const els = {
    uploadView: $("upload-view"), dashboardView: $("dashboard-view"), dropZone: $("drop-zone"), fileInput: $("file-input"),
    uploadError: $("upload-error"), dashboardError: $("dashboard-error"), sampleButton: $("sample-button"), resetButton: $("reset-button"),
    fileTitle: $("file-title"), fileMeta: $("file-meta"), statCards: $("stat-cards"), chartType: $("chart-type"),
    xColumn: $("x-column"), yColumn: $("y-column"), chart: $("data-chart"), chartEmpty: $("chart-empty"),
    qualityScore: $("quality-score"), missingSummary: $("missing-summary"), qualityBar: $("quality-bar-fill"), qualityCaption: $("quality-caption"),
    search: $("search-input"), tableHead: $("table-head"), tableBody: $("table-body"), tableEmpty: $("table-empty"),
    tableCount: $("table-count"), pageIndicator: $("page-indicator"), prevPage: $("prev-page"), nextPage: $("next-page"),
    numericStats: $("numeric-stats"), exportCsv: $("export-csv"), downloadSummary: $("download-summary")
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const isEmpty = (value) => value === null || value === undefined || String(value).trim() === "";
  const numberValue = (value) => typeof value === "number" ? value : Number(String(value).replace(/\s/g, "").replace(",", "."));
  const formatNumber = (value) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value);
  const showError = (element, message) => { element.textContent = message; element.hidden = false; };
  const hideError = (element) => { element.hidden = true; };

  function loadFile(file) {
    hideError(els.uploadError);
    if (!file || (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv")) {
      showError(els.uploadError, "Selecciona un archivo CSV válido. Otros formatos no son compatibles.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError(els.uploadError, "El archivo supera el límite de 25 MB. Prueba con un archivo más pequeño.");
      return;
    }
    Papa.parse(file, { header: true, skipEmptyLines: "greedy", dynamicTyping: false, complete: (result) => processData(result, file.name), error: () => showError(els.uploadError, "No se pudo leer el archivo. Verifica que sea un CSV válido.") });
  }

  function processData(result, fileName) {
    if (result.errors?.length && result.data.length === 0) { showError(els.uploadError, "El CSV no contiene registros legibles."); return; }
    const rows = result.data.filter((row) => row && Object.values(row).some((value) => !isEmpty(value)));
    const columns = result.meta.fields?.filter(Boolean) || [];
    if (!columns.length || !rows.length) { showError(els.uploadError, "El CSV debe tener encabezados y al menos un registro."); return; }
    if (result.errors?.some((error) => error.type === "Delimiter")) { showError(els.uploadError, "No se pudo detectar el separador del CSV. Usa comas, punto y coma o tabulaciones."); return; }
    state.fileName = fileName; state.rows = rows; state.columns = columns; state.page = 1; state.search = "";
    state.numericColumns = columns.filter((column) => {
      const values = rows.map((row) => row[column]).filter((value) => !isEmpty(value));
      return values.length > 0 && values.every((value) => Number.isFinite(numberValue(value)));
    });
    state.missing = Object.fromEntries(columns.map((column) => [column, rows.filter((row) => isEmpty(row[column])).length]));
    renderDashboard();
  }

  function renderDashboard() {
    els.uploadView.hidden = true; els.dashboardView.hidden = false; hideError(els.dashboardError);
    els.fileTitle.textContent = state.fileName.replace(/\.csv$/i, "") || "Tu dashboard";
    els.fileMeta.textContent = `${state.rows.length.toLocaleString("es-ES")} registros · ${state.columns.length} columnas · procesado localmente`;
    renderCards(); renderMissing(); renderTable(); renderNumericStats(); configureChartControls(); updateChart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCards() {
    const missingTotal = Object.values(state.missing).reduce((sum, value) => sum + value, 0);
    const cards = [
      ["Registros", formatNumber(state.rows.length), "▤", "#5c8dff"],
      ["Columnas", formatNumber(state.columns.length), "⌗", "#a56bff"],
      ["Datos vacíos", formatNumber(missingTotal), "◌", "#ffae6b"],
      ["Numéricas", formatNumber(state.numericColumns.length), "∿", "#5ee7d1"]
    ];
    els.statCards.innerHTML = cards.map(([label, value, symbol, accent]) => `<article class="stat-card" style="--accent:${accent}"><span class="stat-label">${label}</span><span class="stat-symbol">${symbol}</span><div class="stat-value">${value}</div></article>`).join("");
  }

  function renderMissing() {
    const totalCells = state.rows.length * state.columns.length;
    const missingTotal = Object.values(state.missing).reduce((sum, value) => sum + value, 0);
    const quality = totalCells ? Math.round((1 - missingTotal / totalCells) * 100) : 100;
    els.qualityScore.textContent = `${quality}%`; els.qualityBar.style.width = `${quality}%`;
    els.qualityCaption.textContent = missingTotal ? `${formatNumber(missingTotal)} celdas vacías detectadas` : "Dataset completo, sin valores vacíos";
    els.missingSummary.innerHTML = state.columns.map((column) => {
      const count = state.missing[column]; const percent = state.rows.length ? Math.round(count / state.rows.length * 100) : 0;
      return `<div class="missing-row"><span class="missing-name" title="${escapeHtml(column)}">${escapeHtml(column)}</span><span class="missing-track"><span class="missing-fill" style="width:${percent}%"></span></span><span class="missing-number">${count} · ${percent}%</span></div>`;
    }).join("");
  }

  function filteredRows() {
    const query = state.search.toLowerCase().trim();
    return query ? state.rows.filter((row) => state.columns.some((column) => String(row[column] ?? "").toLowerCase().includes(query))) : state.rows;
  }

  function renderTable() {
    els.tableHead.innerHTML = `<tr>${state.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>`;
    const rows = filteredRows(); const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page, pages); const pageRows = rows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    els.tableBody.innerHTML = pageRows.map((row) => `<tr>${state.columns.map((column) => `<td title="${escapeHtml(row[column])}">${isEmpty(row[column]) ? '<span class="muted">—</span>' : escapeHtml(row[column])}</td>`).join("")}</tr>`).join("");
    els.tableEmpty.hidden = pageRows.length > 0; els.tableCount.textContent = `${formatNumber(rows.length)} ${rows.length === 1 ? "registro" : "registros"}`;
    els.pageIndicator.textContent = `${state.page} / ${pages}`; els.prevPage.disabled = state.page <= 1; els.nextPage.disabled = state.page >= pages;
  }

  function renderNumericStats() {
    els.numericStats.innerHTML = state.numericColumns.length ? state.numericColumns.map((column) => {
      const values = state.rows.map((row) => numberValue(row[column])).filter(Number.isFinite);
      const sum = values.reduce((a, b) => a + b, 0);
      return `<tr><td>${escapeHtml(column)}</td><td>${formatNumber(values.length)}</td><td>${formatNumber(Math.min(...values))}</td><td>${formatNumber(Math.max(...values))}</td><td>${formatNumber(sum / values.length)}</td><td>${formatNumber(sum)}</td></tr>`;
    }).join("") : `<tr><td colspan="6" class="empty-table">No se detectaron columnas numéricas en este archivo.</td></tr>`;
  }

  function configureChartControls() {
    const options = state.columns.map((column) => `<option value="${escapeHtml(column)}">${escapeHtml(column)}</option>`).join("");
    els.xColumn.innerHTML = options; els.yColumn.innerHTML = state.numericColumns.map((column) => `<option value="${escapeHtml(column)}">${escapeHtml(column)}</option>`).join("");
    if (!state.numericColumns.length) { els.chartEmpty.hidden = false; els.chart.hidden = true; } else { els.chartEmpty.hidden = true; els.chart.hidden = false; }
    els.xColumn.value = state.columns.find((column) => !state.numericColumns.includes(column)) || state.columns[0];
  }

  function updateChart() {
    if (!state.numericColumns.length || !window.Chart) return;
    const x = els.xColumn.value; const y = els.yColumn.value; const type = els.chartType.value;
    const source = state.rows.slice(0, 30); const labels = source.map((row, index) => isEmpty(row[x]) ? `Fila ${index + 1}` : String(row[x]).slice(0, 24));
    const values = source.map((row) => numberValue(row[y])).map((value) => Number.isFinite(value) ? value : 0);
    if (state.chart) state.chart.destroy();
    const colors = ["#6b8cff", "#9d6bff", "#5ee7d1", "#ffae6b", "#ff718d", "#55b8ff"];
    state.chart = new Chart(els.chart, { type, data: { labels, datasets: [{ label: y, data: values, borderColor: "#8d7aff", backgroundColor: type === "line" ? "rgba(141,122,255,.16)" : colors, borderWidth: 2, borderRadius: type === "bar" ? 5 : 0, fill: type === "line", tension: .35, pointBackgroundColor: "#bcaeff", pointRadius: type === "line" ? 3 : 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type !== "bar" && type !== "line", labels: { color: "#b4bedb", padding: 14, font: { family: "DM Sans" } } } }, scales: type === "pie" || type === "doughnut" ? {} : { x: { grid: { color: "rgba(255,255,255,.05)" }, ticks: { color: "#7f8aa9", maxRotation: 45, font: { size: 10 } } }, y: { grid: { color: "rgba(255,255,255,.05)" }, ticks: { color: "#7f8aa9", font: { size: 10 } }, beginAtZero: true } } } });
  }

  function exportCsv() {
    const csv = Papa.unparse(state.rows, { columns: state.columns });
    downloadBlob(csv, `${state.fileName.replace(/\.csv$/i, "") || "datapulse"}_processed.csv`, "text/csv;charset=utf-8;");
  }
  function downloadSummary() {
    const missingTotal = Object.values(state.missing).reduce((sum, value) => sum + value, 0);
    const lines = ["DATAPULSE — RESUMEN DEL ANÁLISIS", `Archivo: ${state.fileName}`, `Generado: ${new Date().toLocaleString("es-ES")}`, "", "RESUMEN", `Registros: ${state.rows.length}`, `Columnas: ${state.columns.length}`, `Datos vacíos: ${missingTotal}`, `Columnas numéricas: ${state.numericColumns.length}`, "", "VALORES VACÍOS POR COLUMNA", ...state.columns.map((column) => `${column}: ${state.missing[column]}`), "", "ESTADÍSTICAS NUMÉRICAS"];
    state.numericColumns.forEach((column) => { const values = state.rows.map((row) => numberValue(row[column])).filter(Number.isFinite); const sum = values.reduce((a, b) => a + b, 0); lines.push(`${column}: mínimo ${Math.min(...values)}, máximo ${Math.max(...values)}, promedio ${(sum / values.length).toFixed(2)}, suma ${sum}`); });
    downloadBlob(lines.join("\n"), `${state.fileName.replace(/\.csv$/i, "") || "datapulse"}_summary.txt`, "text/plain;charset=utf-8;");
  }
  function downloadBlob(content, name, type) { const blob = new Blob([content], { type }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = name; link.click(); URL.revokeObjectURL(link.href); }
  function reset() { if (state.chart) state.chart.destroy(); state.rows = []; state.columns = []; els.fileInput.value = ""; els.dashboardView.hidden = true; els.uploadView.hidden = false; hideError(els.uploadError); }

  els.dropZone.addEventListener("click", () => els.fileInput.click()); els.dropZone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") els.fileInput.click(); });
  els.fileInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
  ["dragenter", "dragover"].forEach((eventName) => els.dropZone.addEventListener(eventName, (event) => { event.preventDefault(); els.dropZone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => els.dropZone.addEventListener(eventName, (event) => { event.preventDefault(); els.dropZone.classList.remove("dragging"); }));
  els.dropZone.addEventListener("drop", (event) => loadFile(event.dataTransfer.files[0]));
  els.sampleButton.addEventListener("click", async () => { try { const response = await fetch("examples/sales_sample.csv"); processData(Papa.parse(await response.text(), { header: true, skipEmptyLines: "greedy" }), "sales_sample.csv"); } catch { showError(els.uploadError, "No se pudo cargar el dataset de ejemplo."); } });
  els.resetButton.addEventListener("click", reset); els.exportCsv.addEventListener("click", exportCsv); els.downloadSummary.addEventListener("click", downloadSummary);
  els.search.addEventListener("input", (event) => { state.search = event.target.value; state.page = 1; renderTable(); });
  els.prevPage.addEventListener("click", () => { state.page--; renderTable(); }); els.nextPage.addEventListener("click", () => { state.page++; renderTable(); });
  [els.chartType, els.xColumn, els.yColumn].forEach((element) => element.addEventListener("change", updateChart));
})();
