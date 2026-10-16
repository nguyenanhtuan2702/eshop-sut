# FR-17: Quản lý mã giảm giá (Coupon CRUD)

## Bước 1. Xác định biến đầu vào và đầu ra

### 1.1. Mô tả chức năng

FR-17 – Quản lý mã giảm giá là chức năng thuộc phân hệ Web Admin của hệ thống EShop. Theo đặc tả, Admin có thể thêm, xem và xóa mã giảm giá.

Khi thêm mã giảm giá, hệ thống phải kiểm tra các trường bắt buộc và những ràng buộc được quy định trong đặc tả. Mỗi mã phải có giá trị `code` duy nhất, loại mã hợp lệ, giá trị giảm dương, ngày hết hạn, ngưỡng đơn hàng tối thiểu không âm và giới hạn số lần sử dụng tối thiểu bằng 1.

Mục tiêu của bước này là xác định các biến đầu vào, biến đầu ra và điều kiện nghiệp vụ của FR-17, làm cơ sở xây dựng các lớp tương đương ở bước tiếp theo.

### 1.2. Xác định các biến đầu vào

| Mã | Biến đầu vào | Mô tả | Căn cứ từ đặc tả |
|---|---|---|---|
| I1 | Mã giảm giá (`code`) | Mã định danh của chương trình giảm giá, phải duy nhất. | `code` (duy nhất) |
| I2 | Loại mã (`type`) | Xác định cách giảm giá, gồm `percent` hoặc `fixed`. | `type` (percent/fixed) |
| I3 | Giá trị giảm (`discount_value`) | Giá trị dùng để tính khoản giảm giá, phải là số dương. | `discount_value` (dương) |
| I4 | Ngày hết hạn (`expired_at`) | Ngày hết hạn của mã giảm giá, là trường bắt buộc. | `expired_at` |
| I5 | Ngưỡng đơn hàng (`min_order_amount`) | Tổng tiền tối thiểu để mã giảm giá được áp dụng, không được âm. | `min_order_amount >= 0` |
| I6 | Giới hạn lượt dùng (`max_uses_per_user`) | Số lần tối đa một người dùng có thể sử dụng mã, phải từ 1 trở lên. | `max_uses_per_user >= 1` |
| I7 | Thao tác quản lý | Thao tác thêm, xem hoặc xóa mã giảm giá. | Admin có thể Thêm/Xem/Xóa |
| I8 | Mã định danh bản ghi | Dùng để xác định mã giảm giá cần xem hoặc xóa theo cách triển khai của hệ thống. | Liên quan đến thao tác xem/xóa; cần đối chiếu API và giao diện |

**Lưu ý:** I1–I6 là các trường dữ liệu của mã giảm giá. I7 và I8 mô tả thao tác quản lý và thông tin cần để xác định bản ghi tương ứng; chúng không phải các trường bắt buộc được liệt kê trong biểu mẫu tạo mã.

### 1.3. Xác định các điều kiện nghiệp vụ

Theo mục FR-17 của SRS, các trường và điều kiện được quy định như sau:

| Mã điều kiện | Điều kiện nghiệp vụ | Cách hiểu theo đặc tả |
|---|---|---|
| C1 | Mã giảm giá phải duy nhất | Không được tạo một mã có `code` trùng với mã đã tồn tại. |
| C2 | Loại mã phải hợp lệ | `type` chỉ nhận `percent` hoặc `fixed`. |
| C3 | Giá trị giảm phải dương | `discount_value > 0`. |
| C4 | Phải cung cấp ngày hết hạn | Trường `expired_at` là bắt buộc. |
| C5 | Ngưỡng đơn hàng không âm | `min_order_amount >= 0`. |
| C6 | Giới hạn lượt sử dụng tối thiểu bằng 1 | `max_uses_per_user >= 1`. |
| C7 | Admin có thể thêm, xem và xóa mã giảm giá | Hệ thống phải hỗ trợ ba thao tác quản lý được quy định. |

Bên cạnh đó, theo yêu cầu kiểm soát truy cập FR-12, các API quản trị phải yêu cầu JWT hợp lệ và quyền Admin. Đây là điều kiện về quyền truy cập có liên quan đến việc kiểm thử FR-17, nhưng thuộc yêu cầu FR-12 chứ không phải một ràng buộc dữ liệu mới của FR-17.

### 1.4. Xác định các biến đầu ra

| Mã | Biến đầu ra | Mô tả |
|---|---|---|
| O1 | Kết quả tạo mã | Cho biết mã mới được tạo thành công hay bị từ chối. |
| O2 | Thông tin mã giảm giá | Các trường của mã giảm giá được hiển thị khi xem danh sách hoặc chi tiết bản ghi theo khả năng của giao diện. |
| O3 | Kết quả xóa mã | Cho biết thao tác xóa được thực hiện thành công hay thất bại. |
| O4 | Trạng thái danh sách mã | Danh sách phản ánh việc thêm mới hoặc xóa mã sau thao tác tương ứng. |
| O5 | Phản hồi kiểm tra dữ liệu | Phản hồi của hệ thống khi dữ liệu không đáp ứng điều kiện nghiệp vụ. |

Đặc tả FR-17 không quy định chính xác nội dung thông báo thành công hoặc lỗi, mã HTTP cho từng lỗi đầu vào hay cách hiển thị xác nhận xóa. Vì vậy, các nội dung này cần được xác minh khi thực thi trên ứng dụng.

### 1.5. Những thông tin chưa được quy định rõ

Không tự bổ sung các điều kiện sau thành yêu cầu bắt buộc khi chưa có căn cứ từ SRS:

1. Độ dài tối thiểu hoặc tối đa của `code`.
2. Mã có phân biệt chữ hoa và chữ thường hay tự loại bỏ khoảng trắng không.
3. `discount_value` có giới hạn tối đa hay không; đặc biệt, đặc tả không quy định tỷ lệ phần trăm tối đa là 100%.
4. Kiểu dữ liệu chính xác và độ chính xác thập phân được chấp nhận cho `discount_value` và `min_order_amount`.
5. `expired_at` có bắt buộc phải nằm trong tương lai khi tạo mã hay không.
6. Định dạng ngày, múi giờ và cách xử lý ngày không hợp lệ của `expired_at`.
7. `max_uses_per_user` có quy định rõ kiểu số nguyên ở mức đặc tả hay không.
8. Hệ thống hiển thị thông báo nào cho từng lỗi dữ liệu.
9. Quy tắc xử lý khi xóa mã đã được sử dụng trong đơn hàng.
10. Có hỗ trợ sửa mã giảm giá hay không. Phạm vi FR-17 trong SRS hiện chỉ nêu thêm, xem và xóa.

Các nội dung chưa được quy định sẽ được ghi nhận trong quá trình đối chiếu mã nguồn hoặc thực thi kiểm thử, không mặc định là lỗi nếu không có căn cứ xác định yêu cầu.


---

## Bước 2. Xác định các lớp tương đương

### 2.1. Nguyên tắc phân chia lớp tương đương

Theo phương pháp Domain Testing, miền dữ liệu của từng điều kiện đầu vào được phân thành các lớp tương đương hợp lệ (Valid Equivalence Classes) và không hợp lệ (Invalid Equivalence Classes).

Mỗi lớp đại diện cho một nhóm giá trị được kỳ vọng có cách xử lý tương tự. Nếu hai trường hợp có thể được hệ thống xử lý khác nhau, chúng được tách thành các lớp riêng.

Đối với FR-17, quá trình phân hoạch được thực hiện lần lượt cho sáu trường dữ liệu được quy định trong đặc tả. Các thao tác thêm, xem và xóa sẽ được kiểm tra ở Bước 3.

### 2.2. Điều kiện C1 – Mã giảm giá phải duy nhất

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC01 | `code` được cung cấp và chưa tồn tại trong hệ thống. | Valid |
| EC02 | `code` bị bỏ trống hoặc không được cung cấp. | Invalid |
| EC03 | `code` đã tồn tại trong hệ thống. | Invalid |

Giải thích: EC02 và EC03 được tách riêng vì một trường hợp thiếu dữ liệu, còn trường hợp kia vi phạm tính duy nhất. Cả hai đều không đáp ứng yêu cầu tạo mã mới.

### 2.3. Điều kiện C2 – Loại mã phải là `percent` hoặc `fixed`

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC04 | `type = percent`. | Valid |
| EC05 | `type = fixed`. | Valid |
| EC06 | `type` bị bỏ trống hoặc không được cung cấp. | Invalid |
| EC07 | `type` có giá trị khác `percent` và `fixed`. | Invalid |

Giải thích: Hai loại mã hợp lệ được tách riêng để kiểm tra cả hai nhánh dữ liệu. Trường hợp bỏ trống và trường hợp chứa giá trị không được hỗ trợ được tách ra để dễ xác định nguyên nhân từ chối.

### 2.4. Điều kiện C3 – Giá trị giảm phải dương

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC08 | `discount_value > 0`. | Valid |
| EC09 | `discount_value = 0`. | Invalid |
| EC10 | `discount_value < 0`. | Invalid |

Giải thích: Đặc tả yêu cầu giá trị giảm phải lớn hơn 0. Vì vậy, giá trị bằng 0 và giá trị âm không thỏa mãn điều kiện.

Việc tách EC09 và EC10 giúp kiểm tra riêng trường hợp bằng giới hạn và trường hợp vượt qua giới hạn theo hướng không hợp lệ.

### 2.5. Điều kiện C4 – Ngày hết hạn là trường bắt buộc

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC11 | Trường `expired_at` được cung cấp. | Valid về tính bắt buộc |
| EC12 | Trường `expired_at` bị bỏ trống hoặc không được cung cấp. | Invalid |

Giải thích: Đặc tả FR-17 quy định trường ngày hết hạn là bắt buộc, nhưng không quy định rõ ngày này phải nằm trong tương lai. Vì vậy, không xếp ngày trong quá khứ vào lớp Invalid chỉ dựa trên FR-17.

Định dạng ngày và cách xử lý giá trị ngày không hợp lệ cần được xác minh thêm bằng API specification và hành vi thực tế của hệ thống.

### 2.6. Điều kiện C5 – Ngưỡng đơn hàng tối thiểu không âm

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC13 | `min_order_amount >= 0`. | Valid |
| EC14 | `min_order_amount < 0`. | Invalid |

Giải thích: Giá trị bằng 0 và giá trị dương đều đáp ứng điều kiện không âm. Hai nhóm này được giữ trong cùng một lớp Valid theo đặc tả; giá trị 0 sẽ được kiểm tra riêng ở BVA vì đây là biên dưới của miền hợp lệ.

### 2.7. Điều kiện C6 – Giới hạn lượt sử dụng tối thiểu bằng 1

| Mã EC | Mô tả lớp tương đương | Loại |
|---|---|---|
| EC15 | `max_uses_per_user >= 1`. | Valid |
| EC16 | `max_uses_per_user < 1`. | Invalid |

Giải thích: Theo đặc tả, giới hạn lượt sử dụng phải từ 1 trở lên. Do đó, giá trị nhỏ hơn 1 không đáp ứng yêu cầu. Giá trị 0 và giá trị âm được giữ trong cùng một lớp Invalid vì cùng vi phạm điều kiện này; chúng sẽ được lựa chọn giá trị cụ thể khi thiết kế test case và BVA.

### 2.8. Tập phân hoạch tổng hợp

| Điều kiện | Mã EC | Số lớp | Phân loại |
|---|---|---:|---|
| C1 – Tính duy nhất của mã | EC01–EC03 | 3 | 1 Valid, 2 Invalid |
| C2 – Loại mã | EC04–EC07 | 4 | 2 Valid, 2 Invalid |
| C3 – Giá trị giảm | EC08–EC10 | 3 | 1 Valid, 2 Invalid |
| C4 – Ngày hết hạn bắt buộc | EC11–EC12 | 2 | 1 Valid, 1 Invalid |
| C5 – Ngưỡng đơn hàng | EC13–EC14 | 2 | 1 Valid, 1 Invalid |
| C6 – Giới hạn lượt dùng | EC15–EC16 | 2 | 1 Valid, 1 Invalid |

Tổng cộng, tập phân hoạch ban đầu gồm 16 lớp tương đương, trong đó có 7 lớp Valid và 9 lớp Invalid.

Lưu ý rằng EC11 chỉ thể hiện trường `expired_at` được cung cấp. Nó không khẳng định ngày đó hợp lệ về mọi mặt hoặc nằm trong tương lai, vì những yêu cầu đó chưa được quy định rõ ở FR-17.


---

## Bước 3. Lựa chọn test case đại diện

### 3.1. Nguyên tắc lựa chọn

Dựa trên các lớp tương đương đã xác định, test case được xây dựng theo các nguyên tắc:

- Kết hợp nhiều lớp Valid trong cùng một test case khi các điều kiện có thể đồng thời được thỏa mãn.
- Mỗi test case Invalid chỉ vi phạm một điều kiện đầu vào tại một thời điểm.
- Tất cả các điều kiện không thuộc phạm vi kiểm tra phải được chuẩn bị hợp lệ.
- Kiểm tra riêng hai giá trị hợp lệ của `type` là `percent` và `fixed`.
- Bổ sung test case cho thao tác xem và xóa vì đây là một phần của phạm vi chức năng FR-17.

### 3.2. Bộ test case bao phủ các lớp tương đương

| Mã TC | Dữ liệu hoặc thao tác | Lớp được bao phủ | Kết quả mong đợi |
|---|---|---|---|
| TC17-01 | Tạo mã mới, `type = percent`, giá trị giảm 10 | EC01, EC04, EC08, EC11, EC13, EC15 | Tạo mã thành công |
| TC17-02 | Tạo mã mới, `type = fixed`, giá trị giảm 50.000 | EC01, EC05, EC08, EC11, EC13, EC15 | Tạo mã thành công |
| TC17-03 | Bỏ trống `code`, các trường còn lại hợp lệ | EC02 | Từ chối tạo mã |
| TC17-04 | Sử dụng `code` đã tồn tại, các trường còn lại hợp lệ | EC03 | Từ chối tạo mã trùng |
| TC17-05 | Bỏ trống `type` | EC06 | Từ chối tạo mã |
| TC17-06 | `type = other`, các trường còn lại hợp lệ | EC07 | Từ chối loại mã không được hỗ trợ |
| TC17-07 | `discount_value = 0` | EC09 | Từ chối tạo mã |
| TC17-08 | `discount_value = -1` | EC10 | Từ chối tạo mã |
| TC17-09 | Bỏ trống `expired_at` | EC12 | Từ chối tạo mã |
| TC17-10 | `min_order_amount = -1` | EC14 | Từ chối tạo mã |
| TC17-11 | `max_uses_per_user = 0` | EC16 | Từ chối tạo mã |
| TC17-12 | Mở danh sách mã giảm giá | Thao tác xem | Danh sách mã giảm giá được hiển thị |
| TC17-13 | Xóa một mã kiểm thử đã tồn tại | Thao tác xóa | Mã được xóa khỏi hệ thống và không còn trong danh sách |

### 3.3. Dữ liệu mẫu cho các test case hợp lệ

#### TC17-01 – Tạo mã giảm giá loại phần trăm

| Trường | Giá trị |
|---|---|
| `code` | `TEST_PERCENT_01` |
| `type` | `percent` |
| `discount_value` | 10 |
| `expired_at` | `2099-12-31` |
| `min_order_amount` | 0 |
| `max_uses_per_user` | 1 |

**Kết quả mong đợi:** Hệ thống tạo mã giảm giá thành công và mã xuất hiện trong danh sách quản lý.

Ngày `2099-12-31` được chọn làm dữ liệu mẫu để tránh ngày hết hạn trong quá khứ gây nhiễu cho quá trình kiểm thử. Đây là lựa chọn dữ liệu kiểm thử, không phải khẳng định SRS bắt buộc ngày hết hạn phải nằm trong tương lai.

#### TC17-02 – Tạo mã giảm giá loại số tiền cố định

| Trường | Giá trị |
|---|---|
| `code` | `TEST_FIXED_01` |
| `type` | `fixed` |
| `discount_value` | 50000 |
| `expired_at` | `2099-12-31` |
| `min_order_amount` | 0 |
| `max_uses_per_user` | 1 |

**Kết quả mong đợi:** Hệ thống tạo mã giảm giá thành công và mã được hiển thị trong danh sách.

### 3.4. Chi tiết các test case Invalid

Với mỗi test case dưới đây, tất cả trường không được đề cập phải giữ giá trị hợp lệ.

**TC17-03 – Bỏ trống mã giảm giá**

- Điều kiện: `code` không được cung cấp.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối tạo mã vì thiếu mã giảm giá.

**TC17-04 – Mã giảm giá bị trùng**

- Điều kiện tiên quyết: `TEST_PERCENT_01` đã tồn tại trong hệ thống.
- Dữ liệu: tạo mã mới với `code = TEST_PERCENT_01`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối tạo mã vì vi phạm tính duy nhất của `code`.

**TC17-05 – Bỏ trống loại mã**

- Điều kiện: Không cung cấp `type`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối tạo mã do thiếu trường loại mã.

**TC17-06 – Loại mã không được hỗ trợ**

- Điều kiện: `type = other`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối tạo mã vì `type` không thuộc hai giá trị được cho phép là `percent` và `fixed`.

**TC17-07 – Giá trị giảm bằng 0**

- Điều kiện: `discount_value = 0`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối vì giá trị giảm phải dương.

**TC17-08 – Giá trị giảm âm**

- Điều kiện: `discount_value = -1`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối vì giá trị giảm không dương.

**TC17-09 – Bỏ trống ngày hết hạn**

- Điều kiện: Không cung cấp `expired_at`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối vì thiếu trường ngày hết hạn.

**TC17-10 – Ngưỡng đơn hàng âm**

- Điều kiện: `min_order_amount = -1`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối vì ngưỡng đơn hàng phải lớn hơn hoặc bằng 0.

**TC17-11 – Giới hạn lượt sử dụng bằng 0**

- Điều kiện: `max_uses_per_user = 0`.
- Các trường còn lại: hợp lệ.
- Kết quả mong đợi: Hệ thống từ chối vì giới hạn lượt sử dụng phải từ 1 trở lên.

### 3.5. Kiểm tra thao tác xem và xóa

#### TC17-12 – Xem danh sách mã giảm giá

**Điều kiện tiên quyết:** Người kiểm thử đã đăng nhập bằng tài khoản Admin hợp lệ.

**Các bước:**
1. Mở phân hệ quản lý mã giảm giá.
2. Truy cập danh sách mã giảm giá.
3. Kiểm tra sự xuất hiện của `TEST_PERCENT_01` và `TEST_FIXED_01` sau khi tạo thành công.

**Kết quả mong đợi:** Danh sách hiển thị các mã đã tạo và thông tin tương ứng theo giao diện thực tế.

#### TC17-13 – Xóa mã giảm giá

**Điều kiện tiên quyết:** Mã `TEST_FIXED_01` tồn tại và người kiểm thử đăng nhập bằng tài khoản Admin hợp lệ.

**Các bước:**
1. Mở danh sách mã giảm giá.
2. Chọn bản ghi `TEST_FIXED_01`.
3. Thực hiện thao tác xóa.
4. Kiểm tra lại danh sách sau thao tác.

**Kết quả mong đợi:** Mã giảm giá được xóa thành công và không còn xuất hiện trong danh sách.

Đặc tả FR-17 chưa quy định cụ thể việc xác nhận xóa, xử lý mã đã được sử dụng hay nội dung thông báo xóa. Các chi tiết này được ghi nhận theo hành vi thực tế khi thực thi, không tự xem là yêu cầu bắt buộc.

### 3.6. Đánh giá độ bao phủ các lớp tương đương

Đối chiếu bộ test case với các lớp EC đã xác định:

- TC17-01 và TC17-02 bao phủ EC01, EC04, EC05, EC08, EC11, EC13 và EC15.
- TC17-03 bao phủ EC02.
- TC17-04 bao phủ EC03.
- TC17-05 và TC17-06 bao phủ EC06 và EC07.
- TC17-07 và TC17-08 bao phủ EC09 và EC10.
- TC17-09 bao phủ EC12.
- TC17-10 bao phủ EC14.
- TC17-11 bao phủ EC16.
- TC17-12 và TC17-13 kiểm tra hai thao tác xem và xóa mã giảm giá.

Như vậy, tất cả 16 lớp tương đương đã có test case đại diện, đồng thời ba thao tác quản lý được quy định trong FR-17 đều có trường hợp kiểm tra tương ứng.

Đây là độ bao phủ theo thiết kế. Chỉ có thể xác nhận hệ thống thực tế đạt hay không đạt yêu cầu sau khi chạy test case, thu thập kết quả và đối chiếu với kết quả mong đợi.
