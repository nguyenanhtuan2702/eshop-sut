# FR-17 Coupon Management — execution results

- Run ID: `20261016-155435`
- Thời điểm bắt đầu ghi nhận: 2026-10-16T08:55:54.231Z
- Tổng thời lượng các test đã ghi nhận: 39.78 giây
- Môi trường: Windows_NT 10.0.26300, Node.js v24.15.0; Web http://localhost:5173; Admin http://localhost:5174; API http://localhost:3000/api.
- Tài khoản Admin được đọc từ biến môi trường; không ghi credential hoặc token vào báo cáo.

| Test Case ID | Test Source | Test Description | Expected Result | Actual Result | Status | Evidence/Log |
|---|---|---|---|---|---|---|
| TC17-01 | Domain Testing | Tạo mã giảm giá loại phần trăm | Tạo mã percent hợp lệ thành công và hiển thị trong danh sách. | {"code":"QA20261016155435T1701","httpStatus":200,"response":{"message":"Coupon created","id":153},"listedInAdminTable":true} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-01/logs/20261016-155435.json) |
| TC17-02 | Domain Testing | Tạo mã giảm giá loại số tiền cố định | Tạo mã fixed hợp lệ thành công và hiển thị trong danh sách. | {"code":"QA20261016155435T1702","httpStatus":200,"response":{"message":"Coupon created","id":154},"listedInAdminTable":true} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-02/logs/20261016-155435.json) |
| TC17-03 | Domain Testing | Từ chối tạo mã khi code bị bỏ trống | Từ chối tạo mã vì thiếu code. | {"nativeFormValidationBlockedSubmit":true,"requestSent":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-03/logs/20261016-155435.json) |
| TC17-04 | Domain Testing | Từ chối tạo mã code bị trùng | Từ chối tạo mã vì code đã tồn tại. | {"httpStatus":500,"response":{"error":"SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code"}} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-04/logs/20261016-155435.json) |
| TC17-05 | Domain Testing | Từ chối tạo mã khi thiếu type | Từ chối tạo mã do thiếu trường type. | {"httpStatus":200,"response":{"message":"Coupon created","id":156},"testSurface":"API; UI select luôn có giá trị mặc định."} | FAIL | [JSON](./../evidence/FR-17-coupon-management/TC17-05/logs/20261016-155435.json) · [trace](./../evidence/FR-17-coupon-management/TC17-05/traces/20261016-155435-TC17-05-trace.zip) |
| TC17-06 | Domain Testing | Từ chối type không được hỗ trợ | Từ chối tạo mã vì type phải là percent hoặc fixed. | {"httpStatus":200,"response":{"message":"Coupon created","id":157},"submittedType":"other"} | FAIL | [JSON](./../evidence/FR-17-coupon-management/TC17-06/logs/20261016-155435.json) · [trace](./../evidence/FR-17-coupon-management/TC17-06/traces/20261016-155435-TC17-06-trace.zip) |
| TC17-07 | Domain Testing | Từ chối discount_value bằng 0 | Từ chối vì giá trị giảm phải dương. | {"submittedDiscountValue":0,"httpStatus":200,"response":{"message":"Coupon created","id":158},"listedInAdminTable":true} | FAIL | [JSON](./../evidence/FR-17-coupon-management/TC17-07/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/TC17-07/screenshots/20261016-155435-TC17-07-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/TC17-07/traces/20261016-155435-TC17-07-trace.zip) |
| TC17-08 | Domain Testing | Từ chối discount_value âm | Từ chối vì giá trị giảm không dương. | {"submittedDiscountValue":-1,"httpStatus":200,"response":{"message":"Coupon created","id":159},"listedInAdminTable":true} | FAIL | [JSON](./../evidence/FR-17-coupon-management/TC17-08/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/TC17-08/screenshots/20261016-155435-TC17-08-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/TC17-08/traces/20261016-155435-TC17-08-trace.zip) |
| TC17-09 | Domain Testing | Từ chối khi thiếu ngày hết hạn | Từ chối tạo mã vì thiếu expired_at. | {"nativeFormValidationBlockedSubmit":true,"requestSent":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-09/logs/20261016-155435.json) |
| TC17-10 | Domain Testing | Từ chối ngưỡng đơn hàng âm | Từ chối vì min_order_amount phải lớn hơn hoặc bằng 0. | {"submittedMinOrderAmount":-1,"httpStatus":200,"response":{"message":"Coupon created","id":160},"listedInAdminTable":true} | FAIL | [JSON](./../evidence/FR-17-coupon-management/TC17-10/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/TC17-10/screenshots/20261016-155435-TC17-10-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/TC17-10/traces/20261016-155435-TC17-10-trace.zip) |
| TC17-11 | Domain Testing | Từ chối giới hạn lượt sử dụng bằng 0 | Từ chối vì max_uses_per_user phải từ 1 trở lên. | {"nativeFormValidationBlockedSubmit":true,"requestSent":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-11/logs/20261016-155435.json) |
| TC17-12 | Domain Testing | Xem danh sách mã giảm giá | Danh sách hiển thị mã kiểm thử đã tạo và các thông tin tương ứng. | {"code":"QA20261016155435T1712","listedInAdminTable":true} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-12/logs/20261016-155435.json) |
| TC17-13 | Domain Testing | Xóa coupon đã tạo và xác minh danh sách | Coupon bị xóa thành công và không còn xuất hiện trong danh sách. | {"code":"QA20261016155435T1713","deleteHttpStatus":200,"stillListed":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/TC17-13/logs/20261016-155435.json) |
| BVA-FR17-01 | BVA | Kiểm tra biên discount_value = -1 (percent) | Từ chối vì giá trị giảm không dương. | {"field":"discount_value","value":-1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":163},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | FAIL | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-01/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-01/screenshots/20261016-155435-BVA-FR17-01-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/BVA-FR17-01/traces/20261016-155435-BVA-FR17-01-trace.zip) |
| BVA-FR17-02 | BVA | Kiểm tra biên discount_value = 0 (percent) | Từ chối vì giá trị giảm phải lớn hơn 0. | {"field":"discount_value","value":0,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":164},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | FAIL | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-02/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-02/screenshots/20261016-155435-BVA-FR17-02-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/BVA-FR17-02/traces/20261016-155435-BVA-FR17-02-trace.zip) |
| BVA-FR17-03 | BVA | Kiểm tra biên discount_value = 1 (percent) | Chấp nhận điều kiện giá trị giảm. | {"field":"discount_value","value":1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":165},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-03/logs/20261016-155435.json) |
| BVA-FR17-04 | BVA | Kiểm tra biên discount_value = -1 (fixed) | Từ chối vì giá trị giảm không dương. | {"field":"discount_value","value":-1,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":166},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | FAIL | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-04/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-04/screenshots/20261016-155435-BVA-FR17-04-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/BVA-FR17-04/traces/20261016-155435-BVA-FR17-04-trace.zip) |
| BVA-FR17-05 | BVA | Kiểm tra biên discount_value = 0 (fixed) | Từ chối vì giá trị giảm phải lớn hơn 0. | {"field":"discount_value","value":0,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":167},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | FAIL | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-05/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-05/screenshots/20261016-155435-BVA-FR17-05-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/BVA-FR17-05/traces/20261016-155435-BVA-FR17-05-trace.zip) |
| BVA-FR17-06 | BVA | Kiểm tra biên discount_value = 1 (fixed) | Chấp nhận điều kiện giá trị giảm. | {"field":"discount_value","value":1,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":168},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-06/logs/20261016-155435.json) |
| BVA-FR17-07 | BVA | Kiểm tra biên min_order_amount = -1 (percent) | Từ chối vì ngưỡng đơn hàng âm. | {"field":"min_order_amount","value":-1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":169},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | FAIL | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-07/logs/20261016-155435.json) · [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-07/screenshots/20261016-155435-BVA-FR17-07-FAIL.png) · [trace](./../evidence/FR-17-coupon-management/BVA-FR17-07/traces/20261016-155435-BVA-FR17-07-trace.zip) |
| BVA-FR17-08 | BVA | Kiểm tra biên min_order_amount = 0 (percent) | Chấp nhận điều kiện ngưỡng đơn hàng bằng 0. | {"field":"min_order_amount","value":0,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":170},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-08/logs/20261016-155435.json) |
| BVA-FR17-09 | BVA | Kiểm tra biên min_order_amount = 1 (percent) | Chấp nhận điều kiện ngưỡng đơn hàng bằng 1. | {"field":"min_order_amount","value":1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":171},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-09/logs/20261016-155435.json) |
| BVA-FR17-10 | BVA | Kiểm tra biên max_uses_per_user = 0 (fixed) | Từ chối vì giới hạn lượt dùng nhỏ hơn 1. | {"field":"max_uses_per_user","value":0,"type":"fixed","httpStatus":null,"response":null,"listedInAdminTable":false,"nativeFormValidationBlockedSubmit":true} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-10/logs/20261016-155435.json) |
| BVA-FR17-11 | BVA | Kiểm tra biên max_uses_per_user = 1 (fixed) | Chấp nhận điều kiện giới hạn lượt dùng bằng 1. | {"field":"max_uses_per_user","value":1,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":172},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-11/logs/20261016-155435.json) |
| BVA-FR17-12 | BVA | Kiểm tra biên max_uses_per_user = 2 (fixed) | Chấp nhận điều kiện giới hạn lượt dùng bằng 2. | {"field":"max_uses_per_user","value":2,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":173},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} | PASS | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-12/logs/20261016-155435.json) |

## Tổng kết

- Tổng số test case trong tài liệu: **25**.
- Số test case có script tự động hóa: **25**.
- Số test đã thực sự chạy và có execution log: **25**.
- PASS: **15**; FAIL: **10**; BLOCKED: **0**; NOT AUTOMATED: **0**.

### Test case thất bại

- **TC17-05** — Actual: {"httpStatus":200,"response":{"message":"Coupon created","id":156},"testSurface":"API; UI select luôn có giá trị mặc định."} Expected không thay đổi so với test plan.
- **TC17-06** — Actual: {"httpStatus":200,"response":{"message":"Coupon created","id":157},"submittedType":"other"} Expected không thay đổi so với test plan.
- **TC17-07** — Actual: {"submittedDiscountValue":0,"httpStatus":200,"response":{"message":"Coupon created","id":158},"listedInAdminTable":true} Expected không thay đổi so với test plan.
- **TC17-08** — Actual: {"submittedDiscountValue":-1,"httpStatus":200,"response":{"message":"Coupon created","id":159},"listedInAdminTable":true} Expected không thay đổi so với test plan.
- **TC17-10** — Actual: {"submittedMinOrderAmount":-1,"httpStatus":200,"response":{"message":"Coupon created","id":160},"listedInAdminTable":true} Expected không thay đổi so với test plan.
- **BVA-FR17-01** — Actual: {"field":"discount_value","value":-1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":163},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} Expected không thay đổi so với test plan.
- **BVA-FR17-02** — Actual: {"field":"discount_value","value":0,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":164},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} Expected không thay đổi so với test plan.
- **BVA-FR17-04** — Actual: {"field":"discount_value","value":-1,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":166},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} Expected không thay đổi so với test plan.
- **BVA-FR17-05** — Actual: {"field":"discount_value","value":0,"type":"fixed","httpStatus":200,"response":{"message":"Coupon created","id":167},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} Expected không thay đổi so với test plan.
- **BVA-FR17-07** — Actual: {"field":"min_order_amount","value":-1,"type":"percent","httpStatus":200,"response":{"message":"Coupon created","id":169},"listedInAdminTable":true,"nativeFormValidationBlockedSubmit":false} Expected không thay đổi so với test plan.

### Test case chưa chạy hoặc không tự động hóa

- Không có test case BLOCKED.

## Evidence bổ sung

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-17-coupon-management/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR17-03 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-03/logs/20261016-155435.json) |
| BVA-FR17-06 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-06/logs/20261016-155435.json) |
| BVA-FR17-08 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-08/logs/20261016-155435.json) |
| BVA-FR17-09 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-09/logs/20261016-155435.json) |
| BVA-FR17-10 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-10/logs/20261016-155435.json) |
| BVA-FR17-11 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-11/logs/20261016-155435.json) |
| BVA-FR17-12 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-12/logs/20261016-155435.json) |
| TC17-01 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-01/logs/20261016-155435.json) |
| TC17-02 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-02/logs/20261016-155435.json) |
| TC17-03 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-03/logs/20261016-155435.json) |
| TC17-04 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-04/logs/20261016-155435.json) |
| TC17-09 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-09/logs/20261016-155435.json) |
| TC17-11 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-11/logs/20261016-155435.json) |
| TC17-12 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-12/logs/20261016-155435.json) |
| TC17-13 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-17-coupon-management/TC17-13/logs/20261016-155435.json) |

### Run `20261016-evidence-1623`

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-17-coupon-management/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR17-03 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-03/screenshots/20261016-evidence-1623-BVA-FR17-03-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-03/logs/20261016-evidence-1623.json) |
| BVA-FR17-06 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-06/screenshots/20261016-evidence-1623-BVA-FR17-06-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-06/logs/20261016-evidence-1623.json) |
| BVA-FR17-08 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-08/screenshots/20261016-evidence-1623-BVA-FR17-08-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-08/logs/20261016-evidence-1623.json) |
| BVA-FR17-09 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-09/screenshots/20261016-evidence-1623-BVA-FR17-09-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-09/logs/20261016-evidence-1623.json) |
| BVA-FR17-10 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-10/screenshots/20261016-evidence-1623-BVA-FR17-10-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-10/logs/20261016-evidence-1623.json) |
| BVA-FR17-11 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-11/screenshots/20261016-evidence-1623-BVA-FR17-11-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-11/logs/20261016-evidence-1623.json) |
| BVA-FR17-12 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/BVA-FR17-12/screenshots/20261016-evidence-1623-BVA-FR17-12-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/BVA-FR17-12/logs/20261016-evidence-1623.json) |
| TC17-01 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-01/screenshots/20261016-evidence-1623-TC17-01-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-01/logs/20261016-evidence-1623.json) |
| TC17-02 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-02/screenshots/20261016-evidence-1623-TC17-02-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-02/logs/20261016-evidence-1623.json) |
| TC17-03 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-03/screenshots/20261016-evidence-1623-TC17-03-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-03/logs/20261016-evidence-1623.json) |
| TC17-04 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-04/screenshots/20261016-evidence-1623-TC17-04-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-04/logs/20261016-evidence-1623.json) |
| TC17-09 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-09/screenshots/20261016-evidence-1623-TC17-09-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-09/logs/20261016-evidence-1623.json) |
| TC17-11 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-11/screenshots/20261016-evidence-1623-TC17-11-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-11/logs/20261016-evidence-1623.json) |
| TC17-12 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-12/screenshots/20261016-evidence-1623-TC17-12-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-12/logs/20261016-evidence-1623.json) |
| TC17-13 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-17-coupon-management/TC17-13/screenshots/20261016-evidence-1623-TC17-13-PASS.png) · [JSON](./../evidence/FR-17-coupon-management/TC17-13/logs/20261016-evidence-1623.json) |
