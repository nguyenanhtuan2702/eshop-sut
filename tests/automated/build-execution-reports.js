const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { RUN_ID } = require("./helpers/runtime");

const root = path.resolve(__dirname, "../..");
const runRoot = path.resolve(__dirname, "test-results", "executions", RUN_ID);
const reports = [
  {
    key: "fr01",
    directory: "FR-01-registration",
    title: "FR-01 Registration",
    notAutomated: {
      "TC11": {
        description: "Bỏ trống trường xác nhận mật khẩu",
        expected: "Từ chối đăng ký và thông báo trường xác nhận mật khẩu chưa được nhập.",
        reason: "Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này.",
      },
      "TC12": {
        description: "Mật khẩu xác nhận không khớp",
        expected: "Từ chối đăng ký và thông báo hai mật khẩu không khớp.",
        reason: "Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này.",
      },
    },
  },
  {
    key: "fr09",
    directory: "FR-09-coupons",
    title: "FR-09 Coupons",
    notAutomated: {},
  },
  {
    key: "fr17",
    directory: "FR-17-coupon-management",
    title: "FR-17 Coupon Management",
    notAutomated: {},
  },
];

function collectIds(contents) {
  const ids = new Set();
  const pattern = /^\|\s*((?:TC\d{2}(?:-\d{2})?|BVA-FR\d+-\d+))\s*\|/gm;
  for (const match of contents.matchAll(pattern)) ids.add(match[1]);
  return [...ids];
}

function markdownCell(value) {
  return String(value ?? "").replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function readRunRecord(key, id) {
  const file = path.join(runRoot, key, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return { file, record: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function renderReport(report) {
  const directory = path.join(root, report.directory);
  const domainFile = path.join(directory, "domain-testing.md");
  const bvaFile = path.join(directory, "bva.md");
  const ids = [
    ...collectIds(fs.readFileSync(domainFile, "utf8")),
    ...collectIds(fs.readFileSync(bvaFile, "utf8")),
  ];
  const uniqueIds = [...new Set(ids)];
  const rows = uniqueIds.map((id) => {
    const found = readRunRecord(report.key, id);
    if (found) {
      const relativeLog = path.relative(directory, found.file).replace(/\\/g, "/");
      return {
        id,
        source: found.record.source,
        description: found.record.description,
        expected: found.record.expected,
        actual: typeof found.record.actual === "string"
          ? found.record.actual
          : JSON.stringify(found.record.actual),
        status: found.record.status,
        evidence: `[execution log](./${relativeLog})`,
        record: found.record,
      };
    }
    if (report.notAutomated[id]) {
      const item = report.notAutomated[id];
      return {
        id,
        source: id.startsWith("BVA-") ? "BVA" : "Domain Testing",
        description: item.description,
        expected: item.expected,
        actual: `Chưa chạy: ${item.reason}`,
        status: "NOT AUTOMATED",
        evidence: "Không có",
      };
    }
    return {
      id,
      source: id.startsWith("BVA-") ? "BVA" : "Domain Testing",
      description: "Theo test plan gốc",
      expected: "Giữ nguyên theo tài liệu thiết kế.",
      actual: "Không có bản ghi thực thi cho test case này.",
      status: "BLOCKED",
      evidence: "Không có execution log",
    };
  });

  const counts = Object.fromEntries(
    ["PASS", "FAIL", "BLOCKED", "NOT AUTOMATED"].map((status) => [
      status,
      rows.filter((row) => row.status === status).length,
    ]),
  );
  const ran = rows.filter((row) => row.record).length;
  const automated = rows.filter((row) => row.status !== "NOT AUTOMATED").length;
  const duration = rows.reduce(
    (total, row) => total + (row.record ? row.record.durationMs : 0),
    0,
  );
  const startTimes = rows
    .filter((row) => row.record)
    .map((row) => row.record.startedAt)
    .sort();

  const table = [
    "| Test Case ID | Test Source | Test Description | Expected Result | Actual Result | Status | Evidence/Log |",
    "|---|---|---|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${row.id} | ${markdownCell(row.source)} | ${markdownCell(row.description)} | ${markdownCell(row.expected)} | ${markdownCell(row.actual)} | ${row.status} | ${markdownCell(row.evidence)} |`,
    ),
  ].join("\n");

  const failed = rows.filter((row) => row.status === "FAIL");
  const blocked = rows.filter((row) => row.status === "BLOCKED");
  const output = [
    `# ${report.title} — execution results`,
    "",
    `- Run ID: \`${RUN_ID}\``,
    `- Thời điểm bắt đầu ghi nhận: ${startTimes[0] || "Không có test nào bắt đầu."}`,
    `- Tổng thời lượng các test đã ghi nhận: ${(duration / 1000).toFixed(2)} giây`,
    `- Môi trường: ${os.type()} ${os.release()}, Node.js ${process.version}; Web ${process.env.ESHOP_WEB_URL || "http://localhost:5173"}; Admin ${process.env.ESHOP_ADMIN_URL || "http://localhost:5174"}; API ${process.env.ESHOP_API_URL || "http://localhost:3000/api"}.`,
    "- Tài khoản Admin được đọc từ biến môi trường; không ghi credential hoặc token vào báo cáo.",
    "",
    table,
    "",
    "## Tổng kết",
    "",
    `- Tổng số test case trong tài liệu: **${uniqueIds.length}**.`,
    `- Số test case có script tự động hóa: **${automated}**.`,
    `- Số test đã thực sự chạy và có execution log: **${ran}**.`,
    `- PASS: **${counts.PASS}**; FAIL: **${counts.FAIL}**; BLOCKED: **${counts.BLOCKED}**; NOT AUTOMATED: **${counts["NOT AUTOMATED"]}**.`,
    "",
    "### Test case thất bại",
    "",
    ...(failed.length
      ? failed.map((row) => `- **${row.id}** — Actual: ${markdownCell(row.actual)} Expected không thay đổi so với test plan.`)
      : ["- Không có." ]),
    "",
    "### Test case chưa chạy hoặc không tự động hóa",
    "",
    ...(blocked.length
      ? blocked.map((row) => `- **${row.id}** — ${markdownCell(row.actual)}`)
      : ["- Không có test case BLOCKED." ]),
    ...rows
      .filter((row) => row.status === "NOT AUTOMATED")
      .map((row) => `- **${row.id}** — ${markdownCell(row.actual)}`),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(directory, "execution-results.md"), output, "utf8");
  return { report: path.join(directory, "execution-results.md"), rows, counts, duration };
}

const results = reports.map(renderReport);
const metaDirectory = runRoot;
fs.mkdirSync(metaDirectory, { recursive: true });
fs.writeFileSync(
  path.join(metaDirectory, "summary.json"),
  `${JSON.stringify(
    {
      runId: RUN_ID,
      createdAt: new Date().toISOString(),
      node: process.version,
      platform: `${os.type()} ${os.release()}`,
      groups: results.map(({ report, rows, counts, duration }) => ({
        report: path.relative(root, report).replace(/\\/g, "/"),
        total: rows.length,
        ran: rows.filter((row) => row.record).length,
        counts,
        durationMs: duration,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(`Generated execution reports for run ${RUN_ID}.`);
for (const result of results) {
  console.log(
    `${path.relative(root, result.report)}: PASS=${result.counts.PASS} FAIL=${result.counts.FAIL} BLOCKED=${result.counts.BLOCKED} NOT AUTOMATED=${result.counts["NOT AUTOMATED"]}`,
  );
}
