# FR-09 Coupons — execution results

- Run ID: `20261016-155435`
- Thời điểm bắt đầu ghi nhận: 2026-10-16T08:55:14.182Z
- Tổng thời lượng các test đã ghi nhận: 17.79 giây
- Môi trường: Windows_NT 10.0.26300, Node.js v24.15.0; Web http://localhost:5173; Admin http://localhost:5174; API http://localhost:3000/api.
- Tài khoản Admin được đọc từ biến môi trường; không ghi credential hoặc token vào báo cáo.

| Test Case ID | Test Source | Test Description | Expected Result | Actual Result | Status | Evidence/Log |
|---|---|---|---|---|---|---|
| TC09-01 | Domain Testing | Áp dụng mã phần trăm SAVE10 | Chấp nhận; giảm 50.000 ₫; số tiền cuối cùng 450.000 ₫. | {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"},"display":"✅ Áp dụng thành công! Giảm 10%\n\nTiết kiệm: -4,500,000 ₫\n\nThành tiền: 5,000,000 ₫","error":"","expectedPercent":10,"orderTotal":500000} | FAIL | [JSON](./../evidence/FR-09-coupons/TC09-01/logs/20261016-155435.json) · [screenshot](./../evidence/FR-09-coupons/TC09-01/screenshots/20261016-155435-TC09-01-FAIL.png) · [trace](./../evidence/FR-09-coupons/TC09-01/traces/20261016-155435-TC09-01-trace.zip) |
| TC09-02 | Domain Testing | Từ chối mã không tồn tại | Từ chối áp dụng mã vì mã không tồn tại. | {"applied":false,"httpStatus":404,"responseBody":{"error":"Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"},"display":"","error":"Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"} | PASS | [JSON](./../evidence/FR-09-coupons/TC09-02/logs/20261016-155435.json) |
| TC09-03 | Domain Testing | Từ chối mã đang bị vô hiệu hóa | Từ chối áp dụng vì mã tồn tại nhưng không hoạt động. | {"applied":false,"httpStatus":404,"responseBody":{"error":"Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"},"display":"","error":"Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa"} | PASS | [JSON](./../evidence/FR-09-coupons/TC09-03/logs/20261016-155435.json) |
| TC09-04 | Domain Testing | Từ chối mã EXPIRED | Từ chối áp dụng vì ngày hiện tại không còn trước ngày hết hạn. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Mã giảm giá đã hết hạn"},"display":"","error":"Mã giảm giá đã hết hạn"} | PASS | [JSON](./../evidence/FR-09-coupons/TC09-04/logs/20261016-155435.json) |
| TC09-05 | Domain Testing | Từ chối đơn hàng thấp hơn ngưỡng BIGBUY | Từ chối vì 499.999 ₫ nhỏ hơn ngưỡng 500.000 ₫. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"} | PASS | [JSON](./../evidence/FR-09-coupons/TC09-05/logs/20261016-155435.json) |
| TC09-06 | Domain Testing | Từ chối áp dụng coupon khi chưa đăng nhập | Từ chối áp dụng mã do người dùng chưa đăng nhập. | {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"},"display":"✅ Áp dụng thành công! Giảm 10%\n\nTiết kiệm: -4,500,000 ₫\n\nThành tiền: 5,000,000 ₫","error":""} | FAIL | [JSON](./../evidence/FR-09-coupons/TC09-06/logs/20261016-155435.json) · [screenshot](./../evidence/FR-09-coupons/TC09-06/screenshots/20261016-155435-TC09-06-FAIL.png) · [trace](./../evidence/FR-09-coupons/TC09-06/traces/20261016-155435-TC09-06-trace.zip) |
| TC09-07 | Domain Testing | Từ chối JWT không hợp lệ | Từ chối áp dụng mã do JWT không hợp lệ hoặc hết hạn. | {"status":200,"body":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"}} | FAIL | [JSON](./../evidence/FR-09-coupons/TC09-07/logs/20261016-155435.json) · [trace](./../evidence/FR-09-coupons/TC09-07/traces/20261016-155435-TC09-07-trace.zip) |
| TC09-08 | Domain Testing | Từ chối coupon đã dùng hết lượt | Từ chối vì người dùng đã dùng SAVE10 đủ 1 lần. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Bạn đã sử dụng mã này 1 lần (đã đạt giới hạn)"},"display":"","error":"Bạn đã sử dụng mã này 1 lần (đã đạt giới hạn)"} | PASS | [JSON](./../evidence/FR-09-coupons/TC09-08/logs/20261016-155435.json) |
| TC09-09 | Domain Testing | Áp dụng mã giảm cố định BIGBUY | Chấp nhận; giảm 50.000 ₫; số tiền cuối cùng 450.000 ₫. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này","orderTotal":500000} | FAIL | [JSON](./../evidence/FR-09-coupons/TC09-09/logs/20261016-155435.json) · [screenshot](./../evidence/FR-09-coupons/TC09-09/screenshots/20261016-155435-TC09-09-FAIL.png) · [trace](./../evidence/FR-09-coupons/TC09-09/traces/20261016-155435-TC09-09-trace.zip) |
| BVA-FR09-01 | BVA | Tổng đơn hàng ngay dưới ngưỡng BIGBUY | Từ chối áp dụng mã tại 499.999 ₫. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này","total":499999,"coupon":"BIGBUY","recordedUseCount":0,"expectedAccepted":false} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-01/logs/20261016-155435.json) |
| BVA-FR09-02 | BVA | Tổng đơn hàng đúng ngưỡng BIGBUY | Chấp nhận; giảm 50.000 ₫; còn 450.000 ₫. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này","total":500000,"coupon":"BIGBUY","recordedUseCount":0,"expectedAccepted":true} | FAIL | [JSON](./../evidence/FR-09-coupons/BVA-FR09-02/logs/20261016-155435.json) · [screenshot](./../evidence/FR-09-coupons/BVA-FR09-02/screenshots/20261016-155435-BVA-FR09-02-FAIL.png) · [trace](./../evidence/FR-09-coupons/BVA-FR09-02/traces/20261016-155435-BVA-FR09-02-trace.zip) |
| BVA-FR09-03 | BVA | Tổng đơn hàng ngay trên ngưỡng BIGBUY | Chấp nhận; giảm 50.000 ₫; còn 450.001 ₫. | {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":2,"discount_amount":50000,"final_amount":450001,"message":"Áp dụng thành công! Giảm 50,000 ₫"},"display":"✅ Áp dụng thành công! Giảm 50,000 ₫\n\nTiết kiệm: 50,000 ₫\n\nThành tiền: 450,001 ₫","error":"","total":500001,"coupon":"BIGBUY","recordedUseCount":0,"expectedAccepted":true} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-03/logs/20261016-155435.json) |
| BVA-FR09-04 | BVA | Ngày hết hạn nằm trước T0 | Từ chối áp dụng do mã đã hết hạn. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Mã giảm giá đã hết hạn"},"display":"","error":"Mã giảm giá đã hết hạn","total":500000,"coupon":"QA20261016155435YESTERDAY","recordedUseCount":0,"expectedAccepted":false} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-04/logs/20261016-155435.json) |
| BVA-FR09-05 | BVA | Ngày hết hạn bằng T0 | Từ chối theo điều kiện ngày hiện tại phải trước ngày hết hạn. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Mã giảm giá đã hết hạn"},"display":"","error":"Mã giảm giá đã hết hạn","total":500000,"coupon":"QA20261016155435TODAY","recordedUseCount":0,"expectedAccepted":false} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-05/logs/20261016-155435.json) |
| BVA-FR09-06 | BVA | Ngày hết hạn nằm sau T0 | Chấp nhận điều kiện hạn sử dụng. | {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":152,"discount_amount":0,"final_amount":500000,"message":"Áp dụng thành công! Giảm 1%"},"display":"✅ Áp dụng thành công! Giảm 1%\n\nTiết kiệm: 0 ₫\n\nThành tiền: 500,000 ₫","error":"","total":500000,"coupon":"QA20261016155435TOMORROW","recordedUseCount":0,"expectedAccepted":true} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-06/logs/20261016-155435.json) |
| BVA-FR09-07 | BVA | Số lượt đã dùng ngay dưới giới hạn VIP100 | Chấp nhận khi đã dùng 1 trong tối đa 2 lượt. | {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":3,"discount_amount":100000,"final_amount":400000,"message":"Áp dụng thành công! Giảm 100,000 ₫"},"display":"✅ Áp dụng thành công! Giảm 100,000 ₫\n\nTiết kiệm: 100,000 ₫\n\nThành tiền: 400,000 ₫","error":"","total":500000,"coupon":"VIP100","recordedUseCount":1,"expectedAccepted":true} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-07/logs/20261016-155435.json) |
| BVA-FR09-08 | BVA | Số lượt đã dùng bằng giới hạn VIP100 | Từ chối khi đã dùng đủ 2 lượt. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Bạn đã sử dụng mã này 2 lần (đã đạt giới hạn)"},"display":"","error":"Bạn đã sử dụng mã này 2 lần (đã đạt giới hạn)","total":500000,"coupon":"VIP100","recordedUseCount":2,"expectedAccepted":false} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-08/logs/20261016-155435.json) |
| BVA-FR09-09 | BVA | Số lượt đã dùng vượt giới hạn VIP100 | Từ chối khi số lượt đã dùng là 3, lớn hơn giới hạn 2. | {"applied":false,"httpStatus":400,"responseBody":{"error":"Bạn đã sử dụng mã này 2 lần (đã đạt giới hạn)"},"display":"","error":"Bạn đã sử dụng mã này 2 lần (đã đạt giới hạn)","total":500000,"coupon":"VIP100","recordedUseCount":3,"expectedAccepted":false} | PASS | [JSON](./../evidence/FR-09-coupons/BVA-FR09-09/logs/20261016-155435.json) |

## Tổng kết

- Tổng số test case trong tài liệu: **18**.
- Số test case có script tự động hóa: **18**.
- Số test đã thực sự chạy và có execution log: **18**.
- PASS: **13**; FAIL: **5**; BLOCKED: **0**; NOT AUTOMATED: **0**.

### Test case thất bại

- **TC09-01** — Actual: {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"},"display":"✅ Áp dụng thành công! Giảm 10%\n\nTiết kiệm: -4,500,000 ₫\n\nThành tiền: 5,000,000 ₫","error":"","expectedPercent":10,"orderTotal":500000} Expected không thay đổi so với test plan.
- **TC09-06** — Actual: {"applied":true,"httpStatus":200,"responseBody":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"},"display":"✅ Áp dụng thành công! Giảm 10%\n\nTiết kiệm: -4,500,000 ₫\n\nThành tiền: 5,000,000 ₫","error":""} Expected không thay đổi so với test plan.
- **TC09-07** — Actual: {"status":200,"body":{"success":true,"coupon_id":1,"discount_amount":-4500000,"final_amount":5000000,"message":"Áp dụng thành công! Giảm 10%"}} Expected không thay đổi so với test plan.
- **TC09-09** — Actual: {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này","orderTotal":500000} Expected không thay đổi so với test plan.
- **BVA-FR09-02** — Actual: {"applied":false,"httpStatus":400,"responseBody":{"error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này"},"display":"","error":"Đơn hàng chưa đủ giá trị tối thiểu 500,000 ₫ để áp dụng mã này","total":500000,"coupon":"BIGBUY","recordedUseCount":0,"expectedAccepted":true} Expected không thay đổi so với test plan.

### Test case chưa chạy hoặc không tự động hóa

- Không có test case BLOCKED.

## Evidence bổ sung

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-09-coupons/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR09-01 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-01/logs/20261016-155435.json) |
| BVA-FR09-03 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-03/logs/20261016-155435.json) |
| BVA-FR09-04 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-04/logs/20261016-155435.json) |
| BVA-FR09-05 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-05/logs/20261016-155435.json) |
| BVA-FR09-06 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-06/logs/20261016-155435.json) |
| BVA-FR09-07 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-07/logs/20261016-155435.json) |
| BVA-FR09-08 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-08/logs/20261016-155435.json) |
| BVA-FR09-09 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/BVA-FR09-09/logs/20261016-155435.json) |
| TC09-02 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/TC09-02/logs/20261016-155435.json) |
| TC09-03 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/TC09-03/logs/20261016-155435.json) |
| TC09-04 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/TC09-04/logs/20261016-155435.json) |
| TC09-05 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/TC09-05/logs/20261016-155435.json) |
| TC09-08 | PASS | `20261016-evidence-1623` | [JSON](./../evidence/FR-09-coupons/TC09-08/logs/20261016-155435.json) |

### Run `20261016-evidence-1623`

Các dòng dưới đây thuộc lần chạy bổ sung; kết quả và trạng thái của lần chạy lịch sử ở trên không bị thay đổi.

- Console log của lần chạy bổ sung: [console log](./../evidence/FR-09-coupons/_runs/20261016-evidence-1623-console.log).

| Test Case ID | Actual Status lần chạy bổ sung | Execution ID | Evidence |
|---|---|---|---|
| BVA-FR09-01 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-01/screenshots/20261016-evidence-1623-BVA-FR09-01-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-01/logs/20261016-evidence-1623.json) |
| BVA-FR09-03 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-03/screenshots/20261016-evidence-1623-BVA-FR09-03-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-03/logs/20261016-evidence-1623.json) |
| BVA-FR09-04 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-04/screenshots/20261016-evidence-1623-BVA-FR09-04-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-04/logs/20261016-evidence-1623.json) |
| BVA-FR09-05 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-05/screenshots/20261016-evidence-1623-BVA-FR09-05-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-05/logs/20261016-evidence-1623.json) |
| BVA-FR09-06 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-06/screenshots/20261016-evidence-1623-BVA-FR09-06-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-06/logs/20261016-evidence-1623.json) |
| BVA-FR09-07 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-07/screenshots/20261016-evidence-1623-BVA-FR09-07-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-07/logs/20261016-evidence-1623.json) |
| BVA-FR09-08 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-08/screenshots/20261016-evidence-1623-BVA-FR09-08-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-08/logs/20261016-evidence-1623.json) |
| BVA-FR09-09 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/BVA-FR09-09/screenshots/20261016-evidence-1623-BVA-FR09-09-PASS.png) · [JSON](./../evidence/FR-09-coupons/BVA-FR09-09/logs/20261016-evidence-1623.json) |
| TC09-02 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/TC09-02/screenshots/20261016-evidence-1623-TC09-02-PASS.png) · [JSON](./../evidence/FR-09-coupons/TC09-02/logs/20261016-evidence-1623.json) |
| TC09-03 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/TC09-03/screenshots/20261016-evidence-1623-TC09-03-PASS.png) · [JSON](./../evidence/FR-09-coupons/TC09-03/logs/20261016-evidence-1623.json) |
| TC09-04 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/TC09-04/screenshots/20261016-evidence-1623-TC09-04-PASS.png) · [JSON](./../evidence/FR-09-coupons/TC09-04/logs/20261016-evidence-1623.json) |
| TC09-05 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/TC09-05/screenshots/20261016-evidence-1623-TC09-05-PASS.png) · [JSON](./../evidence/FR-09-coupons/TC09-05/logs/20261016-evidence-1623.json) |
| TC09-08 | PASS | `20261016-evidence-1623` | [screenshot](./../evidence/FR-09-coupons/TC09-08/screenshots/20261016-evidence-1623-TC09-08-PASS.png) · [JSON](./../evidence/FR-09-coupons/TC09-08/logs/20261016-evidence-1623.json) |
