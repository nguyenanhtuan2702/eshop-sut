const { test } = require("@playwright/test");
const {
  API_URL,
  JSON_HEADERS,
  RUN_ID,
  cleanupTrackedUsers,
  closeDatabase,
  createApiUser,
  defineCase,
  deleteCouponsByPrefix,
  jsonData,
  loginAdminApi,
  loginUserUi,
  openDatabase,
  runSql,
  uniqueTag,
} = require("./helpers/runtime");

const prefix = uniqueTag("");
const localCoupons = {
  inactive: `${prefix}OFF`,
  yesterday: `${prefix}YESTERDAY`,
  today: `${prefix}TODAY`,
  tomorrow: `${prefix}TOMORROW`,
};

let adminToken;
let couponIds = {};
let adminApi;

test.beforeAll(async ({ playwright }) => {
  adminApi = await playwright.request.newContext();
  adminToken = await loginAdminApi(adminApi);
  const headers = { Authorization: `Bearer ${adminToken}` };
  const seededResponse = await adminApi.get(`${API_URL}/coupons`, { headers });
  const seeded = await seededResponse.json();
  for (const code of ["SAVE10", "BIGBUY", "VIP100", "EXPIRED"]) {
    const coupon = seeded.find((item) => item.code === code);
    if (!coupon) throw new Error(`Thiếu coupon fixture có sẵn: ${code}`);
    couponIds[code] = coupon.id;
  }

  const today = new Date();
  const isoDate = (date) => date.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fixtures = [
    { code: localCoupons.inactive, type: "percent", discount_value: 10, min_order_amount: 0, expired_at: "2099-12-31", max_uses_per_user: 1 },
    { code: localCoupons.yesterday, type: "percent", discount_value: 1, min_order_amount: 0, expired_at: isoDate(yesterday), max_uses_per_user: 1 },
    { code: localCoupons.today, type: "percent", discount_value: 1, min_order_amount: 0, expired_at: isoDate(today), max_uses_per_user: 1 },
    { code: localCoupons.tomorrow, type: "percent", discount_value: 1, min_order_amount: 0, expired_at: isoDate(tomorrow), max_uses_per_user: 1 },
  ];

  for (const fixture of fixtures) {
    const response = await adminApi.post(`${API_URL}/admin/coupons`, {
      headers: { ...headers, ...JSON_HEADERS },
      data: jsonData(fixture),
    });
    if (!response.ok()) {
      throw new Error(`Không tạo được fixture ${fixture.code} (HTTP ${response.status()})`);
    }
    const body = await response.json();
    couponIds[fixture.code] = body.id;
  }

  const db = await openDatabase();
  try {
    await runSql(db, "UPDATE coupons SET is_active = 0 WHERE id = ?", [
      couponIds[localCoupons.inactive],
    ]);
  } finally {
    await closeDatabase(db);
  }
});

test.afterAll(async () => {
  if (adminApi) {
    await deleteCouponsByPrefix(prefix);
    await adminApi.dispose();
  }
});

test.afterEach(async ({}, testInfo) => {
  await cleanupTrackedUsers(testInfo);
});

async function loginForCoupon(request, page, suffix, testInfo) {
  const user = await createApiUser(request, `${suffix}${RUN_ID}`, testInfo);
  const loginResponse = await request.post(`${API_URL}/login`, {
    headers: JSON_HEADERS,
    data: jsonData({ email: user.email, password: user.password }),
  });
  const loginBody = await loginResponse.json();
  if (!loginResponse.ok() || !loginBody.token) {
    throw new Error(`Không lấy được token cho tài khoản kiểm thử (HTTP ${loginResponse.status()})`);
  }
  user.token = loginBody.token;
  await loginUserUi(page, user);
  return user;
}

async function addUsage(request, user, couponCode, count = 1) {
  const headers = { Authorization: `Bearer ${user.token}` };
  const couponId = couponIds[couponCode];
  for (let index = 0; index < count; index += 1) {
    const response = await request.post(`${API_URL}/coupon-usage`, {
      headers: { ...headers, ...JSON_HEADERS },
      data: jsonData({ coupon_id: couponId }),
    });
    if (!response.ok()) {
      throw new Error(`Không chuẩn bị được lượt dùng cho ${couponCode} (HTTP ${response.status()})`);
    }
  }
}

async function applyInCheckout(page, code, total) {
  await page.goto("/checkout");
  await page.locator('input[type="number"]').fill(String(total));
  await page.getByPlaceholder("Nhập mã giảm giá...").fill(code);
  const responsePromise = page.waitForResponse(
    (response) => response.url() === `${API_URL}/apply-coupon`,
  );
  await page.getByRole("button", { name: "Áp dụng" }).click();
  const response = await responsePromise;
  const responseText = await response.text();
  let body;
  try {
    body = JSON.parse(responseText);
  } catch {
    body = { raw: responseText };
  }
  await page.locator(".text-green-700, p.text-red-600").first().waitFor({ state: "visible" });
  const successLocator = page.locator(".text-green-700");
  const errorLocator = page.locator("p.text-red-600");
  const success = (await successLocator.count()) ? await successLocator.innerText() : "";
  const error = (await errorLocator.count()) ? await errorLocator.innerText() : "";
  return {
    success,
    error,
    applied: response.ok() && body.success === true,
    httpStatus: response.status(),
    responseBody: body,
  };
}

function summaryResponse(result) {
  return {
    applied: result.applied,
    httpStatus: result.httpStatus,
    responseBody: result.responseBody,
    display: result.success,
    error: result.error,
  };
}

const domainCases = [
  {
    id: "TC09-01",
    description: "Áp dụng mã phần trăm SAVE10",
    expected: "Chấp nhận; giảm 50.000 ₫; số tiền cuối cùng 450.000 ₫.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D901", testInfo);
      const actual = await applyInCheckout(page, "SAVE10", 500000);
      return {
        pass: actual.applied &&
          actual.responseBody.discount_amount === 50000 &&
          actual.responseBody.final_amount === 450000,
        observed: { ...summaryResponse(actual), expectedPercent: 10, orderTotal: 500000 },
      };
    },
  },
  {
    id: "TC09-02",
    description: "Từ chối mã không tồn tại",
    expected: "Từ chối áp dụng mã vì mã không tồn tại.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D902", testInfo);
      const actual = await applyInCheckout(page, "NO_SUCH_CODE", 500000);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-03",
    description: "Từ chối mã đang bị vô hiệu hóa",
    expected: "Từ chối áp dụng vì mã tồn tại nhưng không hoạt động.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D903", testInfo);
      const actual = await applyInCheckout(page, localCoupons.inactive, 500000);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-04",
    description: "Từ chối mã EXPIRED",
    expected: "Từ chối áp dụng vì ngày hiện tại không còn trước ngày hết hạn.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D904", testInfo);
      const actual = await applyInCheckout(page, "EXPIRED", 200000);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-05",
    description: "Từ chối đơn hàng thấp hơn ngưỡng BIGBUY",
    expected: "Từ chối vì 499.999 ₫ nhỏ hơn ngưỡng 500.000 ₫.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D905", testInfo);
      const actual = await applyInCheckout(page, "BIGBUY", 499999);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-06",
    description: "Từ chối áp dụng coupon khi chưa đăng nhập",
    expected: "Từ chối áp dụng mã do người dùng chưa đăng nhập.",
    run: async ({ page }) => {
      const actual = await applyInCheckout(page, "SAVE10", 500000);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-07",
    description: "Từ chối JWT không hợp lệ",
    expected: "Từ chối áp dụng mã do JWT không hợp lệ hoặc hết hạn.",
    run: async ({ request }, testInfo) => {
      const user = await createApiUser(request, "D907", testInfo);
      const response = await request.post(`${API_URL}/apply-coupon`, {
        headers: { ...JSON_HEADERS, Authorization: "Bearer invalid-token" },
        data: jsonData({ code: "SAVE10", total_amount: 500000, user_id: user.id }),
      });
      const body = await response.json().catch(() => ({}));
      return {
        pass: !response.ok(),
        observed: { status: response.status(), body },
      };
    },
  },
  {
    id: "TC09-08",
    description: "Từ chối coupon đã dùng hết lượt",
    expected: "Từ chối vì người dùng đã dùng SAVE10 đủ 1 lần.",
    run: async ({ request, page }, testInfo) => {
      const user = await loginForCoupon(request, page, "D908", testInfo);
      await addUsage(request, user, "SAVE10");
      const actual = await applyInCheckout(page, "SAVE10", 500000);
      return { pass: !actual.applied, observed: summaryResponse(actual) };
    },
  },
  {
    id: "TC09-09",
    description: "Áp dụng mã giảm cố định BIGBUY",
    expected: "Chấp nhận; giảm 50.000 ₫; số tiền cuối cùng 450.000 ₫.",
    run: async ({ request, page }, testInfo) => {
      await loginForCoupon(request, page, "D909", testInfo);
      const actual = await applyInCheckout(page, "BIGBUY", 500000);
      return {
        pass: actual.applied &&
          actual.responseBody.discount_amount === 50000 &&
          actual.responseBody.final_amount === 450000,
        observed: { ...summaryResponse(actual), orderTotal: 500000 },
      };
    },
  },
];

for (const item of domainCases) {
  defineCase(
    test,
    "fr09",
    { id: item.id, source: "Domain Testing", description: item.description, expected: item.expected },
    item.run,
  );
}

const bvaCases = [
  {
    id: "BVA-FR09-01",
    description: "Tổng đơn hàng ngay dưới ngưỡng BIGBUY",
    expected: "Từ chối áp dụng mã tại 499.999 ₫.",
    code: "BIGBUY",
    total: 499999,
    usage: 0,
    accepted: false,
  },
  {
    id: "BVA-FR09-02",
    description: "Tổng đơn hàng đúng ngưỡng BIGBUY",
    expected: "Chấp nhận; giảm 50.000 ₫; còn 450.000 ₫.",
    code: "BIGBUY",
    total: 500000,
    usage: 0,
    accepted: true,
    amount: 50000,
    final: 450000,
  },
  {
    id: "BVA-FR09-03",
    description: "Tổng đơn hàng ngay trên ngưỡng BIGBUY",
    expected: "Chấp nhận; giảm 50.000 ₫; còn 450.001 ₫.",
    code: "BIGBUY",
    total: 500001,
    usage: 0,
    accepted: true,
    amount: 50000,
    final: 450001,
  },
  {
    id: "BVA-FR09-04",
    description: "Ngày hết hạn nằm trước T0",
    expected: "Từ chối áp dụng do mã đã hết hạn.",
    code: localCoupons.yesterday,
    total: 500000,
    usage: 0,
    accepted: false,
  },
  {
    id: "BVA-FR09-05",
    description: "Ngày hết hạn bằng T0",
    expected: "Từ chối theo điều kiện ngày hiện tại phải trước ngày hết hạn.",
    code: localCoupons.today,
    total: 500000,
    usage: 0,
    accepted: false,
  },
  {
    id: "BVA-FR09-06",
    description: "Ngày hết hạn nằm sau T0",
    expected: "Chấp nhận điều kiện hạn sử dụng.",
    code: localCoupons.tomorrow,
    total: 500000,
    usage: 0,
    accepted: true,
  },
  {
    id: "BVA-FR09-07",
    description: "Số lượt đã dùng ngay dưới giới hạn VIP100",
    expected: "Chấp nhận khi đã dùng 1 trong tối đa 2 lượt.",
    code: "VIP100",
    total: 500000,
    usage: 1,
    accepted: true,
  },
  {
    id: "BVA-FR09-08",
    description: "Số lượt đã dùng bằng giới hạn VIP100",
    expected: "Từ chối khi đã dùng đủ 2 lượt.",
    code: "VIP100",
    total: 500000,
    usage: 2,
    accepted: false,
  },
  {
    id: "BVA-FR09-09",
    description: "Số lượt đã dùng vượt giới hạn VIP100",
    expected: "Từ chối khi số lượt đã dùng là 3, lớn hơn giới hạn 2.",
    code: "VIP100",
    total: 500000,
    usage: 3,
    accepted: false,
  },
];

for (const item of bvaCases) {
  defineCase(
    test,
    "fr09",
    { id: item.id, source: "BVA", description: item.description, expected: item.expected },
    async ({ request, page }, testInfo) => {
      const user = await loginForCoupon(request, page, item.id.replace(/[^0-9]/g, ""), testInfo);
      if (item.usage) await addUsage(request, user, item.code, item.usage);
      const actual = await applyInCheckout(page, item.code, item.total);
      let pass = item.accepted ? actual.applied : !actual.applied;
      if (item.amount) pass = pass && actual.responseBody.discount_amount === item.amount;
      if (item.final) pass = pass && actual.responseBody.final_amount === item.final;
      return {
        pass,
        observed: {
          ...summaryResponse(actual),
          total: item.total,
          coupon: item.code,
          recordedUseCount: item.usage,
          expectedAccepted: item.accepted,
        },
      };
    },
  );
}
