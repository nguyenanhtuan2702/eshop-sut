# FR-17: Quản lý mã giảm giá (Coupon CRUD)

## Bước 4. Phân tích giá trị biên (Boundary Value Analysis)

### 4.1. Mục tiêu

Boundary Value Analysis (BVA) là kỹ thuật kiểm thử tập trung vào các giá trị tại hoặc gần ranh giới của miền dữ liệu. Phương pháp này giúp phát hiện các lỗi có thể xảy ra khi điều kiện so sánh bị viết sai hoặc hệ thống xác định không chính xác giới hạn cho phép.

Dựa trên đặc tả FR-17, các điều kiện có biên số rõ ràng gồm:

1. Giá trị giảm phải lớn hơn 0.
2. Ngưỡng đơn hàng tối thiểu phải lớn hơn hoặc bằng 0.
3. Giới hạn số lượt sử dụng phải lớn hơn hoặc bằng 1.

Các trường như `code`, `type` và `expired_at` không được đặc tả theo một miền số có giới hạn tương tự. Do đó, chúng được kiểm tra bằng lớp tương đương hoặc bằng các điều kiện bắt buộc tương ứng.

### 4.2. Phân tích biên của giá trị giảm

#### 4.2.1. Xác định biên

Đặc tả quy định:

`discount_value > 0`

Biên dưới của miền giá trị hợp lệ là 0, nhưng 0 không thuộc miền hợp lệ vì yêu cầu phải lớn hơn 0.

Đối với các giá trị số nguyên được dùng trong bộ kiểm thử, ba giá trị đại diện là:

- -1: ngay dưới biên.
- 0: tại biên.
- 1: ngay trên biên.

Đặc tả không quy định giới hạn tối đa của `discount_value`. Vì vậy, không tự đặt ra giá trị tối đa hoặc coi một tỷ lệ phần trăm lớn hơn 100 là Invalid khi chưa có căn cứ.

#### 4.2.2. Thiết kế test case

| Mã test case | Loại mã | Giá trị `discount_value` | Vị trí so với biên | Kết quả mong đợi |
|---|---|---:|---|---|
| BVA-FR17-01 | `percent` | -1 | Ngay dưới biên | Từ chối vì giá trị giảm không dương |
| BVA-FR17-02 | `percent` | 0 | Tại biên | Từ chối vì giá trị giảm phải lớn hơn 0 |
| BVA-FR17-03 | `percent` | 1 | Ngay trên biên | Chấp nhận điều kiện giá trị giảm |
| BVA-FR17-04 | `fixed` | -1 | Ngay dưới biên | Từ chối vì giá trị giảm không dương |
| BVA-FR17-05 | `fixed` | 0 | Tại biên | Từ chối vì giá trị giảm phải lớn hơn 0 |
| BVA-FR17-06 | `fixed` | 1 | Ngay trên biên | Chấp nhận điều kiện giá trị giảm |

Các trường khác phải được thiết lập hợp lệ, gồm `code` duy nhất, `expired_at` được cung cấp, `min_order_amount = 0` và `max_uses_per_user = 1`.

Hai loại mã được kiểm tra riêng để bảo đảm giá trị giảm dương được xử lý đúng trong cả hai nhánh `percent` và `fixed`. Giá trị 1 được sử dụng để kiểm tra điều kiện dương, không có nghĩa là đặc tả đã quy định cách làm tròn hay giới hạn tối đa của giá trị giảm.

### 4.3. Phân tích biên của ngưỡng đơn hàng tối thiểu

#### 4.3.1. Xác định biên

Đặc tả quy định:

`min_order_amount >= 0`

Biên dưới là 0 và thuộc miền hợp lệ.

Các giá trị đại diện được lựa chọn:

- -1: ngay dưới biên.
- 0: tại biên.
- 1: ngay trên biên.

#### 4.3.2. Thiết kế test case

| Mã test case | Giá trị `min_order_amount` | Vị trí so với biên | Kết quả mong đợi |
|---|---:|---|---|
| BVA-FR17-07 | -1 | Ngay dưới biên | Từ chối vì ngưỡng đơn hàng âm |
| BVA-FR17-08 | 0 | Tại biên | Chấp nhận điều kiện ngưỡng đơn hàng |
| BVA-FR17-09 | 1 | Ngay trên biên | Chấp nhận điều kiện ngưỡng đơn hàng |

Các trường khác phải được chuẩn bị hợp lệ, chẳng hạn `code` duy nhất, `type = percent`, `discount_value = 1`, ngày hết hạn được cung cấp và `max_uses_per_user = 1`.

Giá trị 0 và 1 đều thuộc miền Valid theo đặc tả. Điểm khác biệt là test case tại biên 0 giúp kiểm tra hệ thống không từ chối nhầm một giá trị được cho phép.

### 4.4. Phân tích biên của giới hạn lượt sử dụng

#### 4.4.1. Xác định biên

Đặc tả quy định:

`max_uses_per_user >= 1`

Biên dưới của miền hợp lệ là 1.

Đối với các giá trị nguyên dùng để biểu diễn số lượt sử dụng, ba giá trị đại diện là:

- 0: ngay dưới biên.
- 1: tại biên.
- 2: ngay trên biên.

Đặc tả không ghi rõ kiểu dữ liệu bắt buộc là số nguyên, nhưng đây là trường biểu diễn số lượt sử dụng. Bộ test case sử dụng giá trị nguyên để kiểm tra giới hạn theo đúng ý nghĩa của trường.

#### 4.4.2. Thiết kế test case

| Mã test case | Giá trị `max_uses_per_user` | Vị trí so với biên | Kết quả mong đợi |
|---|---:|---|---|
| BVA-FR17-10 | 0 | Ngay dưới biên | Từ chối vì giới hạn lượt dùng nhỏ hơn 1 |
| BVA-FR17-11 | 1 | Tại biên | Chấp nhận điều kiện giới hạn lượt dùng |
| BVA-FR17-12 | 2 | Ngay trên biên | Chấp nhận điều kiện giới hạn lượt dùng |

Các trường còn lại phải hợp lệ, gồm `code` duy nhất, `type = fixed`, `discount_value = 1`, ngày hết hạn được cung cấp và `min_order_amount = 0`.

BVA ở đây kiểm tra giới hạn cấu hình cho phép của một mã. Nó không kiểm tra số lượt mà một người dùng đã sử dụng thực tế; điều kiện đó thuộc FR-09.

### 4.5. Những điều kiện không áp dụng BVA trực tiếp

Các điều kiện sau không có miền số với biên được đặc tả tương tự ba trường trên:

- `code` phải duy nhất: kiểm tra bằng lớp tương đương với mã mới, mã trùng và mã thiếu.
- `type` chỉ nhận `percent` hoặc `fixed`: kiểm tra bằng các lớp tương đương.
- `expired_at` là trường bắt buộc: kiểm tra bằng lớp có dữ liệu và lớp bỏ trống.

Đặc tả FR-17 không quy định rõ ngày hết hạn phải nằm trong tương lai hoặc không được ở quá khứ. Vì vậy, không sử dụng ngày quá khứ như một giá trị Invalid của FR-17 nếu chưa có yêu cầu bổ sung.

Tương tự, đặc tả không quy định giới hạn trên của `discount_value` và `min_order_amount`. Không tự thêm các test case có giá trị quá lớn rồi mặc định kết quả mong đợi là Invalid.

### 4.6. Bảng tổng hợp test case BVA

| Mã test case | Điều kiện kiểm tra | Giá trị | Kết quả mong đợi |
|---|---|---:|---|
| BVA-FR17-01 | `discount_value > 0`, percent | -1 | Từ chối |
| BVA-FR17-02 | `discount_value > 0`, percent | 0 | Từ chối |
| BVA-FR17-03 | `discount_value > 0`, percent | 1 | Chấp nhận điều kiện |
| BVA-FR17-04 | `discount_value > 0`, fixed | -1 | Từ chối |
| BVA-FR17-05 | `discount_value > 0`, fixed | 0 | Từ chối |
| BVA-FR17-06 | `discount_value > 0`, fixed | 1 | Chấp nhận điều kiện |
| BVA-FR17-07 | `min_order_amount >= 0` | -1 | Từ chối |
| BVA-FR17-08 | `min_order_amount >= 0` | 0 | Chấp nhận điều kiện |
| BVA-FR17-09 | `min_order_amount >= 0` | 1 | Chấp nhận điều kiện |
| BVA-FR17-10 | `max_uses_per_user >= 1` | 0 | Từ chối |
| BVA-FR17-11 | `max_uses_per_user >= 1` | 1 | Chấp nhận điều kiện |
| BVA-FR17-12 | `max_uses_per_user >= 1` | 2 | Chấp nhận điều kiện |

### 4.7. Ghi nhận kết quả thực thi

Các test case trên mới là thiết kế ban đầu. Sau khi chạy ứng dụng, cập nhật kết quả thực tế theo bảng sau:

| Mã test case | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|
| BVA-FR17-01 đến BVA-FR17-12 | Theo bảng test case BVA | Chưa thực thi | Not Run | Chưa có |

Chỉ chuyển trạng thái sang Pass hoặc Fail sau khi thực thi và so sánh với kết quả mong đợi. Nếu xảy ra sai lệch, lưu ảnh chụp màn hình hoặc bằng chứng phù hợp và tạo bug report nếu đã xác minh được lỗi.

