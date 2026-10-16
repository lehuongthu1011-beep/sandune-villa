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
 *      OTP_MAIL_SECRET  = chuỗi bí mật dài (32 ký tự trở lên), cùng giá trị với secret
 *                         OTP_MAIL_SECRET của Cloudflare Worker. Dùng để gửi mã
 *                         đăng nhập trang /admin (xem worker/README.md).
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

    // Gửi mã đăng nhập /admin cho nhân sự (do Cloudflare Worker gọi), không
    // ghi Sheet, không báo Telegram.
    if (data.type === "otp") {
      return handleOtp(data);
    }

    // Worker hỏi danh sách đơn (mã + ngày) để đối chiếu với các đơn đã được
    // xác nhận thanh toán ở trang /admin (mỗi phút một lần).
    if (data.type === "bookings") {
      return handleBookings(data);
    }

    var type = data.type === "contact" ? "contact" : "booking";

    // Chặn đơn rác: đơn đặt phòng thật luôn có mã bắt đầu bằng "SDV-".
    if (type === "booking" && !(typeof data.ref === "string" && data.ref.indexOf("SDV-") === 0)) {
      throw new Error("Mã đặt phòng không hợp lệ");
    }

    // Khoá để 2 đơn đến cùng lúc không ghi đè lên nhau trong Sheet.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (type === "booking") {
        appendBookingRow(data);
      } else {
        appendContactRow(data);
      }
    } finally {
      lock.releaseLock();
    }

    // Mỗi kênh báo tự bắt lỗi riêng: Telegram hỏng thì email vẫn gửi, và
    // đơn đã nằm trong Sheet rồi nên không bao giờ mất.
    var warnings = [];
    try { notifyTelegram(formatMessage(type, data)); } catch (err) { warnings.push("telegram: " + err); }
    try { notifyEmail(type, data); } catch (err) { warnings.push("email: " + err); }
    if (warnings.length) console.error(warnings.join(" | "));

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

/**
 * Gửi email chứa mã đăng nhập /admin. Chỉ chạy khi yêu cầu kèm đúng khoá bí mật
 * OTP_MAIL_SECRET (đặt trong Script Properties, cùng giá trị với secret
 * OTP_MAIL_SECRET của Cloudflare Worker). Không có khoá hoặc sai khoá thì từ
 * chối, vì URL Web app này công khai và nếu không thì ai cũng gửi được email
 * từ tài khoản của chủ nhà.
 */
function handleOtp(d) {
  var secret = PropertiesService.getScriptProperties().getProperty("OTP_MAIL_SECRET");
  if (!secret || typeof d.secret !== "string" || d.secret !== secret) {
    throw new Error("Sai khoá bí mật");
  }
  var email = String(d.email || "").trim();
  var code = String(d.code || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    throw new Error("Email không hợp lệ");
  }
  if (!/^\d{6}$/.test(code)) {
    throw new Error("Mã không hợp lệ");
  }
  var name = String(d.name || "").replace(/[\r\n]+/g, " ").slice(0, 60);
  var minutes = Math.max(1, Math.min(60, Number(d.minutes) || 10));

  MailApp.sendEmail(
    email,
    "Mã đăng nhập quản trị SanDune Villa",
    "Xin chào" + (name ? " " + name : "") + ",\n\n" +
      "Mã đăng nhập trang quản trị SanDune Villa của bạn là: " + code + "\n\n" +
      "Mã có hiệu lực " + minutes + " phút và chỉ dùng được một lần. " +
      "Nếu bạn không yêu cầu mã này, hãy bỏ qua email này."
  );

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function toIsoDate(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  }
  return String(v || "").trim().slice(0, 10);
}

/**
 * Trả về mã đặt phòng và ngày ở của mọi đơn. Việc đơn nào đã thanh toán do
 * nhân sự xác nhận ở trang /admin; Worker đối chiếu hai danh sách rồi mới khoá
 * ngày. Cần đúng OTP_MAIL_SECRET.
 */
function handleBookings(d) {
  var secret = PropertiesService.getScriptProperties().getProperty("OTP_MAIL_SECRET");
  if (!secret || typeof d.secret !== "string" || d.secret !== secret) {
    throw new Error("Sai khoá bí mật");
  }
  var sheet = getSheet("Đặt phòng");
  var out = [];
  if (sheet.getLastRow() >= 2) {
    var values = sheet.getDataRange().getValues();
    var head = values[0];
    var iRef = head.indexOf("Mã đặt phòng");
    var iIn = head.indexOf("Nhận phòng (ngày)");
    var iOut = head.indexOf("Trả phòng (ngày)");
    if (iRef < 0 || iIn < 0 || iOut < 0) throw new Error("Thiếu cột trong Sheet");
    for (var r = 1; r < values.length; r++) {
      var start = toIsoDate(values[r][iIn]);
      var end = toIsoDate(values[r][iOut]);
      if (/^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && end > start) {
        out.push({ ref: String(values[r][iRef]), start: start, end: end });
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, bookings: out })).setMimeType(
    ContentService.MimeType.JSON
  );
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
      "🏝 Yêu cầu đặt phòng mới\n" +
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
    "✉️ Yêu cầu liên hệ mới\n" +
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
  // Gửi văn bản thuần (không parse_mode): email/tên khách có dấu _ hoặc * sẽ
  // làm Telegram từ chối tin nếu dùng Markdown.
  var res = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error("Telegram trả mã " + res.getResponseCode() + ": " + res.getContentText());
  }
}

function notifyEmail(type, d) {
  var owner = PropertiesService.getScriptProperties().getProperty("OWNER_EMAIL");
  if (!owner) return;
  var subject =
    type === "booking" ? "SanDune Villa — Yêu cầu đặt phòng " + d.ref : "SanDune Villa — Yêu cầu liên hệ mới";
  MailApp.sendEmail(owner, subject, formatMessage(type, d));
}

/**
 * CHẠY THỬ SAU KHI CÀI ĐẶT: chọn hàm "testSetup" ở thanh trên cùng của trình
 * soạn thảo Apps Script rồi bấm Chạy. Hàm này tạo 1 đơn thử (mã SDV-TEST),
 * ghi vào Sheet, báo Telegram và email. Lần đầu chạy, Google sẽ hỏi cấp quyền
 * (Sheet, gửi email, kết nối ngoài): bấm Cho phép. Xong thì xoá dòng thử trong
 * tab "Đặt phòng".
 */
function testSetup() {
  var fake = {
    type: "booking", ref: "SDV-TEST", firstName: "Thử", lastName: "Nghiệm",
    email: "thu_nghiem@example.com", phone: "0900000000", nationality: "VN",
    checkIn: "2026-12-01", checkOut: "2026-12-03", nights: 2, adults: 2, kids: 0,
    infants: 0, guests: 2, arrive: "14:00", notes: "Đơn thử, bỏ qua", paymentMethod: "Chuyển khoản",
    total: 30000000, lang: "vi",
  };
  appendBookingRow(fake);
  notifyTelegram(formatMessage("booking", fake));
  notifyEmail("booking", fake);
  Logger.log("Xong: kiểm tra Sheet, Telegram và hộp thư.");
}
