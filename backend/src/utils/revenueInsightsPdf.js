const PDFDocument = require("pdfkit");

const COLORS = {
  primary: "#007AFF",
  dark: "#0F172A",
  positive: "#22C55E",
  negative: "#EF4444",
  neutral: "#6B7280",
  sectionBg: "#F9FAFB",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number(value || 0),
  );

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isoDate = (value) => new Date(value).toISOString().slice(0, 10);

const toHexByte = (v) => {
  const n = Math.max(0, Math.min(255, Math.round(v)));
  return n.toString(16).padStart(2, "0");
};

const rgbToHex = (r, g, b) => `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;

const withSoftSection = (doc, x, y, width, height) => {
  doc
    .save()
    .roundedRect(x, y, width, height, 8)
    .fillColor(COLORS.sectionBg)
    .fill()
    .restore();
};

const drawThinSeparator = (doc, y) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc
    .save()
    .moveTo(left, y)
    .lineTo(right, y)
    .lineWidth(0.7)
    .strokeColor(COLORS.border)
    .stroke()
    .restore();
};

const drawMetricCard = (doc, cfg) => {
  const { x, y, w, value, label, color } = cfg;

  withSoftSection(doc, x, y, w, 76);
  doc
    .fillColor(color || COLORS.dark)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(value, x + 12, y + 16, { width: w - 24, align: "left" });

  doc
    .fillColor(COLORS.neutral)
    .font("Helvetica")
    .fontSize(11)
    .text(label, x + 12, y + 49, { width: w - 24, align: "left" });
};

const drawPageTitle = (doc, title, subtitle) => {
  const left = doc.page.margins.left;
  const top = doc.page.margins.top;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.dark)
    .text(title, left, top, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: "left",
    });

  if (subtitle) {
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(COLORS.neutral)
      .text(subtitle, left, top + 26, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "left",
        lineBreak: false,
        ellipsis: true,
      });
  }
};

const drawHeader = (doc, cfg) => {
  const { reportDate, isCover } = cfg;

  if (isCover) {
    return;
  }

  const y = 0;

  doc
    .save()
    .rect(0, y, doc.page.width, 34)
    .fillColor("#F8FAFC")
    .fill()
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor(COLORS.dark)
    .text("ROOTS", doc.page.margins.left, y + 11, {
      width: 64,
      align: "left",
      lineBreak: false,
    });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.neutral)
    .text("Revenue Insights Report", doc.page.margins.left + 68, y + 12, {
      width: 220,
      align: "left",
      lineBreak: false,
      ellipsis: true,
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.neutral)
    .text(
      `Date: ${reportDate}`,
      doc.page.width - doc.page.margins.right - 160,
      y + 13,
      {
        width: 160,
        align: "right",
        lineBreak: false,
        ellipsis: true,
      },
    );

  doc
    .save()
    .moveTo(doc.page.margins.left, 34)
    .lineTo(doc.page.width - doc.page.margins.right, 34)
    .lineWidth(0.7)
    .strokeColor("#DFE5ED")
    .stroke()
    .restore();
};

const drawLineChart = (doc, cfg) => {
  const { x, y, w, h, labels, values, color, title, highlightIndex } = cfg;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  withSoftSection(doc, x, y, w, h);

  const padX = 44;
  const padY = 30;
  const chartX = x + padX;
  const chartY = y + padY;
  const chartW = w - padX - 20;
  const chartH = h - padY - 34;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(title, x + 12, y + 8, { width: w - 24 });

  for (let i = 0; i <= 3; i += 1) {
    const gy = chartY + (chartH / 3) * i;
    const valueAtLine = max - (range / 3) * i;

    doc
      .save()
      .moveTo(chartX, gy)
      .lineTo(chartX + chartW, gy)
      .lineWidth(0.5)
      .strokeColor("#E8ECF2")
      .stroke()
      .restore();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.neutral)
      .text(number(valueAtLine), x + 6, gy - 4, { width: 34, align: "right" });
  }

  doc
    .save()
    .moveTo(chartX, chartY)
    .lineTo(chartX, chartY + chartH)
    .lineTo(chartX + chartW, chartY + chartH)
    .lineWidth(1)
    .strokeColor("#CBD5E1")
    .stroke()
    .restore();

  const points = values.map((value, index) => {
    const px =
      chartX +
      (labels.length <= 1
        ? chartW / 2
        : (index * chartW) / (labels.length - 1));
    const py = chartY + ((max - value) / range) * chartH;
    return { x: px, y: py, value };
  });

  if (points.length > 1) {
    doc.save().moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      doc.lineTo(points[i].x, points[i].y);
    }
    doc
      .lineWidth(2.2)
      .strokeColor(color || COLORS.primary)
      .stroke()
      .restore();
  }

  points.forEach((point, index) => {
    const isPeak = index === highlightIndex;
    doc
      .save()
      .circle(point.x, point.y, isPeak ? 4 : 2.5)
      .fillColor(isPeak ? COLORS.positive : color || COLORS.primary)
      .fill()
      .restore();
  });

  const labelStep = labels.length > 8 ? 2 : 1;
  labels.forEach((label, index) => {
    if (index % labelStep !== 0 && index !== labels.length - 1) {
      return;
    }

    const px =
      chartX +
      (labels.length <= 1
        ? chartW / 2
        : (index * chartW) / (labels.length - 1));

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.neutral)
      .text(label, px - 16, chartY + chartH + 6, {
        width: 32,
        align: "center",
      });
  });
};

const drawBarChart = (doc, cfg) => {
  const { x, y, w, h, labels, values, title, color } = cfg;
  const max = Math.max(...values, 1);

  withSoftSection(doc, x, y, w, h);

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(title, x + 12, y + 8, { width: w - 24 });

  const padX = 42;
  const padY = 30;
  const chartX = x + padX;
  const chartY = y + padY;
  const chartW = w - padX - 18;
  const chartH = h - padY - 42;

  doc
    .save()
    .moveTo(chartX, chartY + chartH)
    .lineTo(chartX + chartW, chartY + chartH)
    .lineWidth(1)
    .strokeColor("#CBD5E1")
    .stroke()
    .restore();

  const barSpace = chartW / Math.max(labels.length, 1);
  const barWidth = Math.max(Math.min(barSpace * 0.64, 26), 8);

  labels.forEach((label, index) => {
    const barHeight = (values[index] / max) * chartH;
    const bx = chartX + index * barSpace + (barSpace - barWidth) / 2;
    const by = chartY + chartH - barHeight;

    doc
      .save()
      .roundedRect(bx, by, barWidth, barHeight, 3)
      .fillColor(color || COLORS.primary)
      .fill()
      .restore();

    doc
      .font("Helvetica")
      .fontSize(7.7)
      .fillColor(COLORS.neutral)
      .text(label, bx - 8, chartY + chartH + 6, {
        width: barWidth + 16,
        align: "center",
      });
  });
};

const drawSimpleTable = (doc, cfg) => {
  const { x, y, w, columns, rows, rowHeight = 22, maxRows } = cfg;
  const usableRows = maxRows ? rows.slice(0, maxRows) : rows;
  const tableHeight = rowHeight * (usableRows.length + 1);

  withSoftSection(doc, x, y, w, tableHeight + 10);

  let cursorX = x + 10;
  const topY = y + 8;

  columns.forEach((col) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(col.header, cursorX, topY, {
        width: col.width,
        align: col.align || "left",
      });
    cursorX += col.width;
  });

  drawThinSeparator(doc, topY + rowHeight - 4);

  usableRows.forEach((row, rowIndex) => {
    let cellX = x + 10;
    columns.forEach((col) => {
      const value = row[col.key] == null ? "-" : String(row[col.key]);
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLORS.neutral)
        .text(value, cellX, topY + rowHeight * (rowIndex + 1), {
          width: col.width,
          align: col.align || "left",
          lineBreak: false,
          ellipsis: true,
        });
      cellX += col.width;
    });

    if (rowIndex < usableRows.length - 1) {
      const lineY = topY + rowHeight * (rowIndex + 2) - 5;
      doc
        .save()
        .moveTo(x + 10, lineY)
        .lineTo(x + w - 10, lineY)
        .lineWidth(0.5)
        .strokeColor("#ECEFF4")
        .stroke()
        .restore();
    }
  });

  return tableHeight + 10;
};

const drawProgressBar = (doc, cfg) => {
  const { x, y, w, label, value, color } = cfg;
  const normalized = Math.min(Math.max(value, 0), 100);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text(label, x, y, { width: w * 0.6 });

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text(pct(normalized), x + w - 64, y, { width: 64, align: "right" });

  doc
    .save()
    .roundedRect(x, y + 15, w, 8, 4)
    .fillColor("#E5EAF1")
    .fill()
    .restore();

  doc
    .save()
    .roundedRect(x, y + 15, (w * normalized) / 100, 8, 4)
    .fillColor(color)
    .fill()
    .restore();
};

const drawPieChart = (doc, cfg) => {
  const { x, y, radius, values, labels, colors, title } = cfg;
  const total = values.reduce((acc, item) => acc + item, 0) || 1;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(title, x - radius, y - radius - 28, {
      width: radius * 2,
      align: "center",
    });

  let angle = -Math.PI / 2;
  values.forEach((value, index) => {
    const nextAngle = angle + (value / total) * Math.PI * 2;
    doc
      .save()
      .moveTo(x, y)
      .lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
      .arc(x, y, radius, angle, nextAngle)
      .lineTo(x, y)
      .fillColor(colors[index])
      .fill()
      .restore();
    angle = nextAngle;
  });

  labels.forEach((label, index) => {
    const ly = y + radius + 20 + index * 16;
    doc
      .save()
      .roundedRect(x - radius, ly, 9, 9, 2)
      .fillColor(colors[index])
      .fill()
      .restore();

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLORS.neutral)
      .text(label, x - radius + 14, ly - 1, { width: radius * 2 - 14 });
  });
};

const drawWatermark = (doc) => {
  const centerX = doc.page.width / 2;
  const centerY = doc.page.height / 2;

  doc
    .save()
    .rotate(-32, { origin: [centerX, centerY] })
    .fillColor(COLORS.dark)
    .fillOpacity(0.06)
    .font("Helvetica-Bold")
    .fontSize(96)
    .text("ROOTS", centerX - 190, centerY - 42, {
      width: 380,
      align: "center",
    })
    .restore();
};

const drawFooter = (doc, cfg) => {
  const { pageNo, totalPages, timestamp } = cfg;
  const y = doc.page.height - doc.page.margins.bottom - 10;

  doc
    .save()
    .moveTo(doc.page.margins.left, y - 8)
    .lineTo(doc.page.width - doc.page.margins.right, y - 8)
    .lineWidth(0.5)
    .strokeColor("#DFE5ED")
    .stroke()
    .restore();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.neutral)
    .text("Generated by Roots", doc.page.margins.left, y, {
      width: 130,
      align: "left",
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.neutral)
    .text(`Page ${pageNo} of ${totalPages}`, 0, y, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.neutral)
    .text(timestamp, doc.page.width - doc.page.margins.right - 160, y, {
      width: 160,
      align: "right",
    });
};

const renderCoverPage = (doc, data) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;

  doc
    .save()
    .rect(0, 0, doc.page.width, 112)
    .fillColor(COLORS.dark)
    .fill()
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(COLORS.white)
    .text("ROOTS", left, 26);

  doc
    .font("Helvetica")
    .fontSize(15)
    .fillColor(COLORS.white)
    .text("Revenue Insights Report", left, 58);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.white)
    .text(
      `Report Date: ${formatDate(data.meta.generatedAt)}`,
      right - 190,
      34,
      {
        width: 190,
        align: "right",
      },
    );

  const profileY = 134;
  withSoftSection(doc, left, profileY, width, 84);

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.dark)
    .text("Seller Profile", left + 14, profileY + 12)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.neutral)
    .text(`Name: ${data.seller.name}`, left + 14, profileY + 36)
    .text(`Email: ${data.seller.email}`, left + 14, profileY + 52)
    .text(
      `Seller Level: ${data.seller.level}`,
      left + width * 0.52,
      profileY + 36,
    )
    .text(
      `Verification: ${data.seller.badges.join(" | ") || "None"}`,
      left + width * 0.52,
      profileY + 52,
    );

  const metricY = 232;
  const gap = 10;
  const cardWidth = (width - gap * 3) / 4;
  drawMetricCard(doc, {
    x: left,
    y: metricY,
    w: cardWidth,
    value: currency(data.summary.totalRevenue),
    label: "Total Revenue",
    color: COLORS.primary,
  });

  drawMetricCard(doc, {
    x: left + cardWidth + gap,
    y: metricY,
    w: cardWidth,
    value: number(data.summary.totalOrders),
    label: "Total Orders",
    color: COLORS.dark,
  });

  drawMetricCard(doc, {
    x: left + (cardWidth + gap) * 2,
    y: metricY,
    w: cardWidth,
    value: currency(data.summary.avgOrderValue),
    label: "Avg Order Value",
    color: COLORS.dark,
  });

  drawMetricCard(doc, {
    x: left + (cardWidth + gap) * 3,
    y: metricY,
    w: cardWidth,
    value: number(data.summary.activeDays),
    label: "Active Days",
    color: COLORS.dark,
  });

  const summaryY = 326;
  withSoftSection(doc, left, summaryY, width, 188);

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(COLORS.dark)
    .text("Executive Summary", left + 14, summaryY + 14);

  data.executiveInsights.slice(0, 4).forEach((item, index) => {
    const y = summaryY + 44 + index * 30;
    doc
      .save()
      .circle(left + 20, y + 5, 2.7)
      .fillColor(COLORS.primary)
      .fill()
      .restore();

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(COLORS.neutral)
      .text(item, left + 30, y - 2, {
        width: width - 44,
        lineBreak: false,
        ellipsis: true,
      });
  });
};

const renderMonthlyPerformance = (doc, data) => {
  drawPageTitle(
    doc,
    "Monthly Revenue & Orders",
    "Past 12 months performance trend",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  drawLineChart(doc, {
    x: left,
    y: 86,
    w: width,
    h: 202,
    labels: data.monthly.map((m) => m.shortLabel),
    values: data.monthly.map((m) => m.revenue),
    title: "Revenue by Month",
    color: COLORS.primary,
    highlightIndex: data.monthlyPeakIndex,
  });

  drawBarChart(doc, {
    x: left,
    y: 298,
    w: width,
    h: 160,
    labels: data.monthly.map((m) => m.shortLabel),
    values: data.monthly.map((m) => m.orders),
    title: "Orders per Month",
    color: "#60A5FA",
  });

  const tableRows = data.monthly.map((item) => ({
    month: item.label,
    revenue: currency(item.revenue),
    orders: number(item.orders),
    growth: pct(item.growthPercent),
  }));

  drawSimpleTable(doc, {
    x: left,
    y: 466,
    w: width,
    columns: [
      { header: "Month", key: "month", width: width * 0.24 },
      {
        header: "Revenue",
        key: "revenue",
        width: width * 0.28,
        align: "right",
      },
      { header: "Orders", key: "orders", width: width * 0.2, align: "right" },
      {
        header: "Growth %",
        key: "growth",
        width: width * 0.24,
        align: "right",
      },
    ],
    rows: tableRows,
    rowHeight: 20,
    maxRows: 6,
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text("Insights", left, 610)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.neutral)
    .text(
      `Highest revenue month: ${data.monthlyInsights.highestMonth}`,
      left,
      629,
    )
    .text(`Lowest performance: ${data.monthlyInsights.lowestMonth}`, left, 646)
    .text(`Growth trend: ${data.monthlyInsights.trend}`, left, 663);
};

const renderDailyPerformance = (doc, data) => {
  drawPageTitle(
    doc,
    "Daily Performance (Last 30 Days)",
    "Daily revenue activity and selling consistency",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  drawLineChart(doc, {
    x: left,
    y: 86,
    w: width,
    h: 220,
    labels: data.daily30.map((d) => d.dayLabel),
    values: data.daily30.map((d) => d.revenue),
    title: "Daily Revenue Trend",
    color: COLORS.primary,
    highlightIndex: data.dailyPeakIndex,
  });

  const gap = 10;
  const cardWidth = (width - gap * 2) / 3;
  drawMetricCard(doc, {
    x: left,
    y: 318,
    w: cardWidth,
    value: currency(data.dailySummary.total30Days),
    label: "Total (30 days)",
    color: COLORS.primary,
  });
  drawMetricCard(doc, {
    x: left + cardWidth + gap,
    y: 318,
    w: cardWidth,
    value: currency(data.dailySummary.avgPerDay),
    label: "Average / day",
    color: COLORS.dark,
  });
  drawMetricCard(doc, {
    x: left + (cardWidth + gap) * 2,
    y: 318,
    w: cardWidth,
    value: number(data.dailySummary.activeDays30),
    label: "Active selling days",
    color: COLORS.dark,
  });

  withSoftSection(doc, left, 410, width, 98);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text("Activity Heatmap", left + 12, 420);

  const heatStartX = left + 14;
  const heatStartY = 446;
  const cellGap = 4;
  const cellW = (width - 28 - cellGap * 29) / 30;
  const maxDaily = Math.max(...data.daily30.map((d) => d.revenue), 1);

  data.daily30.forEach((d, i) => {
    const intensity = d.revenue / maxDaily;
    const shade = Math.floor(245 - intensity * 100);
    const color = rgbToHex(shade, shade + 8, 255);

    doc
      .save()
      .roundedRect(heatStartX + i * (cellW + cellGap), heatStartY, cellW, 16, 2)
      .fillColor(color)
      .fill()
      .restore();
  });

  withSoftSection(doc, left, 518, width, 120);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text("Insights", left + 12, 530)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.neutral)
    .text(
      `Inactive days reduced potential revenue by ${pct(data.dailySummary.inactiveImpactPct)}.`,
      left + 12,
      552,
      { width: width - 24 },
    )
    .text(
      `Peak sales occurred between ${data.dailySummary.peakWindow}.`,
      left + 12,
      575,
      { width: width - 24 },
    );
};

const renderProductPerformance = (doc, data) => {
  drawPageTitle(
    doc,
    "Product Performance",
    "Revenue contribution and ranking by product",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const tableRows = data.products.map((p) => ({
    name: p.name,
    revenue: currency(p.revenue),
    orders: number(p.orders),
    avgPrice: currency(p.avgPrice),
    contribution: pct(p.contributionPercent),
  }));

  drawSimpleTable(doc, {
    x: left,
    y: 88,
    w: width,
    columns: [
      { header: "Product Name", key: "name", width: width * 0.32 },
      { header: "Revenue", key: "revenue", width: width * 0.2, align: "right" },
      { header: "Orders", key: "orders", width: width * 0.12, align: "right" },
      {
        header: "Avg Price",
        key: "avgPrice",
        width: width * 0.18,
        align: "right",
      },
      {
        header: "Contribution %",
        key: "contribution",
        width: width * 0.18,
        align: "right",
      },
    ],
    rows: tableRows,
    rowHeight: 22,
    maxRows: 8,
  });

  drawBarChart(doc, {
    x: left,
    y: 338,
    w: width,
    h: 210,
    labels: data.top5.map((p) =>
      p.name.length > 9 ? `${p.name.slice(0, 9)}...` : p.name,
    ),
    values: data.top5.map((p) => p.revenue),
    title: "Top 5 Products by Revenue",
    color: "#3B82F6",
  });

  withSoftSection(doc, left, 558, width, 82);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text("Insights", left + 12, 570)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.neutral)
    .text(
      `Top 2 products generate ${pct(data.top2Contribution)} of total revenue.`,
      left + 12,
      591,
    )
    .text(
      "Low-performing products need optimization in pricing, visibility, or listing quality.",
      left + 12,
      611,
      {
        width: width - 24,
      },
    );
};

const renderCustomerOperations = (doc, data) => {
  drawPageTitle(
    doc,
    "Customer & Operations Metrics",
    "Service quality indicators and operational health",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  withSoftSection(doc, left, 90, width, 250);

  drawProgressBar(doc, {
    x: left + 16,
    y: 114,
    w: width - 32,
    label: "Customer Rating (normalized)",
    value: (data.rating / 5) * 100,
    color: COLORS.primary,
  });

  drawProgressBar(doc, {
    x: left + 16,
    y: 164,
    w: width - 32,
    label: "On-time Delivery %",
    value: data.onTimeDelivery,
    color: COLORS.positive,
  });

  drawProgressBar(doc, {
    x: left + 16,
    y: 214,
    w: width - 32,
    label: "Cancellation Rate",
    value: data.cancellationRate,
    color: data.cancellationRate > 10 ? COLORS.negative : "#F59E0B",
  });

  drawProgressBar(doc, {
    x: left + 16,
    y: 264,
    w: width - 32,
    label: "Return Rate",
    value: data.returnRate,
    color: data.returnRate > 8 ? COLORS.negative : "#F59E0B",
  });

  withSoftSection(doc, left, 352, width, 200);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text("Insights", left + 14, 366)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.neutral)
    .text(
      `Delivery performance is ${
        data.onTimeDelivery >= 85 ? "strong" : "needs improvement"
      } with ${pct(data.onTimeDelivery)} on-time completion.`,
      left + 14,
      392,
      { width: width - 28 },
    )
    .text(
      `Cancellation rate at ${pct(data.cancellationRate)} is ${
        data.cancellationRate > 10
          ? "affecting trust and conversion"
          : "within controlled levels"
      }.`,
      left + 14,
      418,
      { width: width - 28 },
    )
    .text(
      `Return rate is ${pct(data.returnRate)} and should be reduced through quality checks and better product expectations.`,
      left + 14,
      444,
      { width: width - 28 },
    );
};

const renderFinancialBreakdown = (doc, data) => {
  drawPageTitle(
    doc,
    "Financial Breakdown",
    "Gross revenue, fees and net earnings",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const blockW = (width - 20) / 2;

  withSoftSection(doc, left, 94, blockW, 170);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLORS.dark)
    .text("Revenue Summary", left + 14, 108)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.neutral)
    .text("Gross Revenue", left + 14, 140)
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.primary)
    .text(currency(data.grossRevenue), left + 14, 156)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.neutral)
    .text("Platform Fees", left + 14, 188)
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(COLORS.negative)
    .text(`- ${currency(data.platformFees)}`, left + 14, 203)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.neutral)
    .text("Net Earnings", left + 14, 230)
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor(COLORS.positive)
    .text(currency(data.netEarnings), left + 14, 245);

  withSoftSection(doc, left + blockW + 20, 94, blockW, 300);
  drawPieChart(doc, {
    x: left + blockW + 20 + blockW / 2,
    y: 206,
    radius: 74,
    values: [data.netEarnings, data.platformFees],
    labels: [
      `Net Earnings ${pct((data.netEarnings / Math.max(data.grossRevenue, 1)) * 100)}`,
      `Fees ${pct((data.platformFees / Math.max(data.grossRevenue, 1)) * 100)}`,
    ],
    colors: [COLORS.positive, COLORS.negative],
    title: "Revenue Distribution",
  });

  withSoftSection(doc, left, 414, width, 154);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text("Notes", left + 14, 428)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.neutral)
    .text(
      "Net earnings reflect estimated platform fee deductions and do not include tax, shipping offsets, or adjustment entries.",
      left + 14,
      452,
      { width: width - 28 },
    );
};

const renderRecommendations = (doc, data) => {
  drawPageTitle(
    doc,
    "Recommendations",
    "Auto-generated strategy based on sales and operations insights",
  );

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  withSoftSection(doc, left, 92, width, 530);

  data.recommendations.forEach((item, index) => {
    const y = 124 + index * 78;

    doc
      .save()
      .roundedRect(left + 18, y, width - 36, 62, 10)
      .fillColor(COLORS.white)
      .fill()
      .restore();

    doc
      .save()
      .circle(left + 36, y + 31, 12)
      .fillColor(item.color)
      .fill()
      .restore();

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLORS.dark)
      .text(item.title, left + 56, y + 14, { width: width - 96 })
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(COLORS.neutral)
      .text(item.text, left + 56, y + 34, {
        width: width - 96,
        lineBreak: false,
        ellipsis: true,
      });
  });
};

const renderAppendix = (doc, data) => {
  drawPageTitle(doc, "Appendix", "Raw tables and metric definitions");

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const monthlyRows = data.monthly.slice(-8).map((row) => ({
    month: row.label,
    revenue: currency(row.revenue),
    orders: number(row.orders),
    growth: pct(row.growthPercent),
  }));

  drawSimpleTable(doc, {
    x: left,
    y: 90,
    w: width,
    columns: [
      { header: "Month", key: "month", width: width * 0.25 },
      {
        header: "Revenue",
        key: "revenue",
        width: width * 0.26,
        align: "right",
      },
      { header: "Orders", key: "orders", width: width * 0.2, align: "right" },
      { header: "Growth", key: "growth", width: width * 0.25, align: "right" },
    ],
    rows: monthlyRows,
    rowHeight: 22,
    maxRows: 8,
  });

  const productRows = data.products.slice(0, 6).map((row) => ({
    product: row.name,
    revenue: currency(row.revenue),
    orders: number(row.orders),
    share: pct(row.contributionPercent),
  }));

  drawSimpleTable(doc, {
    x: left,
    y: 316,
    w: width,
    columns: [
      { header: "Product", key: "product", width: width * 0.38 },
      {
        header: "Revenue",
        key: "revenue",
        width: width * 0.23,
        align: "right",
      },
      { header: "Orders", key: "orders", width: width * 0.16, align: "right" },
      { header: "Share", key: "share", width: width * 0.19, align: "right" },
    ],
    rows: productRows,
    rowHeight: 22,
    maxRows: 6,
  });

  withSoftSection(doc, left, 522, width, 116);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text("Definitions", left + 12, 536)
    .font("Helvetica")
    .fontSize(10.3)
    .fillColor(COLORS.neutral)
    .text(
      "AOV: Average Order Value = Total Revenue / Total Orders",
      left + 12,
      558,
    )
    .text(
      "On-time Delivery %: Delivered orders as a share of active order flow",
      left + 12,
      576,
    )
    .text(
      "Return Rate: Refund requests relative to fulfilled orders",
      left + 12,
      594,
    );
};

const prepareMonthlySeries = (orders) => {
  const now = new Date();
  const buckets = [];

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      shortLabel: MONTHS[d.getMonth()],
      revenue: 0,
      orders: 0,
      growthPercent: 0,
    });
  }

  const map = new Map(buckets.map((b) => [b.key, b]));
  orders.forEach((order) => {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = map.get(key);
    if (!bucket) {
      return;
    }
    bucket.revenue += Number(order.totalPrice || 0);
    bucket.orders += 1;
  });

  buckets.forEach((bucket, index) => {
    if (index === 0) {
      bucket.growthPercent = 0;
      return;
    }
    const prev = buckets[index - 1].revenue;
    bucket.growthPercent =
      prev > 0 ? ((bucket.revenue - prev) / prev) * 100 : 0;
  });

  return buckets;
};

const prepareDaily30Series = (orders) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);

  const days = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      iso: isoDate(d),
      dayLabel: String(d.getDate()),
      date: d,
      revenue: 0,
      orders: 0,
    });
  }

  const map = new Map(days.map((d) => [d.iso, d]));
  orders.forEach((order) => {
    const key = isoDate(order.createdAt);
    const bucket = map.get(key);
    if (!bucket) {
      return;
    }
    bucket.revenue += Number(order.totalPrice || 0);
    bucket.orders += 1;
  });

  return days;
};

const deriveSellerLevel = (trustScore) => {
  const score = Number(trustScore || 0);
  if (score >= 80) {
    return "Gold";
  }
  if (score >= 60) {
    return "Silver";
  }
  if (score >= 40) {
    return "Bronze";
  }
  return "Starter";
};

const buildInsightsDataset = (payload) => {
  const {
    seller,
    paidOrders,
    allOrders,
    topProducts,
    refundsCount,
    platformFeeRate,
    generatedAt,
  } = payload;

  const totalRevenue = paidOrders.reduce(
    (acc, order) => acc + Number(order.totalPrice || 0),
    0,
  );
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalRevenue / Math.max(totalOrders, 1);

  const activeDaySet = new Set(
    paidOrders.map((order) => isoDate(order.createdAt)),
  );
  const activeDays = activeDaySet.size;

  const monthly = prepareMonthlySeries(paidOrders);
  const daily30 = prepareDaily30Series(paidOrders);
  const monthlyPeakIndex = monthly.reduce(
    (best, item, index, arr) =>
      item.revenue > arr[best].revenue ? index : best,
    0,
  );
  const dailyPeakIndex = daily30.reduce(
    (best, item, index, arr) =>
      item.revenue > arr[best].revenue ? index : best,
    0,
  );

  const topProductRevenue = topProducts[0]?.revenue || 0;
  const topProductContribution =
    totalRevenue > 0 ? (topProductRevenue / totalRevenue) * 100 : 0;

  const now = new Date(generatedAt);
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 29);
  const prev30Start = new Date(now);
  prev30Start.setDate(now.getDate() - 59);

  const revenueLast30 = paidOrders
    .filter((o) => new Date(o.createdAt) >= last30Start)
    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const revenuePrev30 = paidOrders
    .filter((o) => {
      const t = new Date(o.createdAt);
      return t >= prev30Start && t < last30Start;
    })
    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  const growthVsPrevious =
    revenuePrev30 > 0
      ? ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100
      : revenueLast30 > 0
        ? 100
        : 0;

  const last10Start = new Date(now);
  last10Start.setDate(now.getDate() - 9);
  const revenueLast10 = paidOrders
    .filter((o) => new Date(o.createdAt) >= last10Start)
    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const last10Share =
    revenueLast30 > 0 ? (revenueLast10 / revenueLast30) * 100 : 0;

  const dailyTotal = daily30.reduce((sum, d) => sum + d.revenue, 0);
  const dailyAvg = dailyTotal / 30;
  const activeDays30 = daily30.filter((d) => d.revenue > 0).length;
  const inactiveDays = 30 - activeDays30;
  const potential = dailyAvg * 30;
  const inactiveImpactPct =
    potential > 0 ? (inactiveDays * dailyAvg * 100) / potential : 0;

  const peakDate = daily30[dailyPeakIndex]?.date;
  const peakWindow = peakDate
    ? `${formatDate(peakDate)} to ${formatDate(new Date(peakDate.getTime() + 2 * 86400000))}`
    : "N/A";

  const sortedTopProducts = topProducts.map((row) => ({
    ...row,
    contributionPercent:
      totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0,
    avgPrice: row.orders > 0 ? row.revenue / row.orders : 0,
  }));
  const top2Contribution = sortedTopProducts
    .slice(0, 2)
    .reduce((sum, row) => sum + row.contributionPercent, 0);

  const deliveredCount = allOrders.filter(
    (o) => o.status === "Delivered",
  ).length;
  const cancelledCount = allOrders.filter(
    (o) => o.status === "Cancelled",
  ).length;
  const onTimeDelivery =
    totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;
  const cancellationRate =
    allOrders.length > 0 ? (cancelledCount / allOrders.length) * 100 : 0;
  const returnRate = totalOrders > 0 ? (refundsCount / totalOrders) * 100 : 0;

  const grossRevenue = totalRevenue;
  const platformFees = grossRevenue * platformFeeRate;
  const netEarnings = grossRevenue - platformFees;

  const highest = monthly.reduce(
    (best, item, index, arr) =>
      item.revenue > arr[best].revenue ? index : best,
    0,
  );
  const lowest = monthly.reduce(
    (best, item, index, arr) =>
      item.revenue < arr[best].revenue ? index : best,
    0,
  );

  const trend =
    monthly[monthly.length - 1].revenue >= monthly[0].revenue
      ? "upward"
      : "downward";

  const recommendations = [
    {
      title: "Increase inventory for top-selling items",
      text: "Protect high-contributing products from stock-outs to preserve revenue continuity.",
      color: COLORS.primary,
    },
    {
      title: "Focus on months with declining sales",
      text: "Plan campaigns for low-performing months to flatten seasonal dips.",
      color: "#3B82F6",
    },
    {
      title: "Improve response time to boost conversions",
      text: "Faster buyer responses typically improve checkout confidence and conversion rates.",
      color: COLORS.positive,
    },
    {
      title: "Reduce cancellations to improve trust score",
      text: "Lower cancellation rates can materially improve platform trust and repeat purchases.",
      color: COLORS.negative,
    },
  ];

  const badges = [];
  badges.push(seller.isVerified ? "KYC Verified" : "KYC Pending");
  const gstStatus = seller.complianceDocs?.gstCertificate?.status;
  badges.push(gstStatus === "verified" ? "GST Verified" : "GST Pending");

  return {
    meta: {
      generatedAt,
      timestampLabel: new Date(generatedAt).toLocaleString("en-IN"),
    },
    seller: {
      id: String(seller._id),
      name: seller.name || "Seller",
      email: seller.email || "-",
      level: deriveSellerLevel(seller.trustScore),
      badges,
      rating: Number(seller.averageRating || 0),
    },
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      activeDays,
    },
    executiveInsights: [
      `Revenue ${growthVsPrevious >= 0 ? "increased" : "decreased"} ${pct(Math.abs(growthVsPrevious))} compared to last period.`,
      `Top product contributed ${pct(topProductContribution)} of total revenue.`,
      `Sales activity concentrated in the last 10 days (${pct(last10Share)} of recent revenue).`,
      `${activeDays30} out of 30 days had selling activity in the latest cycle.`,
    ],
    monthly,
    monthlyPeakIndex,
    monthlyInsights: {
      highestMonth: monthly[highest]?.label || "N/A",
      lowestMonth: monthly[lowest]?.label || "N/A",
      trend,
    },
    daily30,
    dailyPeakIndex,
    dailySummary: {
      total30Days: dailyTotal,
      avgPerDay: dailyAvg,
      activeDays30,
      inactiveImpactPct,
      peakWindow,
    },
    products: sortedTopProducts,
    top5: sortedTopProducts.slice(0, 5),
    top2Contribution,
    operations: {
      rating: Number(seller.averageRating || 0),
      onTimeDelivery,
      cancellationRate,
      returnRate,
    },
    financial: {
      grossRevenue,
      platformFees,
      netEarnings,
    },
    recommendations,
  };
};

const createRevenueInsightsPdf = async (stream, input) => {
  const data = buildInsightsDataset(input);
  const includeAppendix = Boolean(input.includeAppendix);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 46, bottom: 34, left: 26, right: 26 },
    bufferPages: true,
  });

  doc.pipe(stream);

  renderCoverPage(doc, data);

  doc.addPage();
  renderMonthlyPerformance(doc, data);

  doc.addPage();
  renderDailyPerformance(doc, data);

  doc.addPage();
  renderProductPerformance(doc, data);

  doc.addPage();
  renderCustomerOperations(doc, data.operations);

  doc.addPage();
  renderFinancialBreakdown(doc, data.financial);

  doc.addPage();
  renderRecommendations(doc, data);

  if (includeAppendix) {
    doc.addPage();
    renderAppendix(doc, data);
  }

  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i += 1) {
    doc.switchToPage(i);
    drawWatermark(doc);
    drawHeader(doc, {
      reportDate: formatDate(data.meta.generatedAt),
      isCover: i === 0,
    });
    drawFooter(doc, {
      pageNo: i + 1,
      totalPages: pageRange.count,
      timestamp: data.meta.timestampLabel,
    });
  }

  await new Promise((resolve, reject) => {
    doc.on("error", reject);
    stream.on("error", reject);
    stream.on("finish", resolve);
    doc.end();
  });
};

module.exports = {
  createRevenueInsightsPdf,
};
