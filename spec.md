# Đặc tả nghiệp vụ — FC Manager

Ứng dụng quản lý một đội bóng phong trào: quản lý cầu thủ, lịch thi đấu, điểm danh, kết quả cá nhân sau trận (bàn thắng/kiến tạo, thống kê thủ môn, hậu vệ tham gia), thống kê, thu quỹ, và tài khoản người dùng theo vai trò. Giao diện tiếng Việt, single-page app, toàn bộ dữ liệu lưu trên Supabase.

## 0. Vai trò người dùng / Phân quyền

Có 3 vai trò (`role` trên bảng `login`), mỗi tài khoản gắn với đúng 1 vai trò:

- **Admin**: toàn quyền — xem và thực hiện mọi hành động thêm/sửa/xóa trên tất cả các module. Chỉ có **duy nhất 1 tài khoản Admin** trong hệ thống (ràng buộc ở DB), là tài khoản có sẵn (`admin`/`123456`) — không thể tự đăng ký tài khoản Admin qua UI hay qua service.
- **User** ("Người xem"): chỉ xem — mọi trang (Dashboard, Cầu thủ, Trận đấu, Điểm danh, Thống kê, Đóng quỹ) đều read-only, các nút Thêm/Sửa/Xóa/Ghi nhận thanh toán/Điểm danh đều bị ẩn. Không thấy và không vào được trang "Sau trận" (`/performance`).
- **Player** ("Cầu thủ"): giống `User` ở mọi trang khác, nhưng có thêm quyền tại trang Điểm danh: **chỉ nhìn thấy dòng của chính mình** (không thấy các cầu thủ khác), có thể tự bật "Có mặt"/"Vắng mặt" cho bản thân và lưu. Không thấy nút hành động hàng loạt ("Tất cả có mặt"/"Tất cả vắng" — chỉ Admin). Cũng không vào được trang "Sau trận".

**Đăng ký tài khoản** (`/register`): chọn 1 trong 2 loại — "Người xem" (chỉ cần tên đăng nhập + mật khẩu) hoặc "Cầu thủ" (cần chọn thêm 1 cầu thủ có sẵn trong danh sách để gắn tài khoản vào). Mỗi cầu thủ chỉ được gắn với tối đa 1 tài khoản Player — danh sách chọn cầu thủ khi đăng ký chỉ hiển thị các cầu thủ đang hoạt động (`is_active`) và **chưa có ai đăng ký** cho họ; tên đăng nhập không được trùng. Đăng ký thành công sẽ tự động đăng nhập luôn.

**Đăng nhập** (`/login`): so khớp tên đăng nhập/mật khẩu trực tiếp (không mã hóa mật khẩu — lưu và so sánh nguyên văn). Phiên đăng nhập được lưu trên trình duyệt (không hết hạn tự động, phải bấm Đăng xuất).

## 1. Quản lý cầu thủ (`/players`)

- CRUD danh sách cầu thủ: tên, **số áo**, **vị trí** (`GK` Thủ môn, `DEF` Hậu vệ, `MID` Tiền vệ, `FWD` Tiền đạo), số điện thoại (tùy chọn). Chỉ Admin thao tác được; các vai trò khác chỉ xem.
- Tìm kiếm theo tên; xác nhận trước khi xóa (`ConfirmDialog`).
- Đây là danh sách gốc dùng xuyên suốt các module khác (điểm danh, sau trận, thống kê, đóng quỹ, đăng ký tài khoản Player).

## 2. Quản lý trận đấu (`/matches`)

- CRUD trận đấu: đối thủ, ngày thi đấu, địa điểm, ghi chú (tùy chọn). Chỉ Admin thao tác được.
- Trận được coi là **"đã đấu" (quá khứ)** nếu ngày thi đấu không sau ngày hiện tại; **"sắp tới"** nếu sau ngày hiện tại. Quy tắc so sánh ngày này (`dayjs(m.date).isAfter(dayjs())`) được dùng lặp lại ở Dashboard, Thống kê và Sau trận để lọc trận.
- Link nhanh "Cập nhật sau trận" trên mỗi trận đã đấu chỉ hiển thị với Admin (khớp với việc trang Sau trận chỉ Admin được vào).

## 3. Điểm danh (`/attendance`)

- Chọn 1 trận (mặc định là trận đầu danh sách, hoặc theo query param `?match=`), điểm danh **có mặt / vắng mặt** cho từng cầu thủ.
- **Admin**: toàn quyền — có nút "Tất cả có mặt"/"Tất cả vắng" để đánh dấu hàng loạt, sửa trạng thái từng người, và lưu.
- **User**: chỉ xem toàn bộ danh sách, trạng thái hiển thị dạng nhãn (badge), không có nút chỉnh sửa hay lưu.
- **Player**: chỉ thấy **dòng của chính mình** trong danh sách (các cầu thủ khác không hiển thị), có thể tự bật Có mặt/Vắng mặt và lưu cho bản thân; không thấy nút hành động hàng loạt.
- Khi lưu: **ghi đè toàn bộ** bản ghi điểm danh cũ của trận đó (xóa rồi insert lại), không có lịch sử điểm danh theo thời gian. Cầu thủ không được đánh dấu tường minh sẽ được lưu là "vắng" khi bấm Lưu (kể cả khi Player chỉ tự sửa dòng của mình — dữ liệu các cầu thủ khác được giữ nguyên vì được tải đầy đủ từ server trước khi lưu, chỉ dòng của người dùng hiện tại có thể bị thay đổi qua thao tác trên giao diện).
- Mỗi trận chỉ có **một** bản ghi điểm danh (không hỗ trợ nhiều đợt điểm danh cho cùng một trận).

## 4. Cập nhật sau trận (`/performance`) — chỉ Admin

Chỉ áp dụng cho **trận đã đấu**. Nếu trận chưa có dữ liệu điểm danh, mặc định coi **tất cả cầu thủ đều có mặt**; ngược lại chỉ những cầu thủ được đánh dấu "có mặt" mới xuất hiện trong các form nhập liệu bên dưới.

- **Bàn thắng / kiến tạo**: với mỗi cầu thủ có mặt, nhập số bàn thắng và số kiến tạo (không còn ràng buộc theo vị trí).
- **Thủ môn**: nhập theo từng dòng độc lập — mỗi dòng gồm chọn 1 cầu thủ (trong số cầu thủ có mặt), số bàn thua, và **số trận đã chơi** dưới dạng số thập phân trong khoảng `(0, 1]` (hỗ trợ trường hợp thay thủ môn giữa trận, ví dụ 0.5 nếu chỉ chơi nửa trận). Có thể thêm nhiều dòng thủ môn cho cùng 1 trận (khi có thay người), nhưng **một cầu thủ không được xuất hiện nhiều hơn 1 dòng** trong cùng một trận.
- **Hậu vệ**: chọn (checkbox) những cầu thủ có mặt đã thi đấu ở vị trí hậu vệ trận đó — độc lập với vị trí đăng ký (`position`) của cầu thủ.
- Bấm "Lưu" sẽ ghi đè toàn bộ 3 phần dữ liệu trên cho trận đang chọn (xóa dữ liệu cũ của trận, ghi lại dữ liệu mới).

## 5. Thống kê (`/statistics`)

Có bộ lọc **năm** dùng chung cho toàn trang (mặc định "Tất cả", hoặc chọn 1 năm cụ thể dựa trên năm thi đấu) — mọi số liệu bên dưới đều được tính lại theo năm đã chọn.

- **Bảng tổng hợp theo cầu thủ** (giữ từ trước): số trận tham dự / vắng của mỗi cầu thủ (chỉ tính trận đã đấu), tổng bàn thắng, tổng bàn thua (cộng dồn từ vai trò thủ môn), tổng kiến tạo. Vắng > 2 trận được tô đỏ cảnh báo. Có 3 thẻ nổi bật: Vua phá lưới, Vua kiến tạo, Tham dự nhiều nhất. Có thể sắp xếp theo mọi cột, tìm kiếm theo tên.
- **Vua phá lưới** (danh sách đầy đủ, sắp xếp giảm dần theo bàn thắng): click vào một cầu thủ để xem chi tiết từng trận đã ghi bàn.
- **Vua kiến tạo** (tương tự, sắp xếp theo kiến tạo).
- **Thủ môn xuất sắc nhất**: tổng bàn thua, tổng số trận đã bắt (cộng dồn số thập phân), và tỉ lệ bàn thua/trận (làm tròn 2 chữ số). Sắp xếp mặc định **tăng dần theo tỉ lệ bàn thua/trận** (ít thua nhất xếp đầu). Click để xem chi tiết từng trận (bàn thua, số trận của trận đó).
- **Hậu vệ tham gia nhiều nhất**: đếm số trận mỗi cầu thủ được ghi nhận đá hậu vệ, sắp xếp giảm dần. Click để xem danh sách các trận đã tham gia.

## 6. Dashboard (`/`)

Trang tổng quan, tổng hợp dữ liệu từ các module khác, không có nghiệp vụ tính toán riêng:

- Thẻ số liệu: tổng cầu thủ, tổng trận đấu, tổng bàn thắng, tổng kiến tạo (toàn bộ trận, không phân biệt quá khứ/tương lai, không lọc theo năm).
- "Trận tiếp theo": trận đầu tiên có ngày sau hôm nay.
- "Trận đã đấu": 4 trận gần nhất trong số các trận đã diễn ra.
- Danh sách rút gọn cầu thủ.
- Khối tóm tắt **quỹ của đợt thu gần nhất** (xem mục 7): tổng cần thu, tổng đã thu, còn thiếu, và số người theo từng trạng thái đóng.

## 7. Đóng quỹ (`/contributions`, `/contributions/:id`) — thao tác chỉ Admin

Mô hình 3 cấp: **Đợt thu quỹ (Contribution)** → **Nghĩa vụ đóng của từng cầu thủ (ContributionPlayer)** → **Giao dịch thanh toán (ContributionTransaction)**. Tất cả vai trò đều xem được; chỉ Admin tạo đợt thu mới, chỉnh sửa/xóa đợt thu, và ghi nhận thanh toán.

- **Tạo đợt thu mới**: nhập tên đợt, số tiền mặc định mỗi người, hạn đóng, mô tả (tùy chọn).
  - Khi tạo, hệ thống **tự động khởi tạo nghĩa vụ đóng góp cho mọi cầu thủ đang active** (`is_active = true`) với số tiền = số tiền mặc định của đợt, trạng thái ban đầu `unpaid`.
- **Trang chi tiết đợt thu**: liệt kê từng cầu thủ với số tiền phải đóng / đã đóng / còn thiếu / trạng thái, và cho phép **ghi nhận thanh toán** (số tiền, hình thức: tiền mặt / chuyển khoản / khác, ngày thu, ghi chú).
  - Mỗi lần ghi nhận thanh toán: tạo 1 bản ghi giao dịch, đồng thời cộng dồn vào `amount_paid` của cầu thủ đó và **tự tính lại trạng thái**:
    - `amount_paid >= amount_due` → `paid` (đã đóng)
    - `0 < amount_paid < amount_due` → `partial` (đóng một phần)
    - `amount_paid == 0` → `unpaid` (chưa đóng)
    - `exempt` (miễn giảm) không tự động suy ra — chỉ được set thủ công (ở nơi khác/DB), không có UI để gán trạng thái này trong code hiện tại.
  - Có API xem lịch sử giao dịch (`getTransactions`) và tính tổng hợp đợt thu (`getSummary`: tổng cần thu, tổng đã thu, còn thiếu, số người theo từng trạng thái) — dùng cho cả trang chi tiết và Dashboard.
- Danh sách đợt thu (`ContributionsPage`) hiện luôn hiển thị trạng thái tĩnh "Đang mở" cho mọi đợt (chưa tính theo hạn đóng hay đã thu đủ chưa).

## Ghi chú về trạng thái triển khai (chưa hoàn thiện / hạn chế đã biết)

- Trang danh sách đợt thu quỹ chưa tính trạng thái "đã đóng đủ" / "quá hạn" thực tế — luôn hiển thị "Đang mở".
- Trang chi tiết đợt thu có các nút "Chỉnh sửa", "Xóa" đợt thu và "Lịch sử" giao dịch của từng cầu thủ nhưng **chưa được cài đặt** (còn để `// TODO`).
- Điểm danh không giữ lịch sử theo thời gian — mỗi lần lưu sẽ ghi đè hoàn toàn bản ghi trước đó của trận.
- Không có phân quyền ở tầng cơ sở dữ liệu (Supabase RLS đang tắt) — việc ẩn nút Thêm/Sửa/Xóa theo vai trò chỉ là giới hạn ở giao diện, không phải giới hạn quyền truy cập dữ liệu thực sự.
- Mật khẩu tài khoản được lưu và so sánh dạng nguyên văn (không mã hóa) — chấp nhận được ở quy mô nội bộ đội bóng hiện tại nhưng không phù hợp nếu mở rộng ra ngoài.
