"use client";

// Gửi yêu cầu đặt phòng / liên hệ tới Apps Script (ghi Google Sheet + báo
// Telegram + email). URL lấy từ biến môi trường NEXT_PUBLIC_BOOKING_WEBHOOK_URL
// (xem .env.example). Nếu chưa cấu hình thì bỏ qua, không chặn luồng đặt phòng
// trên giao diện — xem "apps-script/Code.gs" để triển khai URL này.
export async function sendLead(payload) {
  const url = process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL;
  if (!url) {
    console.warn("[sendLead] Chưa cấu hình NEXT_PUBLIC_BOOKING_WEBHOOK_URL — bỏ qua gửi báo.");
    return { skipped: true };
  }
  try {
    // Content-Type: text/plain để tránh preflight CORS (Apps Script Web App
    // không hỗ trợ custom CORS headers đầy đủ). Apps Script vẫn đọc được
    // JSON từ e.postData.contents như bình thường.
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, sentAt: new Date().toISOString() }),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendLead] Gửi báo thất bại:", err);
    return { ok: false, error: String(err) };
  }
}
