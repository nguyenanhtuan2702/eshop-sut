# FR-09: Mã giảm giá (Discount Coupons)

## Bước 4. Phân tích giá trị biên (Boundary Value Analysis)

### 4.1. Mục tiêu

Boundary Value Analysis (BVA) là kỹ thuật kiểm thử tập trung vào các giá trị tại hoặc gần ranh giới của miền dữ liệu. Kỹ thuật này giúp phát hiện những lỗi có thể xuất hiện khi hệ thống so sánh sai giới hạn, sử dụng sai toán tử hoặc xác định sai thời điểm hết hạn.

Dựa trên đặc tả FR-09, các điều kiện có ngưỡng rõ ràng được lựa chọn để áp dụng BVA gồm:

1. Tổng tiền đơn hàng phải lớn hơn hoặc bằng ngưỡng tối thiểu của mã giảm giá.
2. Ngày hiện tại phải trước ngày hết hạn của mã.
3. Số lượt sử dụng của người dùng phải nhỏ hơn giới hạn lượt dùng.

Các điều kiện như mã tồn tại, trạng thái đăng nhập và loại mã giảm giá được kiểm tra bằng Domain Testing vì chúng không có một miền giá trị số có biên tương tự các điều kiện trên.

### 4.2. Phân tích biên của tổng tiền đơn hàng

#### 4.2.1. Xác định biên

Theo đặc tả, tổng tiền đơn hàng phải thỏa mãn:

`total >= min_order_amount`

Để kiểm thử điều kiện này, sử dụng mã `BIGBUY` có ngưỡng đơn hàng tối thiểu là 500.000 ₫.

- Biên dưới: 500.000 ₫.
- Giá trị ngay dưới biên: 499.999 ₫.
- Giá trị tại biên: 500.000 ₫.
- Giá trị ngay trên biên: 500.001 ₫.

Với đơn vị tiền được biểu diễn bằng đồng nguyên, ba giá trị liên tiếp này được dùng để kiểm tra việc so sánh với ngưỡng tối thiểu.

#### 4.2.2. Thiết kế test case

| Mã test case | Mã giảm giá | Tổng tiền đơn hàng | Vị trí so với biên | Kết quả mong đợi |
|---|---|---:|---|---|
| BVA-FR09-01 | BIGBUY | 499.999 ₫ | Ngay dưới biên | Từ chối áp dụng mã |
| BVA-FR09-02 | BIGBUY | 500.000 ₫ | Tại biên | Chấp nhận mã; giảm 50.000 ₫; còn 450.000 ₫ |
| BVA-FR09-03 | BIGBUY | 500.001 ₫ | Ngay trên biên | Chấp nhận mã; giảm 50.000 ₫; còn 450.001 ₫ |

**Điều kiện cần giữ cố định:**

- `BIGBUY` tồn tại, đang hoạt động và còn hạn.
- Người dùng có JWT Token hợp lệ.
- Người dùng chưa sử dụng mã.
- Giới hạn sử dụng của mã không bị vượt quá.

Chỉ thay đổi tổng tiền đơn hàng giữa ba trường hợp để kiểm tra riêng điều kiện ngưỡng tối thiểu.

### 4.3. Phân tích biên của hạn sử dụng

#### 4.3.1. Xác định biên

Đặc tả quy định:

`Ngày hiện tại < expired_at`

Vì điều kiện sử dụng yêu cầu ngày hiện tại phải đứng trước ngày hết hạn, giá trị bằng ngày hết hạn không đáp ứng điều kiện theo cách hiểu trực tiếp của đặc tả.

Gọi `T0` là ngày kiểm thử được sử dụng làm mốc so sánh. Các giá trị được chọn như sau:

- `T0 - 1 ngày`: ngày hết hạn nằm trước ngày hiện tại.
- `T0`: ngày hết hạn trùng ngày hiện tại.
- `T0 + 1 ngày`: ngày hết hạn nằm sau ngày hiện tại.

#### 4.3.2. Thiết kế test case

| Mã test case | Ngày hết hạn của mã | Vị trí so với biên | Kết quả mong đợi |
|---|---|---|---|
| BVA-FR09-04 | `T0 - 1 ngày` | Trước biên | Từ chối áp dụng vì mã đã hết hạn |
| BVA-FR09-05 | `T0` | Tại biên | Từ chối theo điều kiện ngày hiện tại phải trước ngày hết hạn |
| BVA-FR09-06 | `T0 + 1 ngày` | Sau biên | Chấp nhận điều kiện hạn sử dụng |

Các test case này cần sử dụng một mã kiểm thử có trạng thái hoạt động, tổng tiền đơn hàng đạt ngưỡng và người dùng chưa sử dụng hết lượt.

**Lưu ý về đặc tả:** SRS sử dụng trường `expired_at` và mô tả điều kiện theo ngày, nhưng chưa nói rõ múi giờ hoặc thời điểm hết hạn trong ngày. Khi thực thi, cần ghi nhận định dạng thực tế của trường dữ liệu và xác minh hệ thống so sánh ngày hay timestamp. Nếu trường lưu timestamp, có thể sử dụng các giá trị ngay trước, tại và ngay sau thời điểm hết hạn để kiểm tra sát hơn.

### 4.4. Phân tích biên của số lượt sử dụng

#### 4.4.1. Xác định biên

Đặc tả quy định:

`used_count < max_uses_per_user`

Sử dụng mã `VIP100`, có giới hạn tối đa 2 lần cho mỗi người dùng.

Miền hợp lệ của số lượt đã dùng là các giá trị nhỏ hơn 2. Tại giá trị 2, người dùng đã sử dụng hết lượt. Giá trị 3 được chọn để kiểm tra trường hợp số lượt đã vượt giới hạn.

Các giá trị đại diện quanh biên là:

- `max_uses_per_user - 1 = 1`: ngay dưới giới hạn.
- `max_uses_per_user = 2`: tại giới hạn.
- `max_uses_per_user + 1 = 3`: ngay trên giới hạn.

#### 4.4.2. Thiết kế test case

| Mã test case | Giới hạn lượt dùng | Số lượt đã dùng | Vị trí so với biên | Kết quả mong đợi |
|---|---:|---:|---|---|
| BVA-FR09-07 | 2 | 1 | Ngay dưới biên | Chấp nhận mã nếu các điều kiện khác hợp lệ |
| BVA-FR09-08 | 2 | 2 | Tại biên | Từ chối vì đã dùng hết lượt |
| BVA-FR09-09 | 2 | 3 | Ngay trên biên | Từ chối vì số lượt đã dùng không nhỏ hơn giới hạn |

**Dữ liệu cố định cho ba test case:**

- Mã `VIP100` đang hoạt động và chưa hết hạn.
- Tổng tiền đơn hàng là 500.000 ₫, cao hơn ngưỡng 300.000 ₫.
- Người dùng có JWT Token hợp lệ.
- Mã có loại `fixed`, giá trị giảm 100.000 ₫ và giới hạn 2 lần/người.

Ở trường hợp số lượt đã dùng bằng 1, mã được phép áp dụng theo điều kiện giới hạn lượt dùng. Khi số lượt đã dùng bằng 2 hoặc 3, hệ thống phải từ chối áp dụng mã.

Để các lần kiểm thử độc lập, cần chuẩn bị dữ liệu người dùng hoặc trạng thái sử dụng tương ứng cho từng trường hợp. Trường hợp số lượt đã dùng bằng 3 có thể cần dữ liệu kiểm thử được thiết lập sẵn trong môi trường thử nghiệm, vì trạng thái này không nên phát sinh từ một hệ thống tuân thủ đúng giới hạn sử dụng.

### 4.5. Các điều kiện không áp dụng BVA trực tiếp

Trong FR-09, các điều kiện sau không có miền giá trị số với biên được quy định tương tự ba nhóm trên:

- Mã giảm giá có tồn tại hay không.
- Mã giảm giá có đang hoạt động hay không.
- Người dùng có JWT Token hợp lệ hay không.
- Loại giảm giá là `percent` hay `fixed`.

Các điều kiện này đã được phân chia và kiểm thử bằng các lớp tương đương trong phần Domain Testing.

Đặc tả FR-09 cũng không quy định giá trị giảm giá tối đa hoặc giới hạn trên của tổng tiền đơn hàng. Do đó, không tự đặt ra một biên trên cho các trường này trong BVA. Điều kiện giá trị giảm phải dương thuộc FR-17 – Quản lý mã giảm giá, không phải một ngưỡng trên được xác định bởi FR-09.

### 4.6. Bảng tổng hợp test case BVA

| Mã test case | Điều kiện kiểm tra | Giá trị biên | Kết quả mong đợi |
|---|---|---|---|
| BVA-FR09-01 | Tổng tiền đơn hàng | 499.999 ₫ | Từ chối |
| BVA-FR09-02 | Tổng tiền đơn hàng | 500.000 ₫ | Chấp nhận |
| BVA-FR09-03 | Tổng tiền đơn hàng | 500.001 ₫ | Chấp nhận |
| BVA-FR09-04 | Hạn sử dụng | `T0 - 1 ngày` | Từ chối |
| BVA-FR09-05 | Hạn sử dụng | `T0` | Từ chối theo điều kiện so sánh nghiêm ngặt |
| BVA-FR09-06 | Hạn sử dụng | `T0 + 1 ngày` | Chấp nhận điều kiện hạn sử dụng |
| BVA-FR09-07 | Số lượt đã dùng | 1 | Chấp nhận |
| BVA-FR09-08 | Số lượt đã dùng | 2 | Từ chối |
| BVA-FR09-09 | Số lượt đã dùng | 3 | Từ chối |

### 4.7. Ghi nhận kết quả thực thi

Các kết quả trong bảng là kết quả mong đợi theo đặc tả, chưa phải kết quả thực tế. Sau khi chạy ứng dụng, cập nhật bảng theo mẫu:

| Mã test case | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|
| BVA-FR09-01 | Từ chối | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-02 | Chấp nhận | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-03 | Chấp nhận | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-04 | Từ chối | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-05 | Từ chối theo đặc tả | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-06 | Chấp nhận điều kiện hạn sử dụng | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-07 | Chấp nhận | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-08 | Từ chối | Chưa thực thi | Not Run | Chưa có |
| BVA-FR09-09 | Từ chối | Chưa thực thi | Not Run | Chưa có |

Chỉ chuyển trạng thái sang Pass hoặc Fail khi đã thực thi và so sánh kết quả thực tế với kết quả mong đợi. Nếu phát hiện sai lệch, lưu ảnh chụp màn hình hoặc bằng chứng phù hợp, đồng thời liên kết với bug report nếu đã xác minh được lỗi.

