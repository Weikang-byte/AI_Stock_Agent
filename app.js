const FALLBACK_REPORT = {
  generated_at: "2026-05-15T07:40:00+08:00",
  report_date: "2026-05-14",
  data_source: "示例数据",
  selection_rule: {
    min_pct_change: 5,
    min_amount: 50000000,
    exclude_st: true
  },
  summary: {
    total_count: 5520,
    valid_count: 5486,
    advancers: 3218,
    decliners: 1987,
    unchanged: 281,
    advance_ratio: 58.66,
    mean_pct: 0.74,
    median_pct: 0.41,
    top_decile_pct: 4.26,
    selected_count: 162,
    limit_up_count: 36,
    strong_close_count: 113,
    selected_amount: 184760000000,
    median_turnover_rate: 8.42,
    avg_selected_pct: 8.72
  },
  insights: [
    { label: "强势扩散", value: "162", text: "强势样本占全市场 2.95%，上涨家数多于下跌家数，短线情绪偏活跃。" },
    { label: "资金承载", value: "1848亿", text: "强势样本成交额集中在前排股票，适合继续观察成交额是否持续放大。" },
    { label: "收盘质量", value: "69.8%", text: "强势股中多数收在日内区间上沿，说明尾盘承接相对健康。" },
    { label: "市场结构", value: "创业板", text: "创业板和沪市主板强势样本靠前，风格偏成长与大盘并行。" }
  ],
  charts: {
    pct_change_histogram: [
      { label: "<-7%", count: 64 }, { label: "-7~-5%", count: 92 }, { label: "-5~-3%", count: 240 },
      { label: "-3~-1%", count: 810 }, { label: "-1~0%", count: 781 }, { label: "0~1%", count: 1428 },
      { label: "1~3%", count: 1220 }, { label: "3~5%", count: 623 }, { label: "5~7%", count: 68 },
      { label: "7~10%", count: 58 }, { label: "10~20%", count: 35 }, { label: ">20%", count: 1 }
    ],
    board_leadership: [
      { board: "沪市主板", count: 48, avg_pct: 7.81, amount: 65030000000 },
      { board: "深市主板", count: 39, avg_pct: 8.13, amount: 41120000000 },
      { board: "创业板", count: 44, avg_pct: 9.22, amount: 53660000000 },
      { board: "科创板", count: 18, avg_pct: 8.88, amount: 17790000000 },
      { board: "北交所", count: 13, avg_pct: 12.36, amount: 7130000000 }
    ]
  },
  top_stocks: [
    { rank: 1, code: "300777", name: "中简科技", board: "创业板", price: 34.52, pct_change: 20.01, amount: 1948000000, turnover_rate: 13.1, pe_dynamic: 61.2, pb: 6.1, close_position: 0.98, limit_up: true },
    { rank: 2, code: "688099", name: "晶晨股份", board: "科创板", price: 88.43, pct_change: 18.66, amount: 3261000000, turnover_rate: 5.7, pe_dynamic: 48.3, pb: 5.8, close_position: 0.91, limit_up: false },
    { rank: 3, code: "301269", name: "华大九天", board: "创业板", price: 112.24, pct_change: 16.92, amount: 5122000000, turnover_rate: 10.4, pe_dynamic: 88.7, pb: 8.9, close_position: 0.84, limit_up: false },
    { rank: 4, code: "600536", name: "中国软件", board: "沪市主板", price: 49.88, pct_change: 10.02, amount: 4380000000, turnover_rate: 7.8, pe_dynamic: 72.1, pb: 6.6, close_position: 0.97, limit_up: true },
    { rank: 5, code: "002415", name: "海康威视", board: "深市主板", price: 39.36, pct_change: 9.99, amount: 6082000000, turnover_rate: 2.1, pe_dynamic: 22.5, pb: 3.9, close_position: 0.95, limit_up: true },
    { rank: 6, code: "832982", name: "锦波生物", board: "北交所", price: 168.9, pct_change: 9.48, amount: 742000000, turnover_rate: 6.9, pe_dynamic: 35.4, pb: 8.2, close_position: 0.8, limit_up: false },
    { rank: 7, code: "000977", name: "浪潮信息", board: "深市主板", price: 54.62, pct_change: 8.72, amount: 9483000000, turnover_rate: 11.8, pe_dynamic: 31.7, pb: 4.7, close_position: 0.88, limit_up: false },
    { rank: 8, code: "688041", name: "海光信息", board: "科创板", price: 122.78, pct_change: 8.14, amount: 7245000000, turnover_rate: 4.3, pe_dynamic: 91.5, pb: 12.1, close_position: 0.76, limit_up: false },
    { rank: 9, code: "300308", name: "中际旭创", board: "创业板", price: 191.62, pct_change: 7.85, amount: 11230000000, turnover_rate: 7.2, pe_dynamic: 44.8, pb: 9.7, close_position: 0.74, limit_up: false },
    { rank: 10, code: "601138", name: "工业富联", board: "沪市主板", price: 35.54, pct_change: 7.21, amount: 13240000000, turnover_rate: 1.9, pe_dynamic: 25.8, pb: 5.2, close_position: 0.71, limit_up: false }
  ]
};

const state = {
  report: FALLBACK_REPORT,
  board: "全部",
  minPct: 5,
  query: ""
};

const els = {
  dataStatus: document.querySelector("#dataStatus"),
  reportDate: document.querySelector("#reportDate"),
  metricTotal: document.querySelector("#metricTotal"),
  metricSource: document.querySelector("#metricSource"),
  metricAdvanceRatio: document.querySelector("#metricAdvanceRatio"),
  metricAdvancers: document.querySelector("#metricAdvancers"),
  metricStrong: document.querySelector("#metricStrong"),
  metricStrongRule: document.querySelector("#metricStrongRule"),
  metricLimitUp: document.querySelector("#metricLimitUp"),
  metricStrongClose: document.querySelector("#metricStrongClose"),
  metricAmount: document.querySelector("#metricAmount"),
  metricMedianTurnover: document.querySelector("#metricMedianTurnover"),
  insightList: document.querySelector("#insightList"),
  topChartHint: document.querySelector("#topChartHint"),
  scatterHint: document.querySelector("#scatterHint"),
  boardFilter: document.querySelector("#boardFilter"),
  pctFilter: document.querySelector("#pctFilter"),
  pctFilterValue: document.querySelector("#pctFilterValue"),
  searchInput: document.querySelector("#searchInput"),
  stockTable: document.querySelector("#stockTable"),
  refreshBtn: document.querySelector("#refreshBtn")
};

const chartIds = ["topMoversChart", "distributionChart", "boardChart", "liquidityChart"];
const BOARD_COLORS = {
  "沪市主板": "#3166c8",
  "深市主板": "#d44b4b",
  "创业板": "#178f91",
  "科创板": "#b36a05",
  "北交所": "#7b61b1",
  "其他": "#8291a6"
};

async function loadReport() {
  els.dataStatus.textContent = "加载日报中";
  try {
    const response = await fetch(`./data/report-latest.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.report = await response.json();
    els.dataStatus.textContent = (state.report.data_quality?.warnings || []).length ? "日报已更新（有降级）" : "日报已更新";
  } catch (error) {
    state.report = FALLBACK_REPORT;
    els.dataStatus.textContent = "使用示例日报";
  }
  state.minPct = Number(state.report.selection_rule?.min_pct_change ?? 5);
  els.pctFilter.value = String(state.minPct);
  render();
}

function render() {
  const report = state.report;
  const summary = report.summary || {};
  els.reportDate.textContent = `${report.report_date || "--"} 生成`;
  els.metricTotal.textContent = formatInteger(summary.valid_count ?? summary.total_count);
  els.metricSource.textContent = report.data_source || "--";
  els.metricAdvanceRatio.textContent = formatPercent(summary.advance_ratio);
  els.metricAdvancers.textContent = `${formatInteger(summary.advancers)} 上涨 / ${formatInteger(summary.decliners)} 下跌`;
  els.metricStrong.textContent = formatInteger(summary.selected_count);
  els.metricStrongRule.textContent = `涨幅 ≥ ${formatPercent(report.selection_rule?.min_pct_change)}，成交额 ≥ ${formatMoney(report.selection_rule?.min_amount)}`;
  els.metricLimitUp.textContent = formatInteger(summary.limit_up_count);
  els.metricStrongClose.textContent = `${formatInteger(summary.strong_close_count)} 只收盘靠近日内高位`;
  els.metricAmount.textContent = formatMoney(summary.selected_amount);
  els.metricMedianTurnover.textContent = `中位换手 ${formatPercent(summary.median_turnover_rate)}`;
  els.pctFilterValue.value = formatPercent(state.minPct);

  renderInsights(report.insights || []);
  renderBoardFilter(report);
  renderTable();
  renderCharts();
}

function renderInsights(insights) {
  els.insightList.innerHTML = "";
  const items = insights.length ? insights : FALLBACK_REPORT.insights;
  for (const item of items.slice(0, 4)) {
    const card = document.createElement("article");
    card.className = "insight-card";
    card.innerHTML = `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.text)}</p>`;
    els.insightList.appendChild(card);
  }
}

function renderBoardFilter(report) {
  const boards = ["全部", ...new Set((report.top_stocks || []).map((stock) => stock.board).filter(Boolean))];
  const currentOptions = [...els.boardFilter.options].map((option) => option.value).join("|");
  if (currentOptions === boards.join("|")) return;
  els.boardFilter.innerHTML = boards.map((board) => `<option value="${escapeHtml(board)}">${escapeHtml(board)}</option>`).join("");
  els.boardFilter.value = boards.includes(state.board) ? state.board : "全部";
}

function renderTable() {
  const stocks = getFilteredStocks();
  if (!stocks.length) {
    els.stockTable.innerHTML = `<tr><td class="empty-state" colspan="9">当前筛选条件下没有股票。</td></tr>`;
    return;
  }
  els.stockTable.innerHTML = stocks.slice(0, 120).map((stock, index) => {
    const link = eastMoneyUrl(stock.code);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="stock-name">
            <a href="${link}" target="_blank" rel="noreferrer">${escapeHtml(stock.name || "--")}</a>
            <span>${escapeHtml(stock.code || "--")}</span>
          </div>
        </td>
        <td>${escapeHtml(stock.board || "--")}</td>
        <td>${formatNumber(stock.price, 2)}</td>
        <td class="${stock.pct_change >= 0 ? "pct-up" : "pct-down"}">${formatPercent(stock.pct_change)}</td>
        <td>${formatMoney(stock.amount)}</td>
        <td>${formatPercent(stock.turnover_rate)}</td>
        <td>PE ${formatNumber(stock.pe_dynamic, 1)} / PB ${formatNumber(stock.pb, 1)}</td>
        <td><div class="tag-list">${renderTags(stock)}</div></td>
      </tr>
    `;
  }).join("");
}

function renderTags(stock) {
  const tags = [];
  if (stock.limit_up) tags.push(["涨停附近", "hot"]);
  if ((stock.amount || 0) >= 1000000000) tags.push(["高成交", "liquid"]);
  if ((stock.close_position || 0) >= 0.8) tags.push(["强收盘", "close"]);
  if ((stock.turnover_rate || 0) >= 10) tags.push(["高换手", ""]);
  if (!tags.length) tags.push(["观察", ""]);
  return tags.map(([label, cls]) => `<span class="tag ${cls}">${label}</span>`).join("");
}

function getFilteredStocks() {
  const query = state.query.trim().toLowerCase();
  return (state.report.top_stocks || [])
    .filter((stock) => state.board === "全部" || stock.board === state.board)
    .filter((stock) => Number(stock.pct_change || 0) >= state.minPct)
    .filter((stock) => !query || `${stock.code} ${stock.name}`.toLowerCase().includes(query))
    .sort((a, b) => Number(b.pct_change || 0) - Number(a.pct_change || 0));
}

function renderCharts() {
  const topStocks = getFilteredStocks().slice(0, 14);
  els.topChartHint.textContent = `${topStocks.length} 只`;
  els.scatterHint.textContent = `${getFilteredStocks().length} 只 · 成交额对数轴`;
  drawTopMovers(document.querySelector("#topMoversChart"), topStocks);
  drawHistogram(document.querySelector("#distributionChart"), state.report.charts?.pct_change_histogram || []);
  drawBoards(document.querySelector("#boardChart"), state.report.charts?.board_leadership || []);
  drawScatter(document.querySelector("#liquidityChart"), getFilteredStocks().slice(0, 140));
}

function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.lineWidth = 1;
  return { ctx, width: rect.width, height: rect.height };
}

function drawTopMovers(canvas, stocks) {
  const { ctx, width, height } = setupCanvas(canvas);
  if (!stocks.length) return drawEmpty(ctx, width, height);
  const pad = { top: 10, right: 36, bottom: 24, left: 92 };
  const max = Math.max(...stocks.map((stock) => Number(stock.pct_change || 0)), 1);
  const row = (height - pad.top - pad.bottom) / stocks.length;
  stocks.forEach((stock, index) => {
    const y = pad.top + index * row + row * 0.22;
    const barWidth = (width - pad.left - pad.right) * Number(stock.pct_change || 0) / max;
    ctx.fillStyle = "rgba(212, 75, 75, 0.14)";
    ctx.fillRect(pad.left, y, width - pad.left - pad.right, row * 0.56);
    ctx.fillStyle = index < 3 ? "#d44b4b" : "#e27a6f";
    ctx.fillRect(pad.left, y, barWidth, row * 0.56);
    ctx.fillStyle = "#152033";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(trimText(ctx, stock.name || stock.code, 78), pad.left - 10, y + row * 0.28);
    ctx.textAlign = "left";
    ctx.fillStyle = "#a92d37";
    ctx.fillText(formatPercent(stock.pct_change), pad.left + barWidth + 8, y + row * 0.28);
  });
}

function drawHistogram(canvas, bins) {
  const { ctx, width, height } = setupCanvas(canvas);
  if (!bins.length) return drawEmpty(ctx, width, height);
  const pad = { top: 14, right: 12, bottom: 46, left: 42 };
  const max = Math.max(...bins.map((bin) => bin.count), 1);
  const plotWidth = width - pad.left - pad.right;
  const barGap = 4;
  const barWidth = Math.max(8, (plotWidth - barGap * (bins.length - 1)) / bins.length);
  drawAxis(ctx, pad.left, pad.top, width - pad.right, height - pad.bottom);
  bins.forEach((bin, index) => {
    const x = pad.left + index * (barWidth + barGap);
    const barHeight = (height - pad.top - pad.bottom) * bin.count / max;
    const y = height - pad.bottom - barHeight;
    const label = String(bin.label);
    ctx.fillStyle = label.startsWith("-") || label.startsWith("<") ? "#178f91" : label.includes("0~") ? "#8291a6" : "#d44b4b";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.save();
    ctx.translate(x + barWidth / 2, height - pad.bottom + 8);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = "#617086";
    ctx.textAlign = "right";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

function drawBoards(canvas, boards) {
  const { ctx, width, height } = setupCanvas(canvas);
  if (!boards.length) return drawEmpty(ctx, width, height);
  const pad = { top: 18, right: 20, bottom: 52, left: 46 };
  const max = Math.max(...boards.map((board) => board.count), 1);
  const plotWidth = width - pad.left - pad.right;
  const barWidth = Math.max(18, plotWidth / boards.length * 0.58);
  drawAxis(ctx, pad.left, pad.top, width - pad.right, height - pad.bottom);
  boards.forEach((board, index) => {
    const center = pad.left + plotWidth * (index + 0.5) / boards.length;
    const barHeight = (height - pad.top - pad.bottom) * board.count / max;
    const x = center - barWidth / 2;
    const y = height - pad.bottom - barHeight;
    ctx.fillStyle = index % 2 === 0 ? "#3166c8" : "#d44b4b";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#152033";
    ctx.textAlign = "center";
    ctx.fillText(String(board.count), center, y - 8);
    ctx.fillStyle = "#617086";
    ctx.fillText(trimText(ctx, board.board, 62), center, height - pad.bottom + 18);
    ctx.fillText(formatPercent(board.avg_pct), center, height - pad.bottom + 35);
  });
}

function drawScatter(canvas, stocks) {
  const { ctx, width, height } = setupCanvas(canvas);
  const valid = stocks.filter((stock) => Number(stock.amount) > 0 && Number.isFinite(Number(stock.pct_change)));
  if (!valid.length) return drawEmpty(ctx, width, height);

  const compact = width < 760;
  const pad = compact
    ? { top: 34, right: 18, bottom: 52, left: 54 }
    : { top: 42, right: 34, bottom: 56, left: 68 };
  const plot = {
    left: pad.left,
    top: pad.top,
    right: width - pad.right,
    bottom: height - pad.bottom,
    width: width - pad.left - pad.right,
    height: height - pad.top - pad.bottom
  };

  const amounts = valid.map((stock) => Number(stock.amount));
  const pcts = valid.map((stock) => Number(stock.pct_change));
  const minAmount = Math.max(Math.min(...amounts), 1);
  const maxAmount = Math.max(...amounts, minAmount * 1.1);
  const xMin = Math.log10(minAmount * 0.82);
  const xMax = Math.log10(maxAmount * 1.16);
  const yMin = Math.max(0, Math.floor(Math.min(...pcts) / 5) * 5);
  const yCap = Math.max(10, Math.ceil(quantile(pcts, 0.94) / 5) * 5);
  const yMax = Math.max(yCap, yMin + 5);
  const clippedCount = pcts.filter((pct) => pct > yMax).length;

  drawPlotBackground(ctx, plot);
  const amountTicks = amountAxisTicks(minAmount, maxAmount);
  const pctTicks = pctAxisTicks(yMin, yMax);

  ctx.textBaseline = "middle";
  amountTicks.forEach((amount) => {
    const x = scaleLog(amount, xMin, xMax, plot.left, plot.right);
    drawVerticalGrid(ctx, x, plot.top, plot.bottom);
    ctx.fillStyle = "#617086";
    ctx.textAlign = "center";
    ctx.fillText(formatMoney(amount), x, plot.bottom + 20);
  });

  pctTicks.forEach((pct) => {
    const y = scaleLinear(pct, yMin, yMax, plot.bottom, plot.top);
    drawHorizontalGrid(ctx, plot.left, plot.right, y);
    ctx.fillStyle = "#617086";
    ctx.textAlign = "right";
    ctx.fillText(`${pct}%`, plot.left - 10, y);
  });

  ctx.strokeStyle = "#8ea0b7";
  ctx.lineWidth = 1;
  ctx.strokeRect(plot.left, plot.top, plot.width, plot.height);
  ctx.fillStyle = "#617086";
  ctx.textAlign = "left";
  ctx.fillText("成交额（对数）", plot.left, height - 14);
  ctx.textAlign = "right";
  ctx.fillText(clippedCount ? `涨幅，顶部截断 ${clippedCount} 只异常高涨幅` : "涨幅", plot.right, plot.top - 18);

  valid
    .slice()
    .sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0))
    .forEach((stock) => {
      const amount = Number(stock.amount);
      const pct = Number(stock.pct_change);
      const x = scaleLog(amount, xMin, xMax, plot.left, plot.right);
      const clipped = pct > yMax;
      const y = clipped ? plot.top + 7 : scaleLinear(pct, yMin, yMax, plot.bottom, plot.top);
      const board = stock.board || "其他";
      const radius = clamp(3.2 + Math.log10(Math.max(amount / minAmount, 1)) * 1.35, 3.2, 8.5);
      ctx.beginPath();
      ctx.fillStyle = colorWithAlpha(BOARD_COLORS[board] || BOARD_COLORS["其他"], clipped ? 0.92 : 0.72);
      if (clipped) {
        drawTriangle(ctx, x, y, radius + 2);
      } else {
        ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

  const labelStocks = pickScatterLabels(valid, yMax, compact ? 3 : 5);
  labelStocks.forEach((stock, index) => {
    const x = scaleLog(Number(stock.amount), xMin, xMax, plot.left, plot.right);
    const y = Number(stock.pct_change) > yMax
      ? plot.top + 7
      : scaleLinear(Number(stock.pct_change), yMin, yMax, plot.bottom, plot.top);
    const alignLeft = x < plot.left + plot.width * 0.72;
    drawPointLabel(ctx, stock.name || stock.code, x, y, alignLeft, index);
  });

  if (!compact) drawLegend(ctx, Object.keys(groupByBoard(valid)), plot.left, 15);
}

function drawAxis(ctx, left, top, right, bottom) {
  ctx.strokeStyle = "#d8e0ea";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();
}

function drawPlotBackground(ctx, plot) {
  ctx.fillStyle = "rgba(238, 243, 248, 0.42)";
  ctx.fillRect(plot.left, plot.top, plot.width, plot.height);
}

function drawVerticalGrid(ctx, x, top, bottom) {
  ctx.strokeStyle = "#d8e0ea";
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
}

function drawHorizontalGrid(ctx, left, right, y) {
  ctx.strokeStyle = "#d8e0ea";
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();
}

function drawTriangle(ctx, x, y, radius) {
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * 0.9, y + radius * 0.75);
  ctx.lineTo(x - radius * 0.9, y + radius * 0.75);
  ctx.closePath();
}

function drawPointLabel(ctx, text, x, y, alignLeft, index) {
  const label = trimText(ctx, text, 72);
  const offsetY = index % 2 === 0 ? -14 : 15;
  const labelX = alignLeft ? x + 10 : x - 10;
  const labelY = y + offsetY;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const metrics = ctx.measureText(label);
  const boxWidth = metrics.width + 10;
  const boxX = alignLeft ? labelX - 5 : labelX - boxWidth + 5;
  ctx.fillRect(boxX, labelY - 9, boxWidth, 18);
  ctx.fillStyle = "#152033";
  ctx.textAlign = alignLeft ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillText(label, labelX, labelY);
}

function drawLegend(ctx, boards, x, y) {
  const visibleBoards = boards.slice(0, 5);
  let cursor = x;
  visibleBoards.forEach((board) => {
    ctx.beginPath();
    ctx.fillStyle = BOARD_COLORS[board] || BOARD_COLORS["其他"];
    ctx.arc(cursor + 5, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#617086";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(board, cursor + 14, y);
    cursor += ctx.measureText(board).width + 44;
  });
}

function drawEmpty(ctx, width, height) {
  ctx.fillStyle = "#617086";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("暂无数据", width / 2, height / 2);
}

function trimText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}…`;
}

function colorForIndex(index, alpha) {
  const palette = [
    `rgba(49, 102, 200, ${alpha})`,
    `rgba(212, 75, 75, ${alpha})`,
    `rgba(23, 143, 145, ${alpha})`,
    `rgba(179, 106, 5, ${alpha})`
  ];
  return palette[index % palette.length];
}

function colorWithAlpha(hex, alpha) {
  const clean = String(hex).replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function quantile(values, q) {
  const sorted = values.filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * q;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] * (high - index) + sorted[high] * (index - low);
}

function scaleLinear(value, min, max, outputMin, outputMax) {
  if (max === min) return (outputMin + outputMax) / 2;
  return outputMin + (outputMax - outputMin) * (value - min) / (max - min);
}

function scaleLog(value, minLog, maxLog, outputMin, outputMax) {
  const current = Math.log10(Math.max(value, 1));
  return scaleLinear(current, minLog, maxLog, outputMin, outputMax);
}

function amountAxisTicks(minAmount, maxAmount) {
  const candidates = [
    50000000,
    100000000,
    300000000,
    1000000000,
    3000000000,
    10000000000,
    30000000000,
    100000000000
  ];
  const low = minAmount * 0.8;
  const high = maxAmount * 1.2;
  const ticks = candidates.filter((amount) => amount >= low && amount <= high);
  if (ticks.length >= 3) return ticks;
  return [minAmount, Math.sqrt(minAmount * maxAmount), maxAmount];
}

function pctAxisTicks(minPct, maxPct) {
  const step = maxPct - minPct <= 15 ? 2.5 : 5;
  const ticks = [];
  for (let tick = Math.ceil(minPct / step) * step; tick <= maxPct + 0.01; tick += step) {
    ticks.push(Number(tick.toFixed(1)));
  }
  return ticks.length ? ticks : [minPct, maxPct];
}

function pickScatterLabels(stocks, yMax, count) {
  const byAmount = stocks
    .slice()
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, Math.ceil(count / 2));
  const byPct = stocks
    .slice()
    .sort((a, b) => {
      const clippedDiff = Number(b.pct_change > yMax) - Number(a.pct_change > yMax);
      return clippedDiff || Number(b.pct_change || 0) - Number(a.pct_change || 0);
    })
    .slice(0, count);
  const seen = new Set();
  return [...byPct, ...byAmount].filter((stock) => {
    if (seen.has(stock.code)) return false;
    seen.add(stock.code);
    return true;
  }).slice(0, count);
}

function groupByBoard(stocks) {
  return stocks.reduce((groups, stock) => {
    const board = stock.board || "其他";
    groups[board] = (groups[board] || 0) + 1;
    return groups;
  }, {});
}

function formatInteger(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  return new Intl.NumberFormat("zh-CN").format(Math.round(Number(value)));
}

function formatNumber(value, digits = 2) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  return Number(value).toFixed(digits);
}

function formatPercent(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  return `${Number(value).toFixed(2)}%`;
}

function formatMoney(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  const amount = Number(value);
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(1)}亿`;
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(0)}万`;
  return `${amount.toFixed(0)}元`;
}

function eastMoneyUrl(code) {
  if (!code) return "https://quote.eastmoney.com/";
  if (/^(4|8|920)/.test(code)) return `https://quote.eastmoney.com/bj${code}.html`;
  if (/^(6|9)/.test(code)) return `https://quote.eastmoney.com/sh${code}.html`;
  if (/^(0|2|3)/.test(code)) return `https://quote.eastmoney.com/sz${code}.html`;
  return `https://quote.eastmoney.com/bj${code}.html`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.refreshBtn.addEventListener("click", loadReport);
els.boardFilter.addEventListener("change", (event) => {
  state.board = event.target.value;
  renderTable();
  renderCharts();
});
els.pctFilter.addEventListener("input", (event) => {
  state.minPct = Number(event.target.value);
  els.pctFilterValue.value = formatPercent(state.minPct);
  renderTable();
  renderCharts();
});
els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderTable();
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderCharts, 140);
});

loadReport();
