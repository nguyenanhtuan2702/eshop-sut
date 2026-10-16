# FR-01: Đăng ký tài khoản

## Bước 1. Xác định các giá trị biên

### 1.1. Mục tiêu

Boundary Value Analysis (BVA) là kỹ thuật kiểm thử tập trung vào các giá trị nằm tại hoặc gần ranh giới của miền dữ liệu. Kỹ thuật này giúp phát hiện những lỗi có thể xảy ra khi hệ thống xác định sai giới hạn cho phép.

Dựa trên các điều kiện đầu vào của chức năng FR-01 – Đăng ký tài khoản, cần xem xét những điều kiện có giới hạn được quy định trong đặc tả.

### 1.2. Xác định điều kiện có giá trị biên

Trong các điều kiện đã phân tích ở phần Domain Testing, độ dài mật khẩu có quy định tối thiểu là 8 ký tự. Do đó, đây là điều kiện có thể áp dụng BVA trực tiếp.

| Mã điều kiện | Điều kiện | Giá trị biên |
|---|---|---|
| C4 | Mật khẩu phải có ít nhất 8 ký tự | Độ dài tối thiểu: 8 ký tự |

Các trường hợp kiểm thử được lựa chọn xung quanh biên dưới của độ dài mật khẩu gồm:
- Giá trị ngay dưới biên: 7 ký tự.
- Giá trị tại biên: 8 ký tự.
- Giá trị ngay trên biên: 9 ký tự.

Đối với các điều kiện như email đúng định dạng, email chưa tồn tại và mật khẩu xác nhận trùng khớp, đặc tả hiện tại không xác định một giới hạn số học cụ thể để áp dụng BVA theo cách tương tự. Những điều kiện này đã được kiểm tra bằng các lớp tương đương trong phần Domain Testing.

## Bước 2. Thiết kế test case theo giá trị biên

### 2.1. Nguyên tắc thiết kế

Để kiểm tra riêng ảnh hưởng của độ dài mật khẩu, các dữ liệu dùng trong test case phải đáp ứng những điều kiện còn lại:
- Họ và tên được nhập đầy đủ.
- Email có định dạng hợp lệ và chưa tồn tại trong hệ thống.
- Mật khẩu có chữ hoa, chữ thường, chữ số và ký tự đặc biệt được chấp nhận.
- Trường xác nhận mật khẩu trùng khớp với mật khẩu ban đầu.

Chỉ thay đổi độ dài mật khẩu giữa các test case để xác định hệ thống có xử lý đúng giới hạn tối thiểu hay không.

### 2.2. Bảng test case BVA

| Mã test case | Độ dài mật khẩu | Giá trị đại diện | Kết quả mong đợi |
|---|---:|---|---|
| BVA-FR01-01 | 7 ký tự | `Abcde1!` | Từ chối đăng ký vì mật khẩu chưa đạt độ dài tối thiểu |
| BVA-FR01-02 | 8 ký tự | `Abcdef1!` | Chấp nhận mật khẩu về điều kiện độ dài |
| BVA-FR01-03 | 9 ký tự | `Abcdefg1!` | Chấp nhận mật khẩu về điều kiện độ dài |

**Lưu ý:** Kết quả ở bảng là kết quả mong đợi theo yêu cầu độ dài mật khẩu, không phải kết quả thực thi thực tế. Test case có độ dài 8 hoặc 9 ký tự chỉ được xem là hợp lệ hoàn chỉnh khi các điều kiện khác cũng được đáp ứng.

### 2.3. Các bước thực hiện kiểm thử

Đối với từng test case, thực hiện theo trình tự:

1. Mở trang đăng ký tài khoản của EShop.
2. Nhập họ và tên hợp lệ.
3. Nhập một email hợp lệ chưa được sử dụng.
4. Nhập mật khẩu theo giá trị được quy định trong test case.
5. Nhập lại đúng mật khẩu tại trường xác nhận mật khẩu.
6. Gửi yêu cầu đăng ký.
7. Ghi nhận phản hồi của hệ thống và đối chiếu với kết quả mong đợi.
8. Lưu ảnh chụp màn hình hoặc bằng chứng cần thiết.

Do các test case có kết quả đăng ký thành công có thể tạo tài khoản mới, cần sử dụng email riêng biệt chưa tồn tại cho mỗi lần thực thi để tránh ảnh hưởng giữa các lần chạy.

## Bước 3. Đánh giá kết quả kiểm thử

Sau khi thực thi, bổ sung kết quả thực tế vào bảng sau:

| Mã test case | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|
| BVA-FR01-01 | Từ chối mật khẩu 7 ký tự | Chưa thực thi | Not Run | Chưa có |
| BVA-FR01-02 | Chấp nhận mật khẩu về điều kiện độ dài | Chưa thực thi | Not Run | Chưa có |
| BVA-FR01-03 | Chấp nhận mật khẩu về điều kiện độ dài | Chưa thực thi | Not Run | Chưa có |

Trạng thái ban đầu là Not Run. Chỉ chuyển thành Pass hoặc Fail sau khi thực thi và đối chiếu kết quả thực tế với kết quả mong đợi.

Nếu hệ thống chấp nhận mật khẩu 7 ký tự hoặc từ chối mật khẩu 8 ký tự trong khi các điều kiện khác đều hợp lệ, cần kiểm tra lại hành vi thực tế và ghi nhận bug nếu có đủ bằng chứng xác nhận sự sai lệch so với yêu cầu.

## Kết luận

BVA cho chức năng FR-01 tập trung vào biên dưới của độ dài mật khẩu là 8 ký tự. Ba giá trị 7, 8 và 9 ký tự được lựa chọn để kiểm tra lần lượt trường hợp ngay dưới biên, tại biên và ngay trên biên.

Các test case này bổ sung cho bộ test case Domain Testing, giúp kiểm tra cụ thể tính đúng đắn của giới hạn độ dài mật khẩu thay vì chỉ kiểm tra một giá trị đại diện bất kỳ trong mỗi lớp tương đương.
