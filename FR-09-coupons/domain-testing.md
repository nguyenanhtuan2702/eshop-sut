# FR-09: Mã giảm giá (Discount Coupons)

## Bước 1. Xác định biến đầu vào và đầu ra

### 1.1. Mô tả chức năng

FR-09 – Mã giảm giá là chức năng cho phép người dùng nhập mã giảm giá tại bước thanh toán (Checkout) của hệ thống EShop.

Hệ thống chỉ áp dụng mã giảm giá khi tất cả năm điều kiện nghiệp vụ được quy định trong đặc tả đều thỏa mãn. Sau khi xác định mã có hợp lệ hay không, hệ thống tính số tiền được giảm và số tiền cuối cùng cần thanh toán theo loại mã giảm giá.

Mục tiêu của bước này là xác định các biến đầu vào, biến đầu ra và điều kiện nghiệp vụ làm cơ sở để xây dựng các lớp tương đương trong bước tiếp theo.

### 1.2. Xác định các biến đầu vào

| Mã | Biến đầu vào | Mô tả | Nguồn dữ liệu |
|---|---|---|---|
| I1 | Mã giảm giá (`code`) | Mã do người dùng nhập tại Checkout. | Người dùng |
| I2 | Tổng tiền đơn hàng (`total`) | Tổng tiền đơn hàng dùng để so sánh với ngưỡng tối thiểu và tính số tiền giảm. | Dữ liệu đơn hàng/giỏ hàng |
| I3 | JWT Token | Token xác thực danh tính và trạng thái đăng nhập của người dùng. | Phiên đăng nhập |
| I4 | Trạng thái mã (`is_active`) | Cho biết mã giảm giá có đang hoạt động hay không. | Dữ liệu mã giảm giá |
| I5 | Ngày hết hạn (`expired_at`) | Thời điểm/ngày hết hạn của mã giảm giá. | Dữ liệu mã giảm giá |
| I6 | Ngưỡng đơn hàng tối thiểu (`min_order_amount`) | Tổng tiền tối thiểu để được áp dụng mã. | Dữ liệu mã giảm giá |
| I7 | Loại mã (`type`) | Quy định cách tính giảm giá: `percent` hoặc `fixed`. | Dữ liệu mã giảm giá |
| I8 | Giá trị giảm (`discount_value`) | Tỷ lệ phần trăm hoặc số tiền cố định được giảm. | Dữ liệu mã giảm giá |
| I9 | Số lượt đã sử dụng (`used_count`) | Số lần người dùng hiện tại đã sử dụng mã giảm giá tương ứng. | Dữ liệu sử dụng mã |
| I10 | Giới hạn lượt dùng (`max_uses_per_user`) | Số lần tối đa một người dùng được phép sử dụng mã. | Dữ liệu mã giảm giá |

**Lưu ý:** I4–I8 và I10 là các thuộc tính cấu hình của mã giảm giá trong hệ thống, không phải tất cả đều do người dùng nhập trực tiếp tại Checkout. I9 là trạng thái sử dụng được hệ thống xác định cho người dùng hiện tại.

### 1.3. Xác định các điều kiện nghiệp vụ

Dựa trên đặc tả FR-09 trong SRS, chức năng áp dụng mã giảm giá có năm điều kiện bắt buộc:

| Mã điều kiện | Điều kiện nghiệp vụ | Yêu cầu |
|---|---|---|
| C1 | Mã giảm giá tồn tại và đang hoạt động | Mã phải tồn tại trong cơ sở dữ liệu và có `is_active = 1`. |
| C2 | Mã còn hạn sử dụng | Ngày hiện tại phải trước `expired_at`. |
| C3 | Tổng tiền đạt ngưỡng tối thiểu | `total >= min_order_amount`. |
| C4 | Người dùng đã đăng nhập | Người dùng phải có JWT Token hợp lệ. |
| C5 | Người dùng chưa sử dụng hết lượt | `used_count < max_uses_per_user`. |

Ngoài năm điều kiện trên, hệ thống có hai cách tính giảm giá dựa trên loại mã:

- **Mã phần trăm (`percent`):**

  `discount_amount = total × discount_value / 100`

- **Mã giảm số tiền cố định (`fixed`):**

  `discount_amount = discount_value`

Số tiền cuối cùng được xác định theo công thức:

`final_amount = total - discount_amount`

### 1.4. Xác định các biến đầu ra

| Mã | Biến đầu ra | Mô tả |
|---|---|---|
| O1 | Kết quả áp dụng mã | Cho biết mã giảm giá có được chấp nhận hay bị từ chối. |
| O2 | Số tiền giảm (`discount_amount`) | Số tiền được giảm nếu mã được chấp nhận. |
| O3 | Số tiền cuối cùng (`final_amount`) | Số tiền phải thanh toán sau khi trừ khoản giảm giá. |
| O4 | Phản hồi của hệ thống | Thông tin về kết quả áp dụng mã, chẳng hạn được chấp nhận hoặc bị từ chối. |

Đặc tả FR-09 không quy định chính xác nội dung và cách hiển thị thông báo lỗi cho từng trường hợp. Vì vậy, ở giai đoạn thiết kế, chỉ xác định kết quả nghiệp vụ mong đợi; nội dung thông báo thực tế sẽ được ghi nhận khi thực thi kiểm thử.

### 1.5. Những thông tin chưa được quy định rõ

Một số chi tiết không được xác định rõ trong FR-09 và cần được ghi nhận thay vì tự đặt ra yêu cầu mới:

1. Hệ thống có phân biệt chữ hoa, chữ thường hoặc tự loại bỏ khoảng trắng của mã giảm giá hay không.
2. Cách xử lý cụ thể khi người dùng gửi mã rỗng.
3. Quy tắc làm tròn khi số tiền giảm theo phần trăm có phần thập phân.
4. Việc giới hạn số tiền giảm để `final_amount` không âm có được áp dụng hay không.
5. Thời điểm một lượt sử dụng được tính là đã tiêu thụ: khi áp dụng mã, khi đặt hàng hay khi hoàn tất thanh toán.
6. Múi giờ và cách xử lý chính xác tại thời điểm hết hạn.
7. Nội dung thông báo lỗi cụ thể cho từng điều kiện không thỏa mãn.

Các điểm này sẽ được xem xét khi đối chiếu với mã nguồn, chạy thử hệ thống hoặc cần xác nhận thêm từ giảng viên.

---

## Bước 2. Xác định các lớp tương đương

### 2.1. Nguyên tắc phân chia

Dựa trên các điều kiện nghiệp vụ ở Bước 1, miền dữ liệu của FR-09 được chia thành các lớp tương đương hợp lệ (Valid Equivalence Classes) và không hợp lệ (Invalid Equivalence Classes).

Các giá trị trong cùng một lớp được kỳ vọng có cùng kết quả nghiệp vụ. Nếu có lý do để cho rằng hệ thống xử lý chúng khác nhau, chúng cần được tách thành các lớp riêng.

Đối với FR-09, việc phân chia được thực hiện theo từng điều kiện C1–C5. Ngoài ra, hai loại mã giảm giá `percent` và `fixed` được phân biệt để bao phủ hai nhánh tính toán theo đặc tả.

### 2.2. Các lớp tương đương cho điều kiện C1 – Mã tồn tại và đang hoạt động

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC01 | Mã giảm giá tồn tại trong cơ sở dữ liệu và đang hoạt động (`is_active = 1`). | Valid |
| EC02 | Mã giảm giá không tồn tại trong cơ sở dữ liệu. | Invalid |
| EC03 | Mã giảm giá tồn tại nhưng không hoạt động (`is_active = 0`). | Invalid |

Giải thích: EC02 và EC03 được tách riêng vì một trường hợp không có bản ghi mã giảm giá, trong khi trường hợp còn lại có bản ghi nhưng mã đã bị vô hiệu hóa.

### 2.3. Các lớp tương đương cho điều kiện C2 – Hạn sử dụng

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC04 | Ngày hiện tại trước `expired_at`. | Valid |
| EC05 | Ngày hiện tại bằng hoặc sau `expired_at`. | Invalid |

Giải thích: Đặc tả yêu cầu ngày hiện tại phải trước ngày hết hạn. Theo cách hiểu trực tiếp của điều kiện này, trường hợp ngày hiện tại bằng ngày hết hạn không đáp ứng yêu cầu.

Cần xác nhận thêm cách ứng dụng xử lý ngày và thời gian thực tế, vì SRS chưa quy định rõ múi giờ hoặc quy ước hết hạn vào cuối ngày.

### 2.4. Các lớp tương đương cho điều kiện C3 – Ngưỡng đơn hàng tối thiểu

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC06 | Tổng tiền đơn hàng lớn hơn hoặc bằng `min_order_amount`. | Valid |
| EC07 | Tổng tiền đơn hàng nhỏ hơn `min_order_amount`. | Invalid |

Giải thích: Theo đặc tả, đơn hàng có tổng tiền đúng bằng ngưỡng tối thiểu vẫn đủ điều kiện áp dụng mã. Chỉ đơn hàng có tổng tiền nhỏ hơn ngưỡng mới thuộc lớp không hợp lệ.

### 2.5. Các lớp tương đương cho điều kiện C4 – JWT Token hợp lệ

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC08 | Người dùng có JWT Token hợp lệ. | Valid |
| EC09 | Người dùng chưa đăng nhập hoặc không gửi JWT Token. | Invalid |
| EC10 | Người dùng gửi JWT Token không hợp lệ hoặc đã hết hạn. | Invalid |

Giải thích: EC09 và EC10 đều không thỏa mãn điều kiện xác thực nhưng được tách riêng để kiểm tra trạng thái không có token so với trạng thái có token nhưng không hợp lệ.

### 2.6. Các lớp tương đương cho điều kiện C5 – Giới hạn lượt sử dụng

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC11 | Số lượt đã sử dụng nhỏ hơn `max_uses_per_user`. | Valid |
| EC12 | Số lượt đã sử dụng bằng hoặc lớn hơn `max_uses_per_user`. | Invalid |

Giải thích: Đặc tả yêu cầu số lượt đã dùng phải nhỏ hơn giới hạn. Vì vậy, khi số lượt bằng giới hạn hoặc vượt giới hạn thì mã không còn đủ điều kiện áp dụng.

Hai trường hợp bằng và vượt giới hạn được giữ trong cùng một lớp Invalid vì cùng vi phạm điều kiện `used_count < max_uses_per_user`. Sự khác biệt giữa hai giá trị sẽ được kiểm tra cụ thể bằng BVA.

### 2.7. Phân lớp theo loại mã và cách tính giảm giá

Ngoài năm điều kiện áp dụng, hai loại mã giảm giá có công thức tính khác nhau nên cần được kiểm tra độc lập.

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC13 | Mã giảm giá có `type = percent`, áp dụng công thức giảm theo phần trăm. | Valid – nhánh tính toán |
| EC14 | Mã giảm giá có `type = fixed`, áp dụng số tiền giảm cố định. | Valid – nhánh tính toán |

EC13 và EC14 chỉ dùng để phân biệt hai nhánh tính toán khi các điều kiện áp dụng mã đều hợp lệ. Đây không phải hai lớp thay thế cho C1–C5; một mã vẫn phải thỏa mãn đủ năm điều kiện trước khi được áp dụng.

SRS của FR-09 không quy định một lớp Invalid riêng cho loại mã không được hỗ trợ. Điều kiện `type` chỉ nhận `percent` hoặc `fixed` được quy định ở FR-17 – Quản lý mã giảm giá. Vì vậy, không tự bổ sung lớp Invalid cho FR-09 nếu chưa có căn cứ khác.

### 2.8. Tập phân hoạch tổng hợp

| Điều kiện/nhóm | Mã lớp | Số lớp | Phân loại |
|---|---|---:|---|
| C1 – Mã tồn tại và hoạt động | EC01–EC03 | 3 | 1 Valid, 2 Invalid |
| C2 – Hạn sử dụng | EC04–EC05 | 2 | 1 Valid, 1 Invalid |
| C3 – Ngưỡng đơn hàng | EC06–EC07 | 2 | 1 Valid, 1 Invalid |
| C4 – Xác thực | EC08–EC10 | 3 | 1 Valid, 2 Invalid |
| C5 – Giới hạn lượt dùng | EC11–EC12 | 2 | 1 Valid, 1 Invalid |
| Loại mã – Nhánh tính toán | EC13–EC14 | 2 | 2 nhánh Valid |

Như vậy, tập phân hoạch ban đầu có 14 lớp, gồm các lớp kiểm tra điều kiện áp dụng mã và hai nhánh tính toán.

Không tạo thêm lớp cho mã rỗng, quy tắc phân biệt chữ hoa/chữ thường hoặc giới hạn giảm giá tối đa vì những nội dung đó chưa được quy định rõ trong FR-09.

---

## Bước 3. Lựa chọn test case đại diện

### 3.1. Nguyên tắc lựa chọn

Dựa trên các lớp tương đương đã xác định ở Bước 2, test case được lựa chọn theo những nguyên tắc sau:

- Kết hợp các lớp Valid trong cùng một test case khi các điều kiện có thể đồng thời được thỏa mãn.
- Với test case Invalid, tập trung kiểm tra một lớp Invalid tại một thời điểm.
- Chuẩn bị dữ liệu sao cho các điều kiện không thuộc phạm vi kiểm tra đều hợp lệ.
- Kiểm tra riêng hai nhánh tính toán `percent` và `fixed`.
- Chỉ ghi nhận kết quả Pass hoặc Fail sau khi thực sự chạy trên EShop.

### 3.2. Bộ test case bao phủ các lớp tương đương

| Mã test case | Dữ liệu/điều kiện chính | Lớp được bao phủ | Kết quả mong đợi |
|---|---|---|---|
| TC09-01 | `SAVE10`, đơn hàng 500.000 ₫, JWT hợp lệ, chưa dùng mã | EC01, EC04, EC06, EC08, EC11, EC13 | Áp dụng thành công, giảm 50.000 ₫, còn 450.000 ₫ |
| TC09-02 | Nhập mã không tồn tại `NO_SUCH_CODE`; JWT hợp lệ, đơn hàng 500.000 ₫ | EC02 | Từ chối áp dụng vì mã không tồn tại |
| TC09-03 | Mã kiểm thử tồn tại nhưng `is_active = 0`; các điều kiện khác hợp lệ | EC03 | Từ chối áp dụng vì mã không hoạt động |
| TC09-04 | Mã `EXPIRED` được thiết lập đang hoạt động, đơn hàng 200.000 ₫, JWT hợp lệ, chưa dùng mã | EC05 | Từ chối áp dụng vì mã hết hạn |
| TC09-05 | `BIGBUY`, đơn hàng 499.999 ₫, JWT hợp lệ, chưa dùng mã | EC07 | Từ chối áp dụng vì chưa đạt ngưỡng tối thiểu |
| TC09-06 | `SAVE10`, đơn hàng 500.000 ₫, không có JWT Token | EC09 | Từ chối áp dụng do người dùng chưa đăng nhập |
| TC09-07 | `SAVE10`, đơn hàng 500.000 ₫, JWT Token không hợp lệ hoặc hết hạn | EC10 | Từ chối áp dụng do xác thực không hợp lệ |
| TC09-08 | `SAVE10`, đơn hàng 500.000 ₫, người dùng đã dùng mã 1 lần, giới hạn 1 lần | EC12 | Từ chối áp dụng vì đã dùng hết lượt |
| TC09-09 | `BIGBUY`, đơn hàng 500.000 ₫, JWT hợp lệ, chưa dùng mã | EC01, EC04, EC06, EC08, EC11, EC14 | Áp dụng thành công, giảm 50.000 ₫, còn 450.000 ₫ |

**Điều kiện dữ liệu cần chuẩn bị:**

- `SAVE10`: mã phần trăm 10%, ngưỡng 300.000 ₫, ngày hết hạn 2099-12-31, giới hạn 1 lần/người.
- `BIGBUY`: giảm cố định 50.000 ₫, ngưỡng 500.000 ₫, ngày hết hạn 2099-12-31, giới hạn 1 lần/người.
- `EXPIRED`: giảm 20%, ngưỡng 100.000 ₫, ngày hết hạn 2020-01-01, giới hạn 1 lần/người.
- Mã kiểm thử không hoạt động phải được chuẩn bị sẵn trong môi trường test, với `is_active = 0`.
- Đối với TC09-04, phải xác nhận mã `EXPIRED` đang hoạt động để việc từ chối được quy về điều kiện hết hạn. SRS không cho biết trạng thái `is_active` của mã mẫu này.

### 3.3. Chi tiết một số test case quan trọng

#### TC09-01 – Áp dụng thành công mã phần trăm

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập bằng JWT hợp lệ.
- Mã `SAVE10` đang hoạt động và chưa hết hạn.
- Người dùng chưa sử dụng mã.
- Tổng tiền đơn hàng là 500.000 ₫.

**Dữ liệu kiểm thử:**

- Mã giảm giá: `SAVE10`.
- Tổng tiền đơn hàng: 500.000 ₫.
- Tỷ lệ giảm: 10%.

**Kết quả mong đợi:**

- Mã được chấp nhận.
- Số tiền giảm: `500.000 × 10 / 100 = 50.000 ₫`.
- Số tiền cuối cùng: `500.000 - 50.000 = 450.000 ₫`.

#### TC09-04 – Từ chối mã hết hạn

**Điều kiện tiên quyết:**

- Người dùng có JWT hợp lệ.
- Mã tồn tại và đang hoạt động.
- Tổng tiền đơn hàng đạt ngưỡng tối thiểu.
- Người dùng chưa sử dụng hết lượt.
- Ngày hết hạn của mã là 2020-01-01.

**Kết quả mong đợi:** Hệ thống từ chối áp dụng mã vì ngày hiện tại không còn trước ngày hết hạn.

#### TC09-05 – Đơn hàng thấp hơn ngưỡng tối thiểu

**Điều kiện tiên quyết:**

- Mã `BIGBUY` đang hoạt động và còn hạn.
- Người dùng có JWT hợp lệ và chưa sử dụng mã.
- Ngưỡng tối thiểu của mã là 500.000 ₫.

**Dữ liệu kiểm thử:** Tổng tiền đơn hàng là 499.999 ₫.

**Kết quả mong đợi:** Hệ thống từ chối áp dụng mã vì 499.999 ₫ nhỏ hơn 500.000 ₫.

#### TC09-09 – Áp dụng thành công mã giảm cố định

**Điều kiện tiên quyết:**

- Mã `BIGBUY` đang hoạt động và còn hạn.
- Người dùng có JWT hợp lệ và chưa sử dụng mã.
- Tổng tiền đơn hàng là 500.000 ₫, đáp ứng ngưỡng tối thiểu.

**Kết quả mong đợi:**

- Mã được chấp nhận.
- Số tiền giảm cố định: 50.000 ₫.
- Số tiền cuối cùng: 450.000 ₫.

### 3.4. Đánh giá độ bao phủ

Đối chiếu bộ test case với tập phân hoạch:

- EC01, EC04, EC06, EC08 và EC11 được bao phủ bởi TC09-01 và TC09-09.
- EC02, EC03, EC05 và EC07 được kiểm tra lần lượt bằng TC09-02 đến TC09-05.
- EC09 và EC10 được kiểm tra riêng ở TC09-06 và TC09-07.
- EC12 được kiểm tra ở TC09-08.
- EC13 được bao phủ bởi TC09-01; EC14 được bao phủ bởi TC09-09.

Như vậy, tất cả 14 lớp tương đương đã có test case đại diện trong bộ thiết kế ban đầu.

Các test case trên chưa được thực thi nên trạng thái ban đầu là Not Run. Kết quả thực tế, bằng chứng và bug ID cần được cập nhật sau khi chạy hệ thống.


