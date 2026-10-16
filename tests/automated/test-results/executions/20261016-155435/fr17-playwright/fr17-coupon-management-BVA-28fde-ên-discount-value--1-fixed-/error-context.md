# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr17-coupon-management.spec.js >> BVA-FR17-04 - Kiểm tra biên discount_value = -1 (fixed)
- Location: helpers\runtime.js:50:3

# Error details

```
Error: BVA-FR17-04: expected PASS, got FAIL
```

# Test source

```ts
  1   | const fs = require("node:fs");
  2   | const path = require("node:path");
  3   | const crypto = require("node:crypto");
  4   | const sqlite3 = require(path.resolve(__dirname, "../../../backend/node_modules/sqlite3"));
  5   | 
  6   | const RUN_ID = process.env.ESHOP_TEST_RUN_ID || new Date().toISOString().replace(/[-:.TZ]/g, "");
  7   | const RUN_DIR = path.resolve(
  8   |   __dirname,
  9   |   "..",
  10  |   "test-results",
  11  |   "executions",
  12  |   RUN_ID,
  13  | );
  14  | const API_URL = process.env.ESHOP_API_URL || "http://localhost:3000/api";
  15  | const ADMIN_EMAIL = process.env.ESHOP_ADMIN_EMAIL;
  16  | const ADMIN_PASSWORD = process.env.ESHOP_ADMIN_PASSWORD;
  17  | const JSON_HEADERS = { "Content-Type": "application/json" };
  18  | 
  19  | function uniqueTag(suffix) {
  20  |   return `QA${RUN_ID.replace(/[^a-zA-Z0-9]/g, "").slice(-16)}${suffix}`.toUpperCase();
  21  | }
  22  | 
  23  | function uniqueEmail(suffix) {
  24  |   return `${uniqueTag(suffix).toLowerCase()}@example.test`;
  25  | }
  26  | 
  27  | function randomPassword() {
  28  |   return crypto.randomBytes(18).toString("base64url");
  29  | }
  30  | 
  31  | function apiUrl(endpoint) {
  32  |   return `${API_URL}${endpoint}`;
  33  | }
  34  | 
  35  | function jsonData(value) {
  36  |   return JSON.stringify(value);
  37  | }
  38  | 
  39  | function writeResult(fr, record) {
  40  |   const directory = path.join(RUN_DIR, fr);
  41  |   fs.mkdirSync(directory, { recursive: true });
  42  |   fs.writeFileSync(
  43  |     path.join(directory, `${record.id}.json`),
  44  |     `${JSON.stringify(record, null, 2)}\n`,
  45  |     "utf8",
  46  |   );
  47  | }
  48  | 
  49  | function defineCase(test, fr, metadata, action) {
  50  |   test(`${metadata.id} - ${metadata.description}`, async ({ page, request }, testInfo) => {
  51  |     const startedAt = new Date().toISOString();
  52  |     const started = Date.now();
  53  |     let result;
  54  |     let status;
  55  | 
  56  |     try {
  57  |       result = await action({ page, request }, testInfo);
  58  |       status = result && result.status ? result.status : result && result.pass ? "PASS" : "FAIL";
  59  |     } catch (error) {
  60  |       const message = error && error.message ? error.message : String(error);
  61  |       status =
  62  |         (error && error.code === "ECONNREFUSED") ||
  63  |         /thiếu ESHOP_|không đăng nhập được Admin/i.test(message)
  64  |           ? "BLOCKED"
  65  |           : "FAIL";
  66  |       result = {
  67  |         observed: message,
  68  |       };
  69  |     }
  70  | 
  71  |     const record = {
  72  |       id: metadata.id,
  73  |       source: metadata.source,
  74  |       description: metadata.description,
  75  |       expected: metadata.expected,
  76  |       actual: result && Object.prototype.hasOwnProperty.call(result, "observed")
  77  |         ? result.observed
  78  |         : result,
  79  |       status,
  80  |       startedAt,
  81  |       durationMs: Date.now() - started,
  82  |     };
  83  | 
  84  |     writeResult(fr, record);
  85  |     await testInfo.attach("execution-result.json", {
  86  |       body: Buffer.from(JSON.stringify(record, null, 2)),
  87  |       contentType: "application/json",
  88  |     });
  89  | 
  90  |     if (status !== "PASS") {
> 91  |       throw new Error(`${metadata.id}: expected PASS, got ${status}`);
      |             ^ Error: BVA-FR17-04: expected PASS, got FAIL
  92  |     }
  93  |   });
  94  | }
  95  | 
  96  | function openDatabase() {
  97  |   return new Promise((resolve, reject) => {
  98  |     const file = path.resolve(__dirname, "../../../backend/database.sqlite");
  99  |     const db = new sqlite3.Database(file, (error) => {
  100 |       if (error) reject(error);
  101 |       else resolve(db);
  102 |     });
  103 |   });
  104 | }
  105 | 
  106 | function runSql(db, sql, params = []) {
  107 |   return new Promise((resolve, reject) => {
  108 |     db.run(sql, params, function onRun(error) {
  109 |       if (error) reject(error);
  110 |       else resolve({ changes: this.changes, lastID: this.lastID });
  111 |     });
  112 |   });
  113 | }
  114 | 
  115 | function getSql(db, sql, params = []) {
  116 |   return new Promise((resolve, reject) => {
  117 |     db.get(sql, params, (error, row) => {
  118 |       if (error) reject(error);
  119 |       else resolve(row);
  120 |     });
  121 |   });
  122 | }
  123 | 
  124 | function closeDatabase(db) {
  125 |   return new Promise((resolve, reject) => {
  126 |     db.close((error) => (error ? reject(error) : resolve()));
  127 |   });
  128 | }
  129 | 
  130 | async function deleteTestUser(email) {
  131 |   const db = await openDatabase();
  132 |   try {
  133 |     const user = await getSql(db, "SELECT id FROM users WHERE email = ?", [email]);
  134 |     if (user) {
  135 |       await runSql(db, "DELETE FROM coupon_usage WHERE user_id = ?", [user.id]);
  136 |       await runSql(db, "DELETE FROM users WHERE id = ?", [user.id]);
  137 |     }
  138 |   } finally {
  139 |     await closeDatabase(db);
  140 |   }
  141 | }
  142 | 
  143 | async function deleteTestUserById(id, expectedEmail) {
  144 |   const db = await openDatabase();
  145 |   try {
  146 |     const user = await getSql(
  147 |       db,
  148 |       "SELECT id FROM users WHERE id = ? AND email = ?",
  149 |       [Number(id), expectedEmail],
  150 |     );
  151 |     if (user) {
  152 |       await runSql(db, "DELETE FROM coupon_usage WHERE user_id = ?", [user.id]);
  153 |       await runSql(db, "DELETE FROM users WHERE id = ? AND email = ?", [user.id, expectedEmail]);
  154 |     }
  155 |   } finally {
  156 |     await closeDatabase(db);
  157 |   }
  158 | }
  159 | 
  160 | async function deleteCouponsByPrefix(prefix) {
  161 |   const db = await openDatabase();
  162 |   try {
  163 |     await runSql(
  164 |       db,
  165 |       "DELETE FROM coupon_usage WHERE coupon_id IN (SELECT id FROM coupons WHERE code LIKE ?)",
  166 |       [`${prefix}%`],
  167 |     );
  168 |     await runSql(db, "DELETE FROM coupons WHERE code LIKE ?", [`${prefix}%`]);
  169 |   } finally {
  170 |     await closeDatabase(db);
  171 |   }
  172 | }
  173 | 
  174 | function adminCredentials() {
  175 |   if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  176 |     throw new Error(
  177 |       "Thiếu ESHOP_ADMIN_EMAIL hoặc ESHOP_ADMIN_PASSWORD; không thể chạy các test cần tài khoản Admin.",
  178 |     );
  179 |   }
  180 |   return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  181 | }
  182 | 
  183 | async function loginAdminApi(request) {
  184 |   const response = await request.post(apiUrl("/login"), {
  185 |     headers: JSON_HEADERS,
  186 |     data: jsonData(adminCredentials()),
  187 |   });
  188 |   const body = await response.json();
  189 |   if (!response.ok() || !body.token || !body.user || body.user.role !== "admin") {
  190 |     throw new Error(
  191 |       `Không đăng nhập được Admin (HTTP ${response.status()}): ${body.error || "invalid admin account"}`,
```