const { test } = require("@playwright/test");
const {
  API_URL,
  JSON_HEADERS,
  cleanupTrackedUsers,
  defineCase,
  deleteCouponsByPrefix,
  jsonData,
  loginAdminApi,
  uniqueTag,
} = require("./helpers/runtime");

const prefix = uniqueTag("");
let adminToken;
let adminApi;
const adminUrl = process.env.ESHOP_ADMIN_URL || "http://localhost:5174";

test.beforeAll(async ({ playwright }) => {
  adminApi = await playwright.request.newContext();
  adminToken = await loginAdminApi(adminApi);
});

test.afterAll(async () => {
  await deleteCouponsByPrefix(prefix);
  if (adminApi) await adminApi.dispose();
});

test.beforeEach(async ({ page }) => {
  await page.goto(adminUrl);
  await page.getByPlaceholder("Email").fill(process.env.ESHOP_ADMIN_EMAIL);
  await page.getByPlaceholder("Password").fill(process.env.ESHOP_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("heading", { name: "EShop Admin" }).waitFor();
  await page.getByText("Mã Giảm Giá", { exact: true }).click();
  await page.getByRole("heading", { name: "Quản lý Mã Giảm Giá" }).waitFor();
});

test.afterEach(async ({}, testInfo) => {
  await cleanupTrackedUsers(testInfo);
});

async function createCouponViaApi(request, code, fields = {}) {
  return request.post(`${API_URL}/admin/coupons`, {
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${adminToken}` },
    data: jsonData({
      code,
      type: "percent",
      discount_value: 10,
      min_order_amount: 0,
      expired_at: "2099-12-31",
      max_uses_per_user: 1,
      ...fields,
    }),
  });
}

async function fillCouponForm(page, code, fields = {}) {
  if (code !== undefined) {
    await page.getByPlaceholder("Mã coupon (VD: SAVE10)").fill(code);
  }
  if (fields.type !== undefined) {
    await page.locator("select").selectOption(fields.type);
  }
  const numbers = page.locator('input[type="number"]');
  if (fields.discount_value !== undefined) {
    await numbers.nth(0).fill(String(fields.discount_value));
  }
  if (fields.min_order_amount !== undefined) {
    await numbers.nth(1).fill(String(fields.min_order_amount));
  }
  if (fields.max_uses_per_user !== undefined) {
    await numbers.nth(2).fill(String(fields.max_uses_per_user));
  }
  if (fields.expired_at !== undefined) {
    await page.locator('input[type="date"]').fill(fields.expired_at);
  }
}

async function submitCouponForm(page) {
  const nativeFormValid = await page.locator("form").evaluate((form) => form.checkValidity());
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${API_URL}/admin/coupons` &&
      response.request().method() === "POST",
    { timeout: 5000 },
  ).catch(() => null);
  await page.getByRole("button", { name: "Tạo mã" }).click();
  const response = await responsePromise;
  await page.waitForTimeout(150);
  let responseBody = null;
  if (response) responseBody = await response.json().catch(() => ({}));
  return { response, responseBody, nativeFormValid };
}

async function codeIsListed(page, code) {
  return page
    .getByRole("cell", { name: code, exact: true })
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);
}

async function makeUiCoupon(page, code, fields) {
  await fillCouponForm(page, code, fields);
  const submitted = await submitCouponForm(page);
  return {
    ...submitted,
    listed: await codeIsListed(page, code),
  };
}

defineCase(
  test,
  "fr17",
  {
    id: "TC17-01",
    source: "Domain Testing",
    description: "Tạo mã giảm giá loại phần trăm",
    expected: "Tạo mã percent hợp lệ thành công và hiển thị trong danh sách.",
  },
  async ({ page }) => {
    const code = `${prefix}T1701`;
    const actual = await makeUiCoupon(page, code, {
      type: "percent",
      discount_value: 10,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    return {
      pass: actual.response?.ok() === true && actual.listed,
      observed: {
        code,
        httpStatus: actual.response?.status() || null,
        response: actual.responseBody,
        listedInAdminTable: actual.listed,
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-02",
    source: "Domain Testing",
    description: "Tạo mã giảm giá loại số tiền cố định",
    expected: "Tạo mã fixed hợp lệ thành công và hiển thị trong danh sách.",
  },
  async ({ page }) => {
    const code = `${prefix}T1702`;
    const actual = await makeUiCoupon(page, code, {
      type: "fixed",
      discount_value: 50000,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    return {
      pass: actual.response?.ok() === true && actual.listed,
      observed: {
        code,
        httpStatus: actual.response?.status() || null,
        response: actual.responseBody,
        listedInAdminTable: actual.listed,
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-03",
    source: "Domain Testing",
    description: "Từ chối tạo mã khi code bị bỏ trống",
    expected: "Từ chối tạo mã vì thiếu code.",
  },
  async ({ page }) => {
    await fillCouponForm(page, "", {
      type: "percent",
      discount_value: 10,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    const valid = await page.locator("form").evaluate((form) => form.checkValidity());
    const submitted = await submitCouponForm(page);
    return {
      pass: !valid && !submitted.response,
      observed: {
        nativeFormValidationBlockedSubmit: !valid,
        requestSent: Boolean(submitted.response),
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-04",
    source: "Domain Testing",
    description: "Từ chối tạo mã code bị trùng",
    expected: "Từ chối tạo mã vì code đã tồn tại.",
  },
  async ({ page, request }) => {
    const code = `${prefix}DUPLICATE`;
    const fixture = await createCouponViaApi(request, code);
    if (!fixture.ok()) {
      return { status: "BLOCKED", observed: `Không chuẩn bị được coupon trùng (HTTP ${fixture.status()}).` };
    }
    const actual = await makeUiCoupon(page, code, {
      type: "percent",
      discount_value: 10,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    return {
      pass: actual.response !== null && !actual.response.ok(),
      observed: {
        httpStatus: actual.response?.status() || null,
        response: actual.responseBody,
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-05",
    source: "Domain Testing",
    description: "Từ chối tạo mã khi thiếu type",
    expected: "Từ chối tạo mã do thiếu trường type.",
  },
  async ({ request }) => {
    const code = `${prefix}T1705`;
    const response = await request.post(`${API_URL}/admin/coupons`, {
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${adminToken}` },
      data: jsonData({
        code,
        discount_value: 10,
        min_order_amount: 0,
        expired_at: "2099-12-31",
        max_uses_per_user: 1,
      }),
    });
    const body = await response.json().catch(() => ({}));
    return {
      pass: !response.ok(),
      observed: { httpStatus: response.status(), response: body, testSurface: "API; UI select luôn có giá trị mặc định." },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-06",
    source: "Domain Testing",
    description: "Từ chối type không được hỗ trợ",
    expected: "Từ chối tạo mã vì type phải là percent hoặc fixed.",
  },
  async ({ request }) => {
    const code = `${prefix}T1706`;
    const response = await createCouponViaApi(request, code, { type: "other" });
    const body = await response.json().catch(() => ({}));
    return {
      pass: !response.ok(),
      observed: { httpStatus: response.status(), response: body, submittedType: "other" },
    };
  },
);

for (const item of [
  { id: "TC17-07", description: "Từ chối discount_value bằng 0", value: 0, expected: "Từ chối vì giá trị giảm phải dương." },
  { id: "TC17-08", description: "Từ chối discount_value âm", value: -1, expected: "Từ chối vì giá trị giảm không dương." },
]) {
  defineCase(
    test,
    "fr17",
    { id: item.id, source: "Domain Testing", description: item.description, expected: item.expected },
    async ({ page }) => {
      const code = `${prefix}${item.id.replace(/[^0-9]/g, "")}`;
      const actual = await makeUiCoupon(page, code, {
        type: "percent",
        discount_value: item.value,
        expired_at: "2099-12-31",
        min_order_amount: 0,
        max_uses_per_user: 1,
      });
      return {
        pass: actual.response !== null && !actual.response.ok(),
        observed: {
          submittedDiscountValue: item.value,
          httpStatus: actual.response?.status() || null,
          response: actual.responseBody,
          listedInAdminTable: actual.listed,
        },
      };
    },
  );
}

defineCase(
  test,
  "fr17",
  {
    id: "TC17-09",
    source: "Domain Testing",
    description: "Từ chối khi thiếu ngày hết hạn",
    expected: "Từ chối tạo mã vì thiếu expired_at.",
  },
  async ({ page }) => {
    const code = `${prefix}T1709`;
    await fillCouponForm(page, code, {
      type: "percent",
      discount_value: 10,
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    const valid = await page.locator("form").evaluate((form) => form.checkValidity());
    const submitted = await submitCouponForm(page);
    return {
      pass: !valid && !submitted.response,
      observed: {
        nativeFormValidationBlockedSubmit: !valid,
        requestSent: Boolean(submitted.response),
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-10",
    source: "Domain Testing",
    description: "Từ chối ngưỡng đơn hàng âm",
    expected: "Từ chối vì min_order_amount phải lớn hơn hoặc bằng 0.",
  },
  async ({ page }) => {
    const code = `${prefix}T1710`;
    const actual = await makeUiCoupon(page, code, {
      type: "percent",
      discount_value: 10,
      expired_at: "2099-12-31",
      min_order_amount: -1,
      max_uses_per_user: 1,
    });
    return {
      pass: actual.response !== null && !actual.response.ok(),
      observed: {
        submittedMinOrderAmount: -1,
        httpStatus: actual.response?.status() || null,
        response: actual.responseBody,
        listedInAdminTable: actual.listed,
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-11",
    source: "Domain Testing",
    description: "Từ chối giới hạn lượt sử dụng bằng 0",
    expected: "Từ chối vì max_uses_per_user phải từ 1 trở lên.",
  },
  async ({ page }) => {
    const code = `${prefix}T1711`;
    await fillCouponForm(page, code, {
      type: "percent",
      discount_value: 10,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 0,
    });
    const valid = await page.locator("form").evaluate((form) => form.checkValidity());
    const submitted = await submitCouponForm(page);
    return {
      pass: !valid && !submitted.response,
      observed: {
        nativeFormValidationBlockedSubmit: !valid,
        requestSent: Boolean(submitted.response),
      },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-12",
    source: "Domain Testing",
    description: "Xem danh sách mã giảm giá",
    expected: "Danh sách hiển thị mã kiểm thử đã tạo và các thông tin tương ứng.",
  },
  async ({ page, request }) => {
    const code = `${prefix}T1712`;
    const fixture = await createCouponViaApi(request, code, {
      type: "fixed",
      discount_value: 50000,
    });
    if (!fixture.ok()) {
      return { status: "BLOCKED", observed: `Không tạo được coupon fixture (HTTP ${fixture.status()}).` };
    }
    await page.reload();
    await page.getByText("Mã Giảm Giá", { exact: true }).click();
    const listed = await codeIsListed(page, code);
    return {
      pass: listed,
      observed: { code, listedInAdminTable: listed },
    };
  },
);

defineCase(
  test,
  "fr17",
  {
    id: "TC17-13",
    source: "Domain Testing",
    description: "Xóa coupon đã tạo và xác minh danh sách",
    expected: "Coupon bị xóa thành công và không còn xuất hiện trong danh sách.",
  },
  async ({ page }) => {
    const code = `${prefix}T1713`;
    const created = await makeUiCoupon(page, code, {
      type: "fixed",
      discount_value: 50000,
      expired_at: "2099-12-31",
      min_order_amount: 0,
      max_uses_per_user: 1,
    });
    if (!created.response?.ok() || !created.listed) {
      return {
        pass: false,
        observed: { code, stage: "create", httpStatus: created.response?.status() || null },
      };
    }
    const row = page.locator("tbody tr").filter({ hasText: code });
    const deleteResponse = page.waitForResponse(
      (response) => response.url().includes("/api/admin/coupons/") && response.request().method() === "DELETE",
      { timeout: 5000 },
    );
    await row.getByRole("button", { name: "Xóa" }).click();
    const response = await deleteResponse;
    const rowGone = await row
      .waitFor({ state: "detached", timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    return {
      pass: response.ok() && rowGone,
      observed: { code, deleteHttpStatus: response.status(), stillListed: !rowGone },
    };
  },
);

const bvaCases = [
  { id: "BVA-FR17-01", type: "percent", field: "discount_value", value: -1, expected: "Từ chối vì giá trị giảm không dương." },
  { id: "BVA-FR17-02", type: "percent", field: "discount_value", value: 0, expected: "Từ chối vì giá trị giảm phải lớn hơn 0." },
  { id: "BVA-FR17-03", type: "percent", field: "discount_value", value: 1, expected: "Chấp nhận điều kiện giá trị giảm." },
  { id: "BVA-FR17-04", type: "fixed", field: "discount_value", value: -1, expected: "Từ chối vì giá trị giảm không dương." },
  { id: "BVA-FR17-05", type: "fixed", field: "discount_value", value: 0, expected: "Từ chối vì giá trị giảm phải lớn hơn 0." },
  { id: "BVA-FR17-06", type: "fixed", field: "discount_value", value: 1, expected: "Chấp nhận điều kiện giá trị giảm." },
  { id: "BVA-FR17-07", type: "percent", field: "min_order_amount", value: -1, expected: "Từ chối vì ngưỡng đơn hàng âm." },
  { id: "BVA-FR17-08", type: "percent", field: "min_order_amount", value: 0, expected: "Chấp nhận điều kiện ngưỡng đơn hàng bằng 0." },
  { id: "BVA-FR17-09", type: "percent", field: "min_order_amount", value: 1, expected: "Chấp nhận điều kiện ngưỡng đơn hàng bằng 1." },
  { id: "BVA-FR17-10", type: "fixed", field: "max_uses_per_user", value: 0, expected: "Từ chối vì giới hạn lượt dùng nhỏ hơn 1." },
  { id: "BVA-FR17-11", type: "fixed", field: "max_uses_per_user", value: 1, expected: "Chấp nhận điều kiện giới hạn lượt dùng bằng 1." },
  { id: "BVA-FR17-12", type: "fixed", field: "max_uses_per_user", value: 2, expected: "Chấp nhận điều kiện giới hạn lượt dùng bằng 2." },
];

for (const item of bvaCases) {
  defineCase(
    test,
    "fr17",
    {
      id: item.id,
      source: "BVA",
      description: `Kiểm tra biên ${item.field} = ${item.value} (${item.type})`,
      expected: item.expected,
    },
    async ({ page }) => {
      const code = `${prefix}${item.id.replace(/[^0-9]/g, "")}`;
      const fields = {
        type: item.type,
        discount_value: 1,
        min_order_amount: 0,
        max_uses_per_user: 1,
        expired_at: "2099-12-31",
      };
      fields[item.field] = item.value;
      const actual = await makeUiCoupon(page, code, fields);
      const expectedAccepted = item.field === "discount_value"
        ? item.value > 0
        : item.field === "min_order_amount"
          ? item.value >= 0
          : item.value >= 1;
      const pass = expectedAccepted
        ? actual.response?.ok() === true && actual.listed
        : actual.response
          ? !actual.response.ok()
          : !actual.nativeFormValid && !actual.listed;
      return {
        pass,
        observed: {
          field: item.field,
          value: item.value,
          type: item.type,
          httpStatus: actual.response?.status() || null,
          response: actual.responseBody,
          listedInAdminTable: actual.listed,
          nativeFormValidationBlockedSubmit: !actual.nativeFormValid,
        },
      };
    },
  );
}
