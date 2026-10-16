const { test } = require("@playwright/test");
const {
  cleanupTrackedUsers,
  closeDatabase,
  defineCase,
  getSql,
  JSON_HEADERS,
  jsonData,
  openDatabase,
  apiUrl,
  uniqueEmail,
} = require("./helpers/runtime");

const goodPassword = "Abcdef1!";

test.afterEach(async ({}, testInfo) => {
  await cleanupTrackedUsers(testInfo);
});

function registrationFields(page) {
  return page.locator("form input");
}

function trackEmail(testInfo, email) {
  testInfo.annotations.push({ type: "test-user", description: email });
}

async function readResponse(response) {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

defineCase(
  test,
  "fr01",
  {
    id: "TC01",
    source: "Domain Testing",
    description: "Đăng ký bằng dữ liệu hợp lệ và chuyển tới trang đăng nhập",
    expected: "Tạo tài khoản thành công và chuyển người dùng đến trang đăng nhập.",
  },
  async ({ page }, testInfo) => {
    const email = uniqueEmail("TC01");
    trackEmail(testInfo, email);
    await page.goto("/register");
    const fields = registrationFields(page);
    await fields.nth(0).fill("Nguyễn Văn An");
    await fields.nth(1).fill(email);
    await fields.nth(2).fill(goodPassword);
    await page.getByRole("button", { name: "Đăng Ký" }).click();
    await page.waitForTimeout(300);
    const db = await openDatabase();
    let account;
    try {
      account = await getSql(db, "SELECT id, name, email FROM users WHERE email = ?", [email]);
    } finally {
      await closeDatabase(db);
    }
    const actual = {
      url: page.url(),
      visibleError: await page.locator(".bg-red-100").innerText().catch(() => ""),
      confirmationFieldCount: await page.locator('input[type="password"]').count() - 1,
      accountCreated: Boolean(account),
    };
    return {
      pass: new URL(page.url()).pathname === "/login" && Boolean(account),
      observed: actual,
    };
  },
);

defineCase(
  test,
  "fr01",
  {
    id: "TC02",
    source: "Domain Testing",
    description: "Từ chối họ và tên bị bỏ trống",
    expected: "Từ chối đăng ký và thông báo họ và tên là trường bắt buộc.",
  },
  async ({ page }) => {
    await page.goto("/register");
    const fields = registrationFields(page);
    await fields.nth(1).fill(uniqueEmail("TC02"));
    await fields.nth(2).fill(goodPassword);
    const valid = await page.locator("form").evaluate((form) => form.checkValidity());
    await page.getByRole("button", { name: "Đăng Ký" }).click();
    const validationMessage = await fields.nth(0).evaluate((input) => input.validationMessage);
    return {
      pass: !valid && new URL(page.url()).pathname === "/register",
      observed: {
        nativeFormValidationBlockedSubmit: !valid,
        validationMessage,
        url: page.url(),
      },
    };
  },
);

defineCase(
  test,
  "fr01",
  {
    id: "TC03",
    source: "Domain Testing",
    description: "Từ chối email bị bỏ trống",
    expected: "Từ chối đăng ký và thông báo email là trường bắt buộc.",
  },
  async ({ page }) => {
    await page.goto("/register");
    const fields = registrationFields(page);
    await fields.nth(0).fill("Nguyễn Văn An");
    await fields.nth(2).fill(goodPassword);
    const valid = await page.locator("form").evaluate((form) => form.checkValidity());
    await page.getByRole("button", { name: "Đăng Ký" }).click();
    const validationMessage = await fields.nth(1).evaluate((input) => input.validationMessage);
    return {
      pass: !valid && new URL(page.url()).pathname === "/register",
      observed: {
        nativeFormValidationBlockedSubmit: !valid,
        validationMessage,
        url: page.url(),
      },
    };
  },
);

defineCase(
  test,
  "fr01",
  {
    id: "TC04",
    source: "Domain Testing",
    description: "Từ chối email sai định dạng",
    expected: "Từ chối đăng ký vì email không đúng định dạng.",
  },
  async ({ request }, testInfo) => {
    const existing = await openDatabase();
    try {
      if (await getSql(existing, "SELECT id FROM users WHERE email = ?", ["nguyen-at-example.com"])) {
        return { status: "BLOCKED", observed: "Email sai định dạng trong test case đã tồn tại; bỏ qua để không xóa dữ liệu không thuộc test." };
      }
    } finally {
      await closeDatabase(existing);
    }
    trackEmail(testInfo, "nguyen-at-example.com");
    const response = await request.post(apiUrl("/register"), {
      headers: JSON_HEADERS,
      data: jsonData({
        name: "Nguyễn Văn An",
        email: "nguyen-at-example.com",
        password: goodPassword,
      }),
    });
    const body = await readResponse(response);
    return {
      pass: !response.ok() && /email|định dạng|format/i.test(body.error || ""),
      observed: { url: apiUrl("/register"), status: response.status(), body },
    };
  },
);

defineCase(
  test,
  "fr01",
  {
    id: "TC05",
    source: "Domain Testing",
    description: "Từ chối email đã tồn tại",
    expected: "Từ chối đăng ký và thông báo email đã được sử dụng.",
  },
  async ({ request }, testInfo) => {
    const response = await request.post(apiUrl("/register"), {
      headers: JSON_HEADERS,
      data: jsonData({
        name: "Nguyễn Văn An",
        email: "test@eshop.com",
        password: goodPassword,
      }),
    });
    const body = await readResponse(response);
    if (body.id) {
      testInfo.annotations.push({
        type: "test-user-id",
        description: JSON.stringify({ id: body.id, email: "test@eshop.com" }),
      });
    }
    return {
      pass: !response.ok() && /email|already|đã được sử dụng/i.test(body.error || ""),
      observed: { url: apiUrl("/register"), status: response.status(), body },
    };
  },
);

const passwordCases = [
  ["TC06", "Mật khẩu ngắn hơn 8 ký tự", "Ab1!", "Từ chối đăng ký vì mật khẩu không đáp ứng độ dài tối thiểu."],
  ["TC07", "Mật khẩu không có chữ hoa", "abcdefg1!", "Từ chối đăng ký vì mật khẩu không có chữ hoa."],
  ["TC08", "Mật khẩu không có chữ thường", "ABCDEFG1!", "Từ chối đăng ký vì mật khẩu không có chữ thường."],
  ["TC09", "Mật khẩu không có chữ số", "Abcdefg!", "Từ chối đăng ký vì mật khẩu không có chữ số."],
  ["TC10", "Mật khẩu không có ký tự đặc biệt được chấp nhận", "Abcdefg1", "Từ chối đăng ký vì mật khẩu không chứa ký tự đặc biệt được chấp nhận."],
];

for (const [id, description, password, expected] of passwordCases) {
  defineCase(
    test,
    "fr01",
    { id, source: "Domain Testing", description, expected },
    async ({ request }, testInfo) => {
      const email = uniqueEmail(id);
      trackEmail(testInfo, email);
      const response = await request.post(apiUrl("/register"), {
        headers: JSON_HEADERS,
        data: jsonData({
          name: "Nguyễn Văn An",
          email,
          password,
        }),
      });
      const body = await readResponse(response);
      return {
        pass: !response.ok(),
        observed: { url: apiUrl("/register"), status: response.status(), body, submittedPassword: password },
      };
    },
  );
}

const bvaCases = [
  ["BVA-FR01-01", "7 ký tự", "Abcde1!", "Từ chối mật khẩu 7 ký tự vì chưa đạt độ dài tối thiểu."],
  ["BVA-FR01-02", "8 ký tự", "Abcdef1!", "Chấp nhận mật khẩu 8 ký tự về điều kiện độ dài."],
  ["BVA-FR01-03", "9 ký tự", "Abcdefg1!", "Chấp nhận mật khẩu 9 ký tự về điều kiện độ dài."],
];

for (const [id, description, password, expected] of bvaCases) {
  defineCase(
    test,
    "fr01",
    {
      id,
      source: "BVA",
      description: `Kiểm tra mật khẩu tại biên: ${description}`,
      expected,
    },
    async ({ page }, testInfo) => {
      const email = uniqueEmail(id);
      trackEmail(testInfo, email);
      await page.goto("/register");
      const fields = registrationFields(page);
      await fields.nth(0).fill("Nguyễn Văn An");
      await fields.nth(1).fill(email);
      await fields.nth(2).fill(password);
      await page.getByRole("button", { name: "Đăng Ký" }).click();
      await page.waitForTimeout(250);
      const visibleError = await page.locator(".bg-red-100").innerText().catch(() => "");
      const accepted = new URL(page.url()).pathname === "/login";
      return {
        pass: id === "BVA-FR01-01" ? !accepted : accepted,
        observed: { accepted, url: page.url(), visibleError, passwordLength: password.length },
      };
    },
  );
}
