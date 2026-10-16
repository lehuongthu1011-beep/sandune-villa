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

## Đổi tần suất tự động

Sửa `triggers.crons` trong `wrangler.jsonc` (hiện tại `* * * * *` = mỗi phút),
rồi `npx wrangler deploy` lại.

## Thêm/bớt kênh OTA

1. Thêm secret mới: `npx wrangler secret put TEN_KENH_ICAL_URL`
2. Thêm dòng `fetchIcs(env.TEN_KENH_ICAL_URL, "ten_kenh")` vào mảng trong
   `src/index.js` (hàm `sync`)
3. `npx wrangler deploy`
