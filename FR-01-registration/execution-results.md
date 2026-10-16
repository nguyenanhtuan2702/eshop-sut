# FR-01 Registration — execution results

- Run ID: `20261016-155435`
- Thời điểm bắt đầu ghi nhận: 2026-10-16T08:54:38.555Z
- Tổng thời lượng các test đã ghi nhận: 6.53 giây
- Môi trường: Windows_NT 10.0.26300, Node.js v24.15.0; Web http://localhost:5173; Admin http://localhost:5174; API http://localhost:3000/api.
- Tài khoản Admin được đọc từ biến môi trường; không ghi credential hoặc token vào báo cáo.

| Test Case ID | Test Source | Test Description | Expected Result | Actual Result | Status | Evidence/Log |
|---|---|---|---|---|---|---|
| TC01 | Domain Testing | Đăng ký bằng dữ liệu hợp lệ và chuyển tới trang đăng nhập | Tạo tài khoản thành công và chuyển người dùng đến trang đăng nhập. | {"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","confirmationFieldCount":0,"accountCreated":false} | FAIL | [JSON](./../evidence/FR-01-registration/TC01/logs/20261016-155435.json) · [screenshot](./../evidence/FR-01-registration/TC01/screenshots/20261016-155435-TC01-FAIL.png) · [trace](./../evidence/FR-01-registration/TC01/traces/20261016-155435-TC01-trace.zip) |
| TC02 | Domain Testing | Từ chối họ và tên bị bỏ trống | Từ chối đăng ký và thông báo họ và tên là trường bắt buộc. | {"nativeFormValidationBlockedSubmit":true,"validationMessage":"Please fill out this field.","url":"http://localhost:5173/register"} | PASS | [JSON](./../evidence/FR-01-registration/TC02/logs/20261016-155435.json) |
| TC03 | Domain Testing | Từ chối email bị bỏ trống | Từ chối đăng ký và thông báo email là trường bắt buộc. | {"nativeFormValidationBlockedSubmit":true,"validationMessage":"Please fill out this field.","url":"http://localhost:5173/register"} | PASS | [JSON](./../evidence/FR-01-registration/TC03/logs/20261016-155435.json) |
| TC04 | Domain Testing | Từ chối email sai định dạng | Từ chối đăng ký vì email không đúng định dạng. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":50}} | FAIL | [JSON](./../evidence/FR-01-registration/TC04/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC04/traces/20261016-155435-TC04-trace.zip) |
| TC05 | Domain Testing | Từ chối email đã tồn tại | Từ chối đăng ký và thông báo email đã được sử dụng. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":51}} | FAIL | [JSON](./../evidence/FR-01-registration/TC05/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC05/traces/20261016-155435-TC05-trace.zip) |
| TC06 | Domain Testing | Mật khẩu ngắn hơn 8 ký tự | Từ chối đăng ký vì mật khẩu không đáp ứng độ dài tối thiểu. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":52},"submittedPassword":"Ab1!"} | FAIL | [JSON](./../evidence/FR-01-registration/TC06/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC06/traces/20261016-155435-TC06-trace.zip) |
| TC07 | Domain Testing | Mật khẩu không có chữ hoa | Từ chối đăng ký vì mật khẩu không có chữ hoa. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":53},"submittedPassword":"abcdefg1!"} | FAIL | [JSON](./../evidence/FR-01-registration/TC07/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC07/traces/20261016-155435-TC07-trace.zip) |
| TC08 | Domain Testing | Mật khẩu không có chữ thường | Từ chối đăng ký vì mật khẩu không có chữ thường. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":54},"submittedPassword":"ABCDEFG1!"} | FAIL | [JSON](./../evidence/FR-01-registration/TC08/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC08/traces/20261016-155435-TC08-trace.zip) |
| TC09 | Domain Testing | Mật khẩu không có chữ số | Từ chối đăng ký vì mật khẩu không có chữ số. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":55},"submittedPassword":"Abcdefg!"} | FAIL | [JSON](./../evidence/FR-01-registration/TC09/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC09/traces/20261016-155435-TC09-trace.zip) |
| TC10 | Domain Testing | Mật khẩu không có ký tự đặc biệt được chấp nhận | Từ chối đăng ký vì mật khẩu không chứa ký tự đặc biệt được chấp nhận. | {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":56},"submittedPassword":"Abcdefg1"} | FAIL | [JSON](./../evidence/FR-01-registration/TC10/logs/20261016-155435.json) · [trace](./../evidence/FR-01-registration/TC10/traces/20261016-155435-TC10-trace.zip) |
| TC11 | Domain Testing | Bỏ trống trường xác nhận mật khẩu | Từ chối đăng ký và thông báo trường xác nhận mật khẩu chưa được nhập. | Chưa chạy: Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này. | NOT AUTOMATED | Không có |
| TC12 | Domain Testing | Mật khẩu xác nhận không khớp | Từ chối đăng ký và thông báo hai mật khẩu không khớp. | Chưa chạy: Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này. | NOT AUTOMATED | Không có |
| BVA-FR01-01 | BVA | Kiểm tra mật khẩu tại biên: 7 ký tự | Từ chối mật khẩu 7 ký tự vì chưa đạt độ dài tối thiểu. | {"accepted":false,"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","passwordLength":7} | PASS | [JSON](./../evidence/FR-01-registration/BVA-FR01-01/logs/20261016-155435.json) |
| BVA-FR01-02 | BVA | Kiểm tra mật khẩu tại biên: 8 ký tự | Chấp nhận mật khẩu 8 ký tự về điều kiện độ dài. | {"accepted":false,"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","passwordLength":8} | FAIL | [JSON](./../evidence/FR-01-registration/BVA-FR01-02/logs/20261016-155435.json) · [screenshot](./../evidence/FR-01-registration/BVA-FR01-02/screenshots/20261016-155435-BVA-FR01-02-FAIL.png) · [trace](./../evidence/FR-01-registration/BVA-FR01-02/traces/20261016-155435-BVA-FR01-02-trace.zip) |
| BVA-FR01-03 | BVA | Kiểm tra mật khẩu tại biên: 9 ký tự | Chấp nhận mật khẩu 9 ký tự về điều kiện độ dài. | {"accepted":false,"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","passwordLength":9} | FAIL | [JSON](./../evidence/FR-01-registration/BVA-FR01-03/logs/20261016-155435.json) · [screenshot](./../evidence/FR-01-registration/BVA-FR01-03/screenshots/20261016-155435-BVA-FR01-03-FAIL.png) · [trace](./../evidence/FR-01-registration/BVA-FR01-03/traces/20261016-155435-BVA-FR01-03-trace.zip) |

## Tổng kết

- Tổng số test case trong tài liệu: **15**.
- Số test case có script tự động hóa: **13**.
- Số test đã thực sự chạy và có execution log: **13**.
- PASS: **3**; FAIL: **10**; BLOCKED: **0**; NOT AUTOMATED: **2**.

### Test case thất bại

- **TC01** — Actual: {"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","confirmationFieldCount":0,"accountCreated":false} Expected không thay đổi so với test plan.
- **TC04** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":50}} Expected không thay đổi so với test plan.
- **TC05** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":51}} Expected không thay đổi so với test plan.
- **TC06** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":52},"submittedPassword":"Ab1!"} Expected không thay đổi so với test plan.
- **TC07** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":53},"submittedPassword":"abcdefg1!"} Expected không thay đổi so với test plan.
- **TC08** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":54},"submittedPassword":"ABCDEFG1!"} Expected không thay đổi so với test plan.
- **TC09** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":55},"submittedPassword":"Abcdefg!"} Expected không thay đổi so với test plan.
- **TC10** — Actual: {"url":"http://localhost:3000/api/register","status":200,"body":{"message":"User registered successfully","id":56},"submittedPassword":"Abcdefg1"} Expected không thay đổi so với test plan.
- **BVA-FR01-02** — Actual: {"accepted":false,"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","passwordLength":8} Expected không thay đổi so với test plan.
- **BVA-FR01-03** — Actual: {"accepted":false,"url":"http://localhost:5173/register","visibleError":"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.","passwordLength":9} Expected không thay đổi so với test plan.

### Test case chưa chạy hoặc không tự động hóa

- Không có test case BLOCKED.
- **TC11** — Chưa chạy: Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này.
- **TC12** — Chưa chạy: Giao diện không có trường xác nhận mật khẩu và API /register không nhận/kiểm tra trường này.

## Evidence bổ sung

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-01-registration/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR01-01 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-01-registration/BVA-FR01-01/logs/20261016-155435.json) |
| TC02 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-01-registration/TC02/logs/20261016-155435.json) |
| TC03 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-01-registration/TC03/logs/20261016-155435.json) |

### Run `20261016-evidence-1623`

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-01-registration/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR01-01 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-01-registration/BVA-FR01-01/screenshots/20261016-evidence-1623-BVA-FR01-01-PASS.png) · [JSON](./../evidence/FR-01-registration/BVA-FR01-01/logs/20261016-evidence-1623.json) |
| TC02 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-01-registration/TC02/screenshots/20261016-evidence-1623-TC02-PASS.png) · [JSON](./../evidence/FR-01-registration/TC02/logs/20261016-evidence-1623.json) |
| TC03 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-01-registration/TC03/screenshots/20261016-evidence-1623-TC03-PASS.png) · [JSON](./../evidence/FR-01-registration/TC03/logs/20261016-evidence-1623.json) |
