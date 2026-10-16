# FR-01: Đăng ký tài khoản

## Bước 1. Xác định biến đầu vào và đầu ra

### 1.1. Mô tả chức năng

FR-01 – Đăng ký tài khoản là chức năng cho phép người dùng tạo tài khoản mới trên hệ thống EShop. Người dùng cần cung cấp các thông tin đăng ký theo yêu cầu của hệ thống. Trước khi tạo tài khoản, hệ thống phải kiểm tra tính hợp lệ của dữ liệu đầu vào.

Mục tiêu của bước này là xác định các biến đầu vào, biến đầu ra và những điều kiện cần được kiểm tra. Đây là cơ sở để thực hiện bước tiếp theo là phân chia các lớp tương đương.

### 1.2. Xác định các biến đầu vào

| Mã | Biến đầu vào | Mô tả |
|---|---|---|
| I1 | Họ và tên | Họ tên do người dùng nhập khi đăng ký tài khoản. |
| I2 | Email | Địa chỉ email được sử dụng để đăng ký tài khoản. |
| I3 | Mật khẩu | Mật khẩu do người dùng thiết lập cho tài khoản mới. |
| I4 | Xác nhận mật khẩu | Mật khẩu được nhập lại nhằm kiểm tra tính khớp với mật khẩu ban đầu. |

### 1.3. Xác định các điều kiện đầu vào

Dựa trên các yêu cầu của chức năng đăng ký tài khoản, các điều kiện cần kiểm tra bao gồm:

| Mã | Biến liên quan | Điều kiện đầu vào |
|---|---|---|
| C1 | Họ và tên | Người dùng phải nhập họ và tên. |
| C2 | Email | Email phải đúng định dạng. |
| C3 | Email | Email chưa được sử dụng để đăng ký tài khoản khác. |
| C4 | Mật khẩu | Mật khẩu phải có ít nhất 8 ký tự. |
| C5 | Mật khẩu | Mật khẩu phải có ít nhất một chữ cái viết hoa. |
| C6 | Mật khẩu | Mật khẩu phải có ít nhất một chữ cái viết thường. |
| C7 | Mật khẩu | Mật khẩu phải có ít nhất một chữ số. |
| C8 | Mật khẩu | Mật khẩu phải có ít nhất một ký tự đặc biệt được hệ thống chấp nhận. |
| C9 | Xác nhận mật khẩu | Mật khẩu xác nhận phải trùng khớp với mật khẩu ban đầu. |

*Lưu ý: Các điều kiện cụ thể cần được đối chiếu với đặc tả FR-01 trong SRS và cách triển khai thực tế của EShop trước khi chốt báo cáo.*

### 1.4. Xác định các biến đầu ra

| Mã | Biến đầu ra | Mô tả |
|---|---|---|
| O1 | Kết quả đăng ký | Cho biết thao tác đăng ký thành công hay thất bại. |
| O2 | Thông báo kiểm tra dữ liệu | Hiển thị thông báo tương ứng khi dữ liệu đầu vào không hợp lệ. |
| O3 | Kết quả chuyển trang | Khi đăng ký thành công, hệ thống chuyển người dùng đến trang đăng nhập theo yêu cầu của chức năng. |

### 1.5. Hành vi mong đợi của hệ thống

**Trường hợp dữ liệu hợp lệ:**

Người dùng cung cấp đầy đủ thông tin và đáp ứng các điều kiện đăng ký. Hệ thống tạo tài khoản thành công và chuyển người dùng đến trang đăng nhập.

**Trường hợp dữ liệu không hợp lệ:**

Hệ thống từ chối yêu cầu đăng ký và thông báo lỗi phù hợp với điều kiện chưa được đáp ứng. Tài khoản không được tạo thành công.


## Bước 2. Xác định các lớp tương đương

### 2.1. Nguyên tắc phân chia lớp tương đương

Dựa trên các biến đầu vào và điều kiện đã xác định ở Bước 1, miền dữ liệu của chức năng đăng ký tài khoản được chia thành các lớp tương đương hợp lệ (Valid Equivalence Classes) và không hợp lệ (Invalid Equivalence Classes).

Các lớp tương đương được xác định dựa trên điều kiện đầu vào của từng trường. Những giá trị thuộc cùng một lớp được kỳ vọng có cách xử lý giống nhau từ hệ thống. Do đó, có thể chọn một giá trị đại diện cho mỗi lớp để kiểm thử thay vì kiểm tra tất cả các giá trị có thể có.

Đối với chức năng FR-01, các điều kiện cần phân tích gồm: họ và tên, email, độ dài mật khẩu, thành phần của mật khẩu và xác nhận mật khẩu.

### 2.2. Xác định các lớp tương đương cho từng điều kiện

#### Điều kiện 1: Họ và tên phải được cung cấp

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC01 | Họ và tên có giá trị | Valid |
| EC02 | Họ và tên bị bỏ trống | Invalid |

Giải thích: Hệ thống yêu cầu người dùng cung cấp họ và tên. Vì vậy, dữ liệu có giá trị thuộc lớp hợp lệ; trường bị bỏ trống thuộc lớp không hợp lệ.

#### Điều kiện 2: Email phải có định dạng hợp lệ và chưa được sử dụng

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC03 | Email đúng định dạng và chưa tồn tại trong hệ thống | Valid |
| EC04 | Email bị bỏ trống | Invalid |
| EC05 | Email không đúng định dạng | Invalid |
| EC06 | Email đúng định dạng nhưng đã tồn tại trong hệ thống | Invalid |

Giải thích: Email phải đồng thời đáp ứng hai điều kiện là đúng định dạng và có tính duy nhất. Email bỏ trống, email sai định dạng và email đã tồn tại được tách riêng để có thể kiểm tra từng nguyên nhân khiến việc đăng ký không hợp lệ.

#### Điều kiện 3: Mật khẩu phải có ít nhất 8 ký tự

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC07 | Mật khẩu có độ dài từ 8 ký tự trở lên | Valid |
| EC08 | Mật khẩu có độ dài dưới 8 ký tự | Invalid |

Giải thích: Điều kiện này xác định hai miền dữ liệu dựa trên giới hạn độ dài tối thiểu là 8 ký tự.

#### Điều kiện 4: Mật khẩu phải chứa ít nhất một chữ cái viết hoa

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC09 | Mật khẩu có ít nhất một chữ cái viết hoa | Valid |
| EC10 | Mật khẩu không có chữ cái viết hoa | Invalid |

#### Điều kiện 5: Mật khẩu phải chứa ít nhất một chữ cái viết thường

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC11 | Mật khẩu có ít nhất một chữ cái viết thường | Valid |
| EC12 | Mật khẩu không có chữ cái viết thường | Invalid |

#### Điều kiện 6: Mật khẩu phải chứa ít nhất một chữ số

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC13 | Mật khẩu có ít nhất một chữ số | Valid |
| EC14 | Mật khẩu không có chữ số | Invalid |

#### Điều kiện 7: Mật khẩu phải chứa ít nhất một ký tự đặc biệt được chấp nhận

Các ký tự đặc biệt được quy định trong đặc tả gồm: `@`, `$`, `!`, `%`, `*`, `?`, `&`.

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC15 | Mật khẩu có ít nhất một ký tự đặc biệt được chấp nhận | Valid |
| EC16 | Mật khẩu không có ký tự đặc biệt nào thuộc danh sách được chấp nhận | Invalid |

Giải thích: Việc phân chia dựa trên tập ký tự đặc biệt được quy định trong đặc tả, không mặc định mọi ký tự đặc biệt đều được hệ thống chấp nhận.

#### Điều kiện 8: Xác nhận mật khẩu phải khớp với mật khẩu ban đầu

| Mã EC | Lớp tương đương | Loại |
|---|---|---|
| EC17 | Mật khẩu xác nhận trùng khớp với mật khẩu ban đầu | Valid |
| EC18 | Trường xác nhận mật khẩu bị bỏ trống | Invalid |
| EC19 | Mật khẩu xác nhận có giá trị nhưng không khớp với mật khẩu ban đầu | Invalid |

Giải thích: Trường hợp bỏ trống và trường hợp nhập mật khẩu không khớp được tách riêng vì chúng có thể được hệ thống kiểm tra và thông báo theo cách khác nhau.

### 2.3. Tập phân hoạch tương đương đầy đủ

Sau khi phân tích từng điều kiện đầu vào, tập các lớp tương đương của FR-01 được tổng hợp như sau:

| Điều kiện | Các lớp tương đương | Phân loại |
|---|---|---|
| Họ và tên | EC01, EC02 | 1 Valid, 1 Invalid |
| Email | EC03, EC04, EC05, EC06 | 1 Valid, 3 Invalid |
| Độ dài mật khẩu | EC07, EC08 | 1 Valid, 1 Invalid |
| Chữ hoa trong mật khẩu | EC09, EC10 | 1 Valid, 1 Invalid |
| Chữ thường trong mật khẩu | EC11, EC12 | 1 Valid, 1 Invalid |
| Chữ số trong mật khẩu | EC13, EC14 | 1 Valid, 1 Invalid |
| Ký tự đặc biệt trong mật khẩu | EC15, EC16 | 1 Valid, 1 Invalid |
| Xác nhận mật khẩu | EC17, EC18, EC19 | 1 Valid, 2 Invalid |

Tổng cộng, bước phân hoạch đã xác định 19 lớp tương đương cho các điều kiện đầu vào của chức năng FR-01.

Lưu ý rằng các lớp của những điều kiện mật khẩu khác nhau có thể giao nhau. Ví dụ, một mật khẩu vừa quá ngắn vừa không có chữ số có thể vi phạm đồng thời hai điều kiện. Khi lựa chọn test case ở Bước 3, cần thiết kế dữ liệu để kiểm tra riêng từng lớp Invalid và tránh vi phạm nhiều điều kiện cùng lúc.

## Bước 3. Lựa chọn test case đại diện

### 3.1. Nguyên tắc lựa chọn test case

Dựa trên tập phân hoạch tương đương đã xác định ở Bước 2, các test case được lựa chọn theo những nguyên tắc sau:

- Đối với các lớp tương đương hợp lệ, kết hợp nhiều lớp trong cùng một test case nếu các điều kiện có thể đồng thời được thỏa mãn.
- Đối với các lớp tương đương không hợp lệ, mỗi test case tập trung kiểm tra một lớp Invalid, trong khi các điều kiện còn lại được thiết lập hợp lệ.
- Mỗi test case phải có dữ liệu đầu vào và kết quả mong đợi rõ ràng.
- Các dữ liệu kiểm thử phải được chuẩn bị phù hợp với môi trường thực tế. Trường hợp cần kiểm tra email trùng lặp, phải có sẵn tài khoản sử dụng email đó.

### 3.2. Bộ test case bao phủ các lớp tương đương

Bảng dưới đây trình bày các test case được lựa chọn để bao phủ 19 lớp tương đương của chức năng FR-01.

| Mã test case | Lớp tương đương được kiểm tra | Mục đích |
|---|---|---|
| TC01 | EC01, EC03, EC07, EC09, EC11, EC13, EC15, EC17 | Kiểm tra đăng ký với dữ liệu hợp lệ |
| TC02 | EC02 | Kiểm tra họ và tên bị bỏ trống |
| TC03 | EC04 | Kiểm tra email bị bỏ trống |
| TC04 | EC05 | Kiểm tra email sai định dạng |
| TC05 | EC06 | Kiểm tra email đã tồn tại |
| TC06 | EC08 | Kiểm tra mật khẩu ngắn hơn 8 ký tự |
| TC07 | EC10 | Kiểm tra mật khẩu không có chữ hoa |
| TC08 | EC12 | Kiểm tra mật khẩu không có chữ thường |
| TC09 | EC14 | Kiểm tra mật khẩu không có chữ số |
| TC10 | EC16 | Kiểm tra mật khẩu không có ký tự đặc biệt được chấp nhận |
| TC11 | EC18 | Kiểm tra trường xác nhận mật khẩu bị bỏ trống |
| TC12 | EC19 | Kiểm tra mật khẩu xác nhận không khớp |

Như vậy, bộ test case ban đầu gồm 12 test case, trong đó có 1 test case hợp lệ kết hợp nhiều lớp Valid và 11 test case tập trung vào các lớp Invalid.

### 3.3. Chi tiết test case

Để tránh các điều kiện không hợp lệ ảnh hưởng lẫn nhau, các test case dưới đây được xây dựng dựa trên nguyên tắc chỉ thay đổi dữ liệu thuộc lớp đang kiểm tra.

#### TC01 – Đăng ký thành công

**Dữ liệu đầu vào:**

| Trường | Giá trị |
|---|---|
| Họ và tên | Nguyễn Văn An |
| Email | Email hợp lệ, chưa tồn tại trong hệ thống |
| Mật khẩu | `Abcdef1!` |
| Xác nhận mật khẩu | `Abcdef1!` |

**Các lớp được bao phủ:** EC01, EC03, EC07, EC09, EC11, EC13, EC15, EC17.

**Kết quả mong đợi:** Hệ thống tạo tài khoản thành công và chuyển người dùng đến trang đăng nhập.

#### TC02 – Bỏ trống họ và tên

**Dữ liệu đầu vào:**

- Họ và tên: để trống.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: `Abcdef1!`.

**Lớp được kiểm tra:** EC02.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký và thông báo họ và tên là trường bắt buộc.

#### TC03 – Bỏ trống email

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: để trống.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: `Abcdef1!`.

**Lớp được kiểm tra:** EC04.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký và thông báo email là trường bắt buộc.

#### TC04 – Email sai định dạng

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: `nguyen-at-example.com`.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: `Abcdef1!`.

**Lớp được kiểm tra:** EC05.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì email không đúng định dạng.

#### TC05 – Email đã tồn tại

**Điều kiện tiên quyết:** Trong hệ thống đã có một tài khoản sử dụng email được chọn để kiểm thử.

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ đã được sử dụng bởi tài khoản có sẵn.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: `Abcdef1!`.

**Lớp được kiểm tra:** EC06.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký và thông báo email đã được sử dụng.

#### TC06 – Mật khẩu ngắn hơn 8 ký tự

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Ab1!`.
- Xác nhận mật khẩu: `Ab1!`.

**Lớp được kiểm tra:** EC08.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì mật khẩu không đáp ứng độ dài tối thiểu.

Giá trị `Ab1!` có chữ hoa, chữ thường, chữ số và ký tự đặc biệt, nhưng chỉ có 4 ký tự. Do đó, test case này tập trung kiểm tra điều kiện độ dài.

#### TC07 – Mật khẩu không có chữ hoa

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `abcdefg1!`.
- Xác nhận mật khẩu: `abcdefg1!`.

**Lớp được kiểm tra:** EC10.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì mật khẩu không có chữ hoa.

Mật khẩu có đủ độ dài, chữ thường, chữ số và ký tự đặc biệt, nhưng không có chữ hoa.

#### TC08 – Mật khẩu không có chữ thường

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `ABCDEFG1!`.
- Xác nhận mật khẩu: `ABCDEFG1!`.

**Lớp được kiểm tra:** EC12.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì mật khẩu không có chữ thường.

#### TC09 – Mật khẩu không có chữ số

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Abcdefg!`.
- Xác nhận mật khẩu: `Abcdefg!`.

**Lớp được kiểm tra:** EC14.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì mật khẩu không có chữ số.

#### TC10 – Mật khẩu không có ký tự đặc biệt được chấp nhận

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Abcdefg1`.
- Xác nhận mật khẩu: `Abcdefg1`.

**Lớp được kiểm tra:** EC16.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký vì mật khẩu không chứa ký tự đặc biệt được chấp nhận.

#### TC11 – Bỏ trống xác nhận mật khẩu

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: để trống.

**Lớp được kiểm tra:** EC18.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký và thông báo trường xác nhận mật khẩu chưa được nhập.

Khi chạy thực tế, cần ghi nhận cách hệ thống xử lý trường hợp này, vì hệ thống có thể kiểm tra đồng thời điều kiện bắt buộc và điều kiện khớp mật khẩu.

#### TC12 – Mật khẩu xác nhận không khớp

**Dữ liệu đầu vào:**

- Họ và tên: Nguyễn Văn An.
- Email: email hợp lệ, chưa tồn tại.
- Mật khẩu: `Abcdef1!`.
- Xác nhận mật khẩu: `Abcdef2!`.

**Lớp được kiểm tra:** EC19.

**Kết quả mong đợi:** Hệ thống từ chối đăng ký và thông báo hai mật khẩu không khớp.

Cả hai mật khẩu đều đáp ứng điều kiện về độ dài và thành phần ký tự. Vì vậy, điều kiện không hợp lệ được kiểm tra ở đây là sự không khớp giữa hai trường.

### 3.4. Đánh giá độ bao phủ các lớp tương đương

Sau khi đối chiếu từng test case với tập phân hoạch ở Bước 2, tất cả các lớp từ EC01 đến EC19 đều có test case đại diện.

- Các lớp Valid được bao phủ trong TC01.
- Các lớp Invalid được kiểm tra lần lượt trong TC02 đến TC12.
- Những dữ liệu dùng để kiểm tra lớp Invalid được thiết kế để hạn chế vi phạm nhiều điều kiện cùng lúc.

Bộ test case này là bộ thiết kế ban đầu. Kết quả thực tế cần được xác nhận thông qua quá trình thực thi trên EShop. Nếu phát hiện điều kiện chưa được kiểm tra hoặc có cách xử lý khác nhau trong cùng một lớp, cần điều chỉnh lại phân hoạch và bổ sung test case tương ứng.




