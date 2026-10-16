const fs = require("node:fs");
const path = require("node:path");
const { inflateRawSync } = require("node:zlib");

const root = path.resolve(__dirname, "../..");
const executionRoot = path.join(__dirname, "test-results", "executions");
const evidenceRoot = path.join(root, "evidence");
const baselineRunId = process.env.ESHOP_EVIDENCE_BASELINE_RUN_ID || "20261016-155435";
const supplementRunIds = (process.env.ESHOP_EVIDENCE_SUPPLEMENT_RUN_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const frs = [
  { directory: "FR-01-registration", key: "fr01", title: "FR-01 Registration" },
  { directory: "FR-09-coupons", key: "fr09", title: "FR-09 Coupons" },
  { directory: "FR-17-coupon-management", key: "fr17", title: "FR-17 Coupon Management" },
];
const apiOnlyCases = new Set([
  "fr01:TC04", "fr01:TC05", "fr01:TC06", "fr01:TC07", "fr01:TC08", "fr01:TC09", "fr01:TC10",
  "fr09:TC09-07",
  "fr17:TC17-05", "fr17:TC17-06",
]);
const notAutomated = new Set(["fr01:TC11", "fr01:TC12"]);

function collectCases(fr) {
  const files = ["domain-testing.md", "bva.md"];
  const cases = new Map();
  for (const file of files) {
    const contents = fs.readFileSync(path.join(root, fr.directory, file), "utf8");
    const pattern = /^\|\s*((?:TC\d{2}(?:-\d{2})?|BVA-FR\d+-\d+))\s*\|/gm;
    for (const match of contents.matchAll(pattern)) {
      cases.set(match[1], match[1].startsWith("BVA-") ? "BVA" : "Domain Testing");
    }
  }
  return cases;
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function copyFile(source, destination) {
  ensureDirectory(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function fileExists(file) {
  return Boolean(file && fs.existsSync(file) && fs.statSync(file).isFile());
}

function validPng(file) {
  if (!fileExists(file)) return false;
  const buffer = fs.readFileSync(file);
  return buffer.length > 24 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.toString("ascii", 12, 16) === "IHDR" &&
    buffer.readUInt32BE(16) > 0 &&
    buffer.readUInt32BE(20) > 0;
}

function filesRecursively(directory, extension) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursively(fullPath, extension);
    return entry.isFile() && fullPath.toLowerCase().endsWith(extension) ? [fullPath] : [];
  });
}

function traceTitle(zipFile) {
  if (!fileExists(zipFile)) return "";
  const zip = fs.readFileSync(zipFile);
  let directoryOffset = -1;
  for (let offset = zip.length - 22; offset >= Math.max(0, zip.length - 65557); offset -= 1) {
    if (zip.readUInt32LE(offset) === 0x06054b50) {
      directoryOffset = zip.readUInt32LE(offset + 16);
      break;
    }
  }
  if (directoryOffset < 0) return "";

  const entryCount = zip.readUInt16LE(directoryOffset + 10);
  let offset = directoryOffset + 46;
  for (let entry = 0; entry < entryCount; entry += 1) {
    if (zip.readUInt32LE(offset - 46) !== 0x02014b50) return "";
    const method = zip.readUInt16LE(offset - 46 + 10);
    const compressedSize = zip.readUInt32LE(offset - 46 + 20);
    const nameLength = zip.readUInt16LE(offset - 46 + 28);
    const extraLength = zip.readUInt16LE(offset - 46 + 30);
    const commentLength = zip.readUInt16LE(offset - 46 + 32);
    const localOffset = zip.readUInt32LE(offset - 46 + 42);
    const name = zip.toString("utf8", offset, offset + nameLength);
    if (name.endsWith(".trace") && name !== "test.trace") {
      const localNameLength = zip.readUInt16LE(localOffset + 26);
      const localExtraLength = zip.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = zip.subarray(dataStart, dataStart + compressedSize);
      const data = method === 8 ? inflateRawSync(compressed) : compressed;
      const firstLine = data.toString("utf8").split(/\r?\n/, 1)[0];
      try {
        return JSON.parse(firstLine).title || "";
      } catch {
        return "";
      }
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return "";
}

function assetMatchesCase(file, fr, id) {
  if (file.split(path.sep).some((part) => part.includes(id))) return true;
  const traceFile = path.join(path.dirname(file), "trace.zip");
  const title = traceTitle(traceFile);
  return Boolean(title && title.includes(`${id} -`));
}

function markdownLink(label, file, fromDirectory) {
  if (!file) return "";
  const relative = path.relative(fromDirectory, file).replace(/\\/g, "/");
  return `[${label}](./${relative})`;
}

function evidenceCaseDirectory(fr, id) {
  return path.join(evidenceRoot, fr.directory, id);
}

function saveRecord(fr, runId, record, sourceFile, isSupplement) {
  const directory = evidenceCaseDirectory(fr, record.id);
  const jsonFile = path.join(directory, "logs", `${runId}.json`);
  copyFile(sourceFile, jsonFile);

  let screenshotFile = null;
  if (record.screenshotPath) {
    const runScreenshot = path.join(executionRoot, runId, fr.key, record.screenshotPath.split("/").join(path.sep));
    if (validPng(runScreenshot)) {
      screenshotFile = path.join(
        directory,
        "screenshots",
        `${runId}-${record.id}-${record.status}.png`,
      );
      copyFile(runScreenshot, screenshotFile);
    }
  } else if (!isSupplement && !apiOnlyCases.has(`${fr.key}:${record.id}`)) {
    const playwrightDirectory = path.join(executionRoot, runId, `${fr.key}-playwright`);
    const screenshots = filesRecursively(playwrightDirectory, ".png")
      .filter((file) => assetMatchesCase(file, fr, record.id));
    if (screenshots.length > 1) {
      throw new Error(`Ambiguous historical screenshots for ${fr.key}/${record.id}: ${screenshots.join(", ")}`);
    }
    if (screenshots.length === 1 && validPng(screenshots[0])) {
      screenshotFile = path.join(
        directory,
        "screenshots",
        `${runId}-${record.id}-${record.status}.png`,
      );
      copyFile(screenshots[0], screenshotFile);
    }
  }

  const playwrightDirectory = path.join(executionRoot, runId, `${fr.key}-playwright`);
  const traces = filesRecursively(playwrightDirectory, ".zip")
    .filter((file) => assetMatchesCase(file, fr, record.id));
  if (traces.length > 1) {
    throw new Error(`Ambiguous historical traces for ${fr.key}/${record.id}: ${traces.join(", ")}`);
  }
  let traceFile = null;
  if (traces.length === 1) {
    traceFile = path.join(directory, "traces", `${runId}-${record.id}-trace.zip`);
    copyFile(traces[0], traceFile);
  }

  return { frKey: fr.key, record, runId, jsonFile, screenshotFile, traceFile, isSupplement };
}

function loadRun(fr, runId, isSupplement) {
  const sourceDirectory = path.join(executionRoot, runId, fr.key);
  if (!fs.existsSync(sourceDirectory)) {
    if (isSupplement) return [];
    throw new Error(`Execution results not found: ${sourceDirectory}`);
  }
  return fs.readdirSync(sourceDirectory)
    .filter((name) => name.endsWith(".json") && name !== "summary.json")
    .map((name) => {
      const sourceFile = path.join(sourceDirectory, name);
      const record = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
      return saveRecord(fr, runId, record, sourceFile, isSupplement);
    });
}

function copyConsoleLog(fr, runId) {
  const source = path.join(executionRoot, runId, `${fr.key}-console.log`);
  if (!fileExists(source)) return null;
  const destination = path.join(evidenceRoot, fr.directory, "_runs", `${runId}-console.log`);
  copyFile(source, destination);
  return destination;
}

function reportSupplement(fr, runId, entries, consoleLog) {
  if (!entries.length) return;
  const reportFile = path.join(root, fr.directory, "execution-results.md");
  let contents = fs.readFileSync(reportFile, "utf8");
  const heading = "## Evidence bổ sung";
  const runHeading = `### Run \`${runId}\``;
  const headingIndex = contents.indexOf(`\n${heading}`);
  if (headingIndex < 0) {
    contents = `${contents.trimEnd()}\n\n${heading}\n`;
  }
  const currentHeadingIndex = contents.indexOf(`\n${runHeading}`);
  if (currentHeadingIndex >= 0) {
    const nextRunIndex = contents.indexOf("\n### Run `", currentHeadingIndex + 1);
    contents = nextRunIndex >= 0
      ? `${contents.slice(0, currentHeadingIndex)}${contents.slice(nextRunIndex)}`
      : contents.slice(0, currentHeadingIndex);
  }
  const reportDirectory = path.dirname(reportFile);
  const rows = entries.map((entry) => {
    const links = [
      entry.screenshotFile && markdownLink("screenshot", entry.screenshotFile, reportDirectory),
      markdownLink("JSON", entry.jsonFile, reportDirectory),
      entry.traceFile && markdownLink("trace", entry.traceFile, reportDirectory),
    ].filter(Boolean).join(" · ");
    return `| ${entry.record.id} | ${entry.record.status} | \`${entry.runId}\` | ${links || "Chưa có screenshot hoặc trace"} |`;
  });
  const consoleLink = consoleLog
    ? `- Console log của lần chạy bổ sung: ${markdownLink("console log", consoleLog, reportDirectory)}.`
    : "- Không có console log riêng cho lần chạy bổ sung.";
  const supplement = [
    "",
    runHeading,
    "",
    "Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.",
    "",
    consoleLink,
    "",
    "| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |",
    "|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
  fs.writeFileSync(reportFile, `${contents.trimEnd()}\n${supplement}`, "utf8");
}

function renderIndex(entriesByRun, unclassified) {
  const indexFile = path.join(evidenceRoot, "evidence-index.md");
  const rows = [];
  const screenshotIds = new Set();
  const jsonIds = new Set();
  const logOnlyIds = new Set();
  const missingIds = new Set();

  for (const fr of frs) {
    const cases = collectCases(fr);
    for (const [id, source] of cases) {
      const baseline = (entriesByRun.get(baselineRunId) || [])
        .find((entry) => entry.frKey === fr.key && entry.record.id === id);
      const runEntries = [
        baseline,
        ...supplementRunIds.flatMap((runId) =>
          (entriesByRun.get(runId) || []).filter(
            (entry) => entry.frKey === fr.key && entry.record.id === id,
          ),
        ),
      ].filter(Boolean);

      if (notAutomated.has(`${fr.key}:${id}`)) {
        rows.push({
          fr,
          id,
          source,
          status: "NOT AUTOMATED",
          screenshot: "Chưa có screenshot",
          log: "Không có execution JSON",
          trace: "Không có",
          execution: baselineRunId,
          note: "UI và API hiện không hỗ trợ trường xác nhận mật khẩu.",
        });
        continue;
      }

      if (!runEntries.length) {
        rows.push({
          fr,
          id,
          source,
          status: "BLOCKED",
          screenshot: "Chưa có screenshot",
          log: "Không có execution JSON",
          trace: "Không có",
          execution: baselineRunId,
          note: "Không tìm thấy execution record cho test case.",
        });
        missingIds.add(`${fr.key}:${id}`);
        continue;
      }

      for (const entry of runEntries) {
        const laterScreenshot = !entry.screenshotFile
          ? runEntries.find((candidate) => candidate.screenshotFile)
          : null;
        const screenshot = entry.screenshotFile
          ? markdownLink("screenshot", entry.screenshotFile, path.dirname(indexFile))
          : laterScreenshot
            ? `Không có ở run này; bổ sung ở \`${laterScreenshot.runId}\`: ${markdownLink("screenshot", laterScreenshot.screenshotFile, path.dirname(indexFile))}`
            : "Chưa có screenshot";
        const log = markdownLink("JSON", entry.jsonFile, path.dirname(indexFile));
        const trace = entry.traceFile
          ? markdownLink("trace", entry.traceFile, path.dirname(indexFile))
          : "Không có";
        const apiOnly = apiOnlyCases.has(`${fr.key}:${id}`);
        const captureError = entry.record.screenshotError || "";
        const note = apiOnly
          ? "API-only: response/JSON là evidence phù hợp; PNG trình duyệt trống từ lần cũ (nếu có) được loại khỏi evidence."
          : captureError
            ? `Screenshot capture error: ${captureError}`
            : entry.screenshotFile
              ? "Screenshot ánh xạ theo test ID và execution record."
              : laterScreenshot
                ? `Screenshot có ở lần chạy bổ sung, không thuộc execution lịch sử \`${entry.runId}\`.`
              : "Screenshot chưa được tạo hoặc chưa xác minh.";
        rows.push({
          fr,
          id,
          source,
          status: entry.record.status,
          screenshot,
          log,
          trace,
          execution: entry.runId,
          note,
        });
        if (entry.screenshotFile) screenshotIds.add(`${fr.key}:${id}`);
        if (entry.jsonFile) jsonIds.add(`${fr.key}:${id}`);
        else missingIds.add(`${fr.key}:${id}`);
      }
    }
  }

  for (const id of jsonIds) {
    if (!screenshotIds.has(id)) logOnlyIds.add(id);
  }

  const tableRows = rows.map((row) =>
    `| ${row.fr.title} | ${row.id} | ${row.source} | ${row.status} | ${row.screenshot} | ${row.log} | ${row.trace} | \`${row.execution}\` | ${row.note.replace(/\|/g, "\\|")} |`,
  );
  const allEntries = [...entriesByRun.values()].flat();
  const summary = frs.map((item) => {
    const sourceCases = collectCases(item);
    const historical = entriesByRun.get(baselineRunId) || [];
    const historicalForFr = historical.filter((entry) => entry.frKey === item.key && sourceCases.has(entry.record.id));
    const historicalStatuses = ["PASS", "FAIL", "BLOCKED"].map((status) =>
      `${status} ${historicalForFr.filter((entry) => entry.record.status === status).length}`,
    ).join(", ");
    const supplement = supplementRunIds.flatMap((runId) => entriesByRun.get(runId) || [])
      .filter((entry) => entry.frKey === item.key && sourceCases.has(entry.record.id));
    const screenshotCount = [...sourceCases.keys()].filter((id) =>
      screenshotIds.has(`${item.key}:${id}`),
    ).length;
    const automatedCount = [...sourceCases.keys()].filter((id) =>
      !notAutomated.has(`${item.key}:${id}`),
    ).length;
    const onlyLogCount = [...sourceCases.keys()].filter((id) =>
      logOnlyIds.has(`${item.key}:${id}`),
    ).length;
    const missingCount = [...sourceCases.keys()].filter((id) =>
      missingIds.has(`${item.key}:${id}`),
    ).length;
    return [
      `### ${item.title}`,
      "",
      `- Test case thiết kế: ${sourceCases.size}.`,
      `- Tự động hóa: ${automatedCount}; NOT AUTOMATED: ${sourceCases.size - automatedCount}.`,
      `- Lần chạy lịch sử \`${baselineRunId}\`: ${historicalForFr.length} test; ${historicalStatuses}.`,
      `- Lần chạy bổ sung: ${supplement.filter((entry) => entry.runId !== baselineRunId).length} test execution.`,
      `- Test case có screenshot hợp lệ (ít nhất một lần chạy): ${screenshotCount}.`,
      `- Test case chỉ có JSON/log: ${onlyLogCount}.`,
      `- Test case còn thiếu evidence: ${missingCount}.`,
      "",
    ].join("\n");
  });
  const unclassifiedLines = unclassified.length
    ? unclassified.map((file) => `- \`${path.relative(root, file).replace(/\\/g, "/")}\` — UNVERIFIED.`)
    : ["- Không có file screenshot/trace chưa phân loại trong các thư mục Playwright đã xử lý."];
  const runConsoleLinks = frs.flatMap((item) => {
    const links = [baselineRunId, ...supplementRunIds].map((runId) => {
      const file = path.join(evidenceRoot, item.directory, "_runs", `${runId}-console.log`);
      return fileExists(file) ? `[\`${runId}\` ${item.key} console](./${path.relative(evidenceRoot, file).replace(/\\/g, "/")})` : null;
    }).filter(Boolean);
    return links.length ? [`- ${item.title}: ${links.join(", ")}`] : [];
  });

  const output = [
    "# Evidence index — FR-01, FR-09, FR-17",
    "",
    `Lần chạy gốc được bảo toàn: \`${baselineRunId}\`. Các lần chạy bổ sung được liệt kê riêng; không thay thế trạng thái lịch sử.`,
    "",
    "| FR | Test Case ID | Test Source | Actual Status | Screenshot | Log/JSON | Trace/Error Context | Execution ID | Ghi chú |",
    "|---|---|---|---|---|---|---|---|---|",
    ...tableRows,
    "",
    "## Tổng hợp",
    "",
    ...summary,
    "### Console logs",
    "",
    ...runConsoleLinks,
    "",
    "### Evidence chưa phân loại",
    "",
    ...unclassifiedLines,
    "",
  ].join("\n");
  fs.writeFileSync(indexFile, output, "utf8");
  return { screenshotIds, logOnlyIds, missingIds, allEntries };
}

function findUnclassifiedAssets() {
  const unclassified = [];
  for (const runId of [baselineRunId, ...supplementRunIds]) {
    for (const fr of frs) {
      const directory = path.join(executionRoot, runId, `${fr.key}-playwright`);
      const knownIds = new Set(collectCases(fr).keys());
      for (const extension of [".png", ".zip"]) {
        for (const file of filesRecursively(directory, extension)) {
          const matches = [...knownIds].filter((id) => assetMatchesCase(file, fr, id));
          if (matches.length !== 1) unclassified.push(file);
        }
      }
    }
  }
  return unclassified;
}

function main() {
  const entriesByRun = new Map();
  for (const runId of [baselineRunId, ...supplementRunIds]) {
    const entries = [];
    for (const fr of frs) {
      const runEntries = loadRun(fr, runId, runId !== baselineRunId);
      entries.push(...runEntries);
      const consoleLog = copyConsoleLog(fr, runId);
      if (runId !== baselineRunId) reportSupplement(fr, runId, runEntries, consoleLog);
      if (runId === baselineRunId) {
        const reportFile = path.join(root, fr.directory, "execution-results.md");
        let contents = fs.readFileSync(reportFile, "utf8");
        const evidenceById = new Map(runEntries.map((entry) => [entry.record.id, entry]));
        contents = contents.split("\n").map((line) => {
          const match = line.match(/^\|\s*((?:TC\d{2}(?:-\d{2})?|BVA-FR\d+-\d+))\s*\|/);
          if (!match || line.includes("| Test Case ID |")) return line;
          const entry = evidenceById.get(match[1]);
          if (!entry) return line;
          const columns = line.split("|");
          const links = [
            markdownLink("JSON", entry.jsonFile, path.dirname(reportFile)),
            entry.screenshotFile && markdownLink("screenshot", entry.screenshotFile, path.dirname(reportFile)),
            entry.traceFile && markdownLink("trace", entry.traceFile, path.dirname(reportFile)),
          ].filter(Boolean);
          columns[columns.length - 2] = ` ${links.join(" · ")} `;
          return columns.join("|");
        }).join("\n");
        fs.writeFileSync(reportFile, contents, "utf8");
      }
    }
    entriesByRun.set(runId, entries);
  }

  const result = renderIndex(entriesByRun, findUnclassifiedAssets());
  console.log(`Evidence index generated: ${path.join(evidenceRoot, "evidence-index.md")}`);
  console.log(`Supplemental execution IDs: ${supplementRunIds.join(", ") || "(none)"}`);
  for (const fr of frs) {
    const caseIds = [...collectCases(fr).keys()];
    console.log(
      `${fr.directory}: designed=${caseIds.length}, screenshots=${caseIds.filter((id) => result.screenshotIds.has(`${fr.key}:${id}`)).length}, log-only=${caseIds.filter((id) => result.logOnlyIds.has(`${fr.key}:${id}`)).length}, missing=${caseIds.filter((id) => result.missingIds.has(`${fr.key}:${id}`)).length}`,
    );
  }
  console.log(`Indexed execution records: ${result.allEntries.length}`);
}

main();
