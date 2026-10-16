# sandune-ota-sync (Cloudflare Worker)

Đồng bộ lịch đã đặt từ Airbnb / Agoda / Booking.com / Ctrip mỗi phút, lưu vào
Cloudflare KV, và cấp API cho website đọc trực tiếp lúc khách mở trang đặt
phòng — không cần build lại site mỗi lần có khách đặt mới.

**Đã triển khai tại:** `https://sandune-ota-sync.lehuongthu1011.workers.dev`

## Endpoint

- `GET /unavailable-dates` — trả về mảng JSON các ngày (`YYYY-MM-DD`) đã có
  khách đặt trên bất kỳ kênh nào. Web (`components/sections/BookingPage.jsx`)
  gọi endpoint này lúc tải trang.
- `POST /sync` (header `x-sync-secret: <SYNC_SECRET>`) — đồng bộ ngay lập tức
  thay vì chờ tới lượt chạy tự động tiếp theo.
- `GET /cms/auth`, `POST /cms/auth/send`, `POST /cms/auth/verify`: trang đăng
  nhập `/admin` bằng email và mã 6 số (code ở `src/cms.js`).
- `/gh/api/v3/*` và `/gh/api/graphql`: cổng chuyển lệnh của trang `/admin`
  sang GitHub. Xem mục "Đăng nhập trang quản trị" bên dưới.

## Triển khai lại sau khi sửa code

```bash
cd worker
npx wrangler deploy
```

## Các secret đã thiết lập (Settings → trên Cloudflare, không có trong repo)

- `AIRBNB_ICAL_URL`, `AGODA_ICAL_URL`, `BOOKING_ICAL_URL`, `CTRIP_ICAL_URL` —
  link iCal riêng của từng kênh (Export Calendar / Sync calendars trong phần
  Lịch của từng kênh). Đổi link thì chạy lại `npx wrangler secret put <TÊN>`.
- `SYNC_SECRET` — mã để gọi `/sync` thủ công.
- `CMS_GITHUB_TOKEN`: mã GitHub của công ty, chỉ dùng cho repo này (cách tạo
  ở mục "Đăng nhập trang quản trị").
- `CMS_ALLOWED_EMAILS`: danh sách email nhân sự được vào `/admin`.
- `OTP_MAIL_URL`: địa chỉ Web app của Apps Script (dạng
  `https://script.google.com/macros/s/.../exec`), dùng để gửi mã đăng nhập.
- `OTP_MAIL_SECRET`: chuỗi bí mật dùng chung với Apps Script để Apps Script
  chỉ gửi mã khi yêu cầu đến từ Worker này.

## Đổi tần suất tự động

Sửa `triggers.crons` trong `wrangler.jsonc` (hiện tại `* * * * *` = mỗi phút),
rồi `npx wrangler deploy` lại.

## Thêm/bớt kênh OTA

1. Thêm secret mới: `npx wrangler secret put TEN_KENH_ICAL_URL`
2. Thêm dòng `fetchIcs(env.TEN_KENH_ICAL_URL, "ten_kenh")` vào mảng trong
   `src/index.js` (hàm `sync`)
3. `npx wrangler deploy`

## Đăng nhập trang quản trị /admin

Nhân sự mở `sandunevilla.vn/admin`, bấm "Đăng nhập bằng email", nhập email,
nhận mã 6 số qua Gmail của chủ nhà (do Apps Script gửi) rồi nhập mã. Không cần
tài khoản GitHub. Nội dung sửa xong được lưu thẳng vào repo (commit lên
`main`), website tự build lại sau khoảng 2 phút. Cuối mỗi dòng commit có tên
nhân sự đã sửa, ví dụ "Cập nhật Danh sách phòng · Lan".

Cổng này nằm trong Worker `sandune-ota-sync` và dùng chung KV `CALENDAR_KV`
(mã tạm, phiên và bộ đếm có tiền tố `otp:`, `sess:`, `rl:`).

### Cài đặt lần đầu

1. **Tạo mã GitHub của công ty.** Đăng nhập GitHub bằng tài khoản chủ repo
   (`lehuongthu1011-beep`), vào Settings, Developer settings, Personal access
   tokens, Fine-grained tokens, Generate new token. Chọn Repository access là
   "Only select repositories" và chỉ chọn `sandune-villa`. Ở Repository
   permissions đặt Contents là "Read and write". Chọn hạn dùng dài nhất, copy
   mã `github_pat_...` và ghi lại ngày hết hạn (xem mục "Khi mã GitHub hết
   hạn"). Phải dùng loại fine-grained. Loại classic có quyền trên mọi repo của
   tài khoản, không phù hợp.
2. **Đặt khoá bí mật cho Apps Script.** Tạo một chuỗi dài, ví dụ
   `openssl rand -hex 24`. Trong Apps Script, vào Cài đặt dự án, Thuộc tính tập
   lệnh, thêm `OTP_MAIL_SECRET` với chuỗi đó. Dán lại toàn bộ
   `apps-script/Code.gs` (bản mới có thêm nhánh gửi mã), rồi Triển khai, Quản
   lý bản triển khai, sửa bản đang dùng, chọn "Phiên bản mới". URL giữ nguyên.
3. **Cài secret cho Worker rồi triển khai.** Chạy trong thư mục `worker`, mỗi
   lệnh sẽ hỏi giá trị:

   ```bash
   cd worker
   npx wrangler secret put CMS_GITHUB_TOKEN     # mã github_pat_... ở bước 1
   npx wrangler secret put CMS_ALLOWED_EMAILS   # vd: lan@gmail.com=Lan,minh@gmail.com=Minh
   npx wrangler secret put OTP_MAIL_URL         # URL Web app Apps Script (đuôi /exec)
   npx wrangler secret put OTP_MAIL_SECRET      # cùng chuỗi đã đặt ở bước 2
   npx wrangler deploy
   ```

   `CMS_ALLOWED_EMAILS` viết trên một dòng, các email cách nhau bằng dấu phẩy.
   Phần sau dấu `=` là tên hiển thị trong lịch sử commit, có thể bỏ.
   `OTP_MAIL_URL` là cùng URL với biến `NEXT_PUBLIC_BOOKING_WEBHOOK_URL` của
   web đặt phòng.
4. **Thử.** Mở `https://sandunevilla.vn/admin`, bấm "Đăng nhập bằng email",
   nhập email có trong danh sách và nhập mã nhận được. Sửa thử một chữ nhỏ,
   lưu, rồi kiểm tra lịch sử commit trên GitHub có tên người sửa.

### Thêm hoặc bớt nhân sự

Chạy lại `npx wrangler secret put CMS_ALLOWED_EMAILS` với danh sách đầy đủ mới.
Có hiệu lực ngay: email bị bỏ khỏi danh sách mất quyền ở request kế tiếp, kể cả
khi người đó đang đăng nhập.

### Khi mã GitHub hết hạn

Trang `/admin` báo "Mã GitHub của công ty đã hết hạn". Tạo mã mới theo bước 1
rồi chạy `npx wrangler secret put CMS_GITHUB_TOKEN`. Nên đặt nhắc lịch trước
ngày hết hạn một tuần.

### Giới hạn và cách bảo vệ

- Mã 6 số có hiệu lực 10 phút, dùng một lần, sai 5 lần thì huỷ.
- Mỗi email chờ 60 giây giữa hai lần gửi mã. Mỗi địa chỉ IP gửi tối đa 10 lần
  và thử mã tối đa 30 lần trong 10 phút.
- Phiên đăng nhập kéo dài 30 ngày.
- Email không có trong danh sách nhận cùng phản hồi như email hợp lệ, nên
  không ai dò được ai là nhân sự.
- Cổng chỉ cho đụng tới repo `sandune-villa`, và chỉ cho ghi vào nội dung. Các
  lệnh xoá repo, đổi quyền, thêm cộng tác viên, webhook, secret đều bị chặn.
- Apps Script chỉ gửi mã khi yêu cầu có đúng `OTP_MAIL_SECRET`.
- Google giới hạn số email Apps Script gửi mỗi ngày (khoảng 100 với Gmail
  thường), đủ cho vài nhân sự đăng nhập.
