/**
 * Nhận yêu cầu đặt phòng / liên hệ từ website SanDune Villa.
 * Ghi vào Google Sheet, báo Telegram, gửi email cho chủ nhà.
 *
 * CÀI ĐẶT (làm 1 lần):
 * 1. Tạo 1 Google Sheet mới, đặt tên tuỳ ý (vd "SanDune Villa — Đơn").
 *    Tạo 2 trang tính (tab) tên đúng: "Đặt phòng" và "Liên hệ".
 * 2. Mở Sheet → Tiện ích mở rộng → Apps Script. Xoá code mẫu, dán toàn bộ
 *    file này vào.
 * 3. Vào Cài đặt dự án (icon bánh răng bên trái) → Thuộc tính tập lệnh
 *    (Script Properties) → thêm các khoá sau:
 *      TELEGRAM_TOKEN   = token bot Telegram (lấy từ @BotFather)
 *      TELEGRAM_CHAT_ID = id nhóm/người nhận báo (xem hướng dẫn bên dưới)
 *      OWNER_EMAIL      = email chủ nhà nhận báo (vd trinhgia.jsc.vn@gmail.com)
 * 4. Triển khai → Triển khai mới → chọn "Ứng dụng web" (Web app):
 *      - Thực thi với tư cách: Tôi (email của bạn)
 *      - Người có quyền truy cập: Bất kỳ ai (Anyone)
 *    Bấm Triển khai, copy URL dạng https://script.google.com/macros/s/.../exec
 * 5. Dán URL đó vào biến NEXT_PUBLIC_BOOKING_WEBHOOK_URL trong
 *    file .env.local (xem .env.example) rồi build lại site.
 *
 * LƯU Ý: mỗi lần SỬA hàm doPost() phải "Triển khai phiên bản mới" (không
 * phải chỉ bấm Lưu) thì thay đổi mới có hiệu lực trên URL đang dùng.
 *
 * Lấy TELEGRAM_CHAT_ID: thêm bot vào nhóm Telegram, gửi 1 tin nhắn bất kỳ
 * trong nhóm, rồi mở trình duyệt vào:
 *   https://api.telegram.org/bot<TOKEN>/getUpdates
 * tìm "chat":{"id": ...} trong kết quả trả về.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type === "contact" ? "contact" : "booking";

    if (type === "booking") {
      appendBookingRow(data);
    } else {
      appendContactRow(data);
    }

    notifyTelegram(formatMessage(type, data));
    notifyEmail(type, data);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function appendBookingRow(d) {
  var sheet = getSheet("Đặt phòng");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Thời gian", "Mã đặt phòng", "Họ", "Tên", "Email", "SĐT", "Quốc tịch",
      "Nhận phòng (ngày)", "Trả phòng (ngày)", "Số đêm", "Người lớn", "Trẻ em",
      "Em bé", "Tổng khách", "Giờ nhận phòng dự kiến", "Ghi chú", "Phương thức thanh toán",
      "Tổng tiền (₫)", "Ngôn ngữ",
    ]);
  }
  sheet.appendRow([
    new Date(), d.ref, d.lastName, d.firstName, d.email, d.phone, d.nationality,
    d.checkIn, d.checkOut, d.nights, d.adults, d.kids, d.infants, d.guests,
    d.arrive, d.notes, d.paymentMethod, d.total, d.lang,
  ]);
}

function appendContactRow(d) {
  var sheet = getSheet("Liên hệ");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Thời gian", "Họ tên", "Email", "SĐT", "Số khách", "Ngày dự kiến", "Ghi chú", "Đồng ý nhận ưu đãi", "Ngôn ngữ"]);
  }
  sheet.appendRow([new Date(), d.name, d.email, d.phone, d.guests, d.dates, d.notes, d.offers ? "Có" : "Không", d.lang]);
}

function formatMessage(type, d) {
  if (type === "booking") {
    return (
      "🏝 *Yêu cầu đặt phòng mới*\n" +
      "Mã: " + d.ref + "\n" +
      "Khách: " + d.firstName + " " + d.lastName + "\n" +
      "SĐT: " + d.phone + " · Email: " + d.email + "\n" +
      "Ngày: " + d.checkIn + " – " + d.checkOut + " (" + d.nights + " đêm)\n" +
      "Khách: " + d.guests + " · Thanh toán: " + d.paymentMethod + "\n" +
      "Tổng: " + Number(d.total || 0).toLocaleString("vi-VN") + "₫\n" +
      (d.notes ? "Ghi chú: " + d.notes : "")
    );
  }
  return (
    "✉️ *Yêu cầu liên hệ mới*\n" +
    "Tên: " + d.name + "\n" +
    "SĐT: " + d.phone + " · Email: " + d.email + "\n" +
    "Số khách: " + d.guests + " · Ngày dự kiến: " + d.dates + "\n" +
    (d.notes ? "Ghi chú: " + d.notes : "")
  );
}

function notifyTelegram(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("TELEGRAM_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;
  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" }),
    muteHttpExceptions: true,
  });
}

function notifyEmail(type, d) {
  var owner = PropertiesService.getScriptProperties().getProperty("OWNER_EMAIL");
  if (!owner) return;
  var subject =
    type === "booking" ? "SanDune Villa — Yêu cầu đặt phòng " + d.ref : "SanDune Villa — Yêu cầu liên hệ mới";
  MailApp.sendEmail(owner, subject, formatMessage(type, d));
}
