const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const sqlite3 = require(path.resolve(__dirname, "../../../backend/node_modules/sqlite3"));

const RUN_ID = process.env.ESHOP_TEST_RUN_ID || new Date().toISOString().replace(/[-:.TZ]/g, "");
const RUN_DIR = path.resolve(
  __dirname,
  "..",
  "test-results",
  "executions",
  RUN_ID,
);
const API_URL = process.env.ESHOP_API_URL || "http://localhost:3000/api";
const ADMIN_EMAIL = process.env.ESHOP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ESHOP_ADMIN_PASSWORD;
const UI_ORIGINS = new Set([
  process.env.ESHOP_WEB_URL || "http://localhost:5173",
  process.env.ESHOP_ADMIN_URL || "http://localhost:5174",
].map((url) => new URL(url).origin));
const JSON_HEADERS = { "Content-Type": "application/json" };

function uniqueTag(suffix) {
  return `QA${RUN_ID.replace(/[^a-zA-Z0-9]/g, "").slice(-16)}${suffix}`.toUpperCase();
}

function uniqueEmail(suffix) {
  return `${uniqueTag(suffix).toLowerCase()}@example.test`;
}

function randomPassword() {
  return crypto.randomBytes(18).toString("base64url");
}

function apiUrl(endpoint) {
  return `${API_URL}${endpoint}`;
}

function jsonData(value) {
  return JSON.stringify(value);
}

function writeResult(fr, record) {
  const directory = path.join(RUN_DIR, fr);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, `${record.id}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
}

function defineCase(test, fr, metadata, action) {
  test(`${metadata.id} - ${metadata.description}`, async ({ page, request }, testInfo) => {
    const startedAt = new Date().toISOString();
    const started = Date.now();
    let result;
    let status;

    try {
      result = await action({ page, request }, testInfo);
      status = result && result.status ? result.status : result && result.pass ? "PASS" : "FAIL";
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      status =
        (error && error.code === "ECONNREFUSED") ||
        /thiếu ESHOP_|không đăng nhập được Admin/i.test(message)
          ? "BLOCKED"
          : "FAIL";
      result = {
        observed: message,
      };
    }

    let screenshotPath = null;
    let screenshotError = null;
    let screenshotSkippedReason = null;
    const currentUrl = page.url();
    if (currentUrl !== "about:blank" && UI_ORIGINS.has(new URL(currentUrl).origin)) {
      try {
        const screenshotDirectory = path.join(RUN_DIR, fr, "screenshots");
        fs.mkdirSync(screenshotDirectory, { recursive: true });
        const screenshotFile = path.join(screenshotDirectory, `${metadata.id}-${status}.png`);
        await page.screenshot({ path: screenshotFile, fullPage: true });
        screenshotPath = path.relative(path.join(RUN_DIR, fr), screenshotFile).replace(/\\/g, "/");
        await testInfo.attach(`${metadata.id}-${status}.png`, {
          path: screenshotFile,
          contentType: "image/png",
        });
      } catch (error) {
        screenshotError = error && error.message ? error.message : String(error);
      }
    } else {
      screenshotSkippedReason = currentUrl === "about:blank"
        ? "No UI page was opened; use the API response and JSON log as evidence."
        : `Page origin is not a configured UI origin: ${currentUrl}`;
    }

    const record = {
      id: metadata.id,
      source: metadata.source,
      description: metadata.description,
      expected: metadata.expected,
      actual: result && Object.prototype.hasOwnProperty.call(result, "observed")
        ? result.observed
        : result,
      status,
      startedAt,
      durationMs: Date.now() - started,
      screenshotPath,
      screenshotSkippedReason,
      screenshotError,
    };

    writeResult(fr, record);
    await testInfo.attach("execution-result.json", {
      body: Buffer.from(JSON.stringify(record, null, 2)),
      contentType: "application/json",
    });

    if (status !== "PASS") {
      throw new Error(`${metadata.id}: expected PASS, got ${status}`);
    }
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const file = path.resolve(__dirname, "../../../backend/database.sqlite");
    const db = new sqlite3.Database(file, (error) => {
      if (error) reject(error);
      else resolve(db);
    });
  });
}

function runSql(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function getSql(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });
}

async function deleteTestUser(email) {
  const db = await openDatabase();
  try {
    const user = await getSql(db, "SELECT id FROM users WHERE email = ?", [email]);
    if (user) {
      await runSql(db, "DELETE FROM coupon_usage WHERE user_id = ?", [user.id]);
      await runSql(db, "DELETE FROM users WHERE id = ?", [user.id]);
    }
  } finally {
    await closeDatabase(db);
  }
}

async function deleteTestUserById(id, expectedEmail) {
  const db = await openDatabase();
  try {
    const user = await getSql(
      db,
      "SELECT id FROM users WHERE id = ? AND email = ?",
      [Number(id), expectedEmail],
    );
    if (user) {
      await runSql(db, "DELETE FROM coupon_usage WHERE user_id = ?", [user.id]);
      await runSql(db, "DELETE FROM users WHERE id = ? AND email = ?", [user.id, expectedEmail]);
    }
  } finally {
    await closeDatabase(db);
  }
}

async function deleteCouponsByPrefix(prefix) {
  const db = await openDatabase();
  try {
    await runSql(
      db,
      "DELETE FROM coupon_usage WHERE coupon_id IN (SELECT id FROM coupons WHERE code LIKE ?)",
      [`${prefix}%`],
    );
    await runSql(db, "DELETE FROM coupons WHERE code LIKE ?", [`${prefix}%`]);
  } finally {
    await closeDatabase(db);
  }
}

function adminCredentials() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Thiếu ESHOP_ADMIN_EMAIL hoặc ESHOP_ADMIN_PASSWORD; không thể chạy các test cần tài khoản Admin.",
    );
  }
  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
}

async function loginAdminApi(request) {
  const response = await request.post(apiUrl("/login"), {
    headers: JSON_HEADERS,
    data: jsonData(adminCredentials()),
  });
  const body = await response.json();
  if (!response.ok() || !body.token || !body.user || body.user.role !== "admin") {
    throw new Error(
      `Không đăng nhập được Admin (HTTP ${response.status()}): ${body.error || "invalid admin account"}`,
    );
  }
  return body.token;
}

async function createApiUser(request, suffix, testInfo) {
  const email = uniqueEmail(suffix);
  const password = randomPassword();
  const response = await request.post(apiUrl("/register"), {
    headers: JSON_HEADERS,
    data: jsonData({ name: `QA ${suffix}`, email, password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok()) {
    throw new Error(`Không tạo được tài khoản test (HTTP ${response.status()}): ${body.error || "unknown error"}`);
  }
  testInfo.annotations.push({ type: "test-user", description: email });
  return { email, password, id: body.id };
}

async function loginUserUi(page, user) {
  await page.goto("/login");
  await page.locator("input").nth(0).fill(user.email);
  await page.locator("input").nth(1).fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
}

async function cleanupTrackedUsers(testInfo) {
  for (const annotation of testInfo.annotations.filter((item) => item.type === "test-user")) {
    await deleteTestUser(annotation.description);
  }
  for (const annotation of testInfo.annotations.filter((item) => item.type === "test-user-id")) {
    const { id, email } = JSON.parse(annotation.description);
    await deleteTestUserById(id, email);
  }
}

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_URL,
  JSON_HEADERS,
  RUN_DIR,
  RUN_ID,
  adminCredentials,
  apiUrl,
  cleanupTrackedUsers,
  closeDatabase,
  createApiUser,
  defineCase,
  deleteCouponsByPrefix,
  deleteTestUser,
  deleteTestUserById,
  getSql,
  jsonData,
  loginAdminApi,
  loginUserUi,
  openDatabase,
  randomPassword,
  runSql,
  uniqueEmail,
  uniqueTag,
  writeResult,
};
