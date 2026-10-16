// Cloudflare Worker: đồng bộ lịch đặt từ Airbnb/Agoda/Booking.com/Ctrip mỗi
// phút, lưu vào KV, cấp API cho web đọc trực tiếp lúc tải trang, ghi nhận
// đặt phòng trực tiếp trên web, và xuất link iCal để dán ngược vào các kênh
// OTA khác (tránh trùng lịch 2 chiều).
//
// Triển khai: xem worker/README.md

import { handleCms } from "./cms.js";

const ALLOWED_ORIGINS = ["https://sandunevilla.vn", "http://localhost:3000"];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  };
}

function toISODate(ymd) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Phân tích tối giản 1 file iCal: lấy DTSTART/DTEND (VALUE=DATE, all-day) của
// mọi VEVENT. Ngày trả phòng (DTEND) không tính là bị khoá vì khách rời đi
// buổi sáng, đêm đó vẫn đặt được.
function parseIcs(text) {
  const dates = [];
  const events = text.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const startMatch = ev.match(/DTSTART[^:]*:(\d{8})/);
    const endMatch = ev.match(/DTEND[^:]*:(\d{8})/);
    if (!startMatch) continue;
    const start = toISODate(startMatch[1]);
    const end = endMatch ? toISODate(endMatch[1]) : addDays(start, 1);
    let cur = start;
    while (cur < end) {
      dates.push(cur);
      cur = addDays(cur, 1);
    }
  }
  return dates;
}

async function fetchIcs(url, name) {
  if (!url) return [];
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sandune-villa-sync/1.0" } });
    if (!res.ok) {
      console.error(`[${name}] HTTP ${res.status}`);
      return [];
    }
    return parseIcs(await res.text());
  } catch (err) {
    console.error(`[${name}] lỗi:`, err.message);
    return [];
  }
}

async function getDirectBookings(env) {
  const raw = await env.CALENDAR_KV.get("direct-bookings");
  try {
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Chỉ đơn ĐÃ THANH TOÁN mới khoá ngày. Nhân sự thêm mã đơn vào mục "Xác nhận
// thanh toán" ở /admin (file content/payments.json trên GitHub). Mỗi lần đồng
// bộ, Worker đọc file đó, hỏi Apps Script ngày ở của từng mã, rồi ghi đè danh
// sách. Xoá mã khỏi /admin thì ngày tự mở lại. Nếu một trong hai nguồn lỗi thì
// giữ nguyên danh sách cũ, không xoá nhầm.
const REPO = "lehuongthu1011-beep/sandune-villa";

async function fetchPaidRefs(env) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/content/payments.json`, {
    headers: {
      authorization: `Bearer ${env.CMS_GITHUB_TOKEN}`,
      accept: "application/vnd.github.raw+json",
      "user-agent": "sandune-ota-sync",
    },
  });
  if (!res.ok) throw new Error("GitHub HTTP " + res.status);
  const data = JSON.parse(await res.text());
  const refs = new Set();
  for (const it of Array.isArray(data.paid) ? data.paid : []) {
    const ref = String((it && it.ref) || "").trim().toUpperCase();
    if (ref) refs.add(ref);
  }
  return refs;
}

async function refreshPaidBookings(env) {
  if (!env.OTP_MAIL_URL || !env.OTP_MAIL_SECRET || !env.CMS_GITHUB_TOKEN) return;
  try {
    const refs = await fetchPaidRefs(env);
    const res = await fetch(env.OTP_MAIL_URL, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "bookings", secret: env.OTP_MAIL_SECRET }),
    });
    const data = JSON.parse(await res.text());
    if (!data || data.ok !== true || !Array.isArray(data.bookings)) {
      console.error("[paid] phản hồi không hợp lệ", data && data.error);
      return;
    }
    const list = data.bookings
      .filter(
        (b) =>
          b &&
          typeof b.ref === "string" &&
          refs.has(b.ref.trim().toUpperCase()) &&
          ISO_DATE_RE.test(b.start) &&
          ISO_DATE_RE.test(b.end) &&
          b.end > b.start
      )
      .map((b) => ({ ref: b.ref, start: b.start, end: b.end }));
    await env.CALENDAR_KV.put("direct-bookings", JSON.stringify(list));
  } catch (err) {
    console.error("[paid] lỗi:", err.message);
  }
}

async function sync(env) {
  await refreshPaidBookings(env);
  const all = new Set();
  const results = await Promise.all([
    fetchIcs(env.AIRBNB_ICAL_URL, "airbnb"),
    fetchIcs(env.AGODA_ICAL_URL, "agoda"),
    fetchIcs(env.BOOKING_ICAL_URL, "booking"),
    fetchIcs(env.CTRIP_ICAL_URL, "ctrip"),
  ]);
  results.flat().forEach((d) => all.add(d));

  // Đơn đặt trực tiếp đã thanh toán cũng khoá ngày, không chỉ các kênh OTA.
  const direct = await getDirectBookings(env);
  for (const b of direct) {
    let cur = b.start;
    while (cur < b.end) {
      all.add(cur);
      cur = addDays(cur, 1);
    }
  }

  const sorted = [...all].sort();
  await env.CALENDAR_KV.put("unavailable-dates", JSON.stringify(sorted));
  await env.CALENDAR_KV.put("unavailable-dates-updated-at", new Date().toISOString());
  return sorted;
}

function toIcsDate(iso) {
  return iso.replace(/-/g, "");
}

// Xuất lịch đặt phòng trực tiếp trên web dạng iCal — dán link này vào mục
// "Import calendar" / "Sync calendars" của Airbnb/Agoda/Booking.com/Ctrip để
// các kênh đó tự khoá ngày khi có khách đặt thẳng trên web.
function buildIcs(bookings) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SanDune Villa//Direct Bookings//VI", "CALSCALE:GREGORIAN"];
  for (const b of bookings) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.ref}@sandunevilla.vn`,
      `DTSTAMP:${toIcsDate(b.createdAt || b.start)}T000000Z`,
      `DTSTART;VALUE=DATE:${toIcsDate(b.start)}`,
      `DTEND;VALUE=DATE:${toIcsDate(b.end)}`,
      "SUMMARY:Đã đặt — SanDune Villa (web)",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sync(env));
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";

    // Cổng đăng nhập /admin (email + mã 6 số) và cổng chuyển tiếp GitHub:
    // /cms/auth*, /gh/api/*. Code ở src/cms.js.
    const cmsResponse = await handleCms(req, env, url, origin);
    if (cmsResponse) return cmsResponse;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (url.pathname === "/unavailable-dates") {
      const data = (await env.CALENDAR_KV.get("unavailable-dates")) || "[]";
      const updatedAt = await env.CALENDAR_KV.get("unavailable-dates-updated-at");
      return new Response(data, {
        headers: { ...corsHeaders(origin), "content-type": "application/json", "x-updated-at": updatedAt || "" },
      });
    }

    if (url.pathname === "/export.ics") {
      const direct = await getDirectBookings(env);
      return new Response(buildIcs(direct), {
        headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "public, max-age=60" },
      });
    }

    if (url.pathname === "/book" && req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ ok: false, error: "invalid JSON" }), {
          status: 400,
          headers: { ...corsHeaders(origin), "content-type": "application/json" },
        });
      }
      const { ref, start, end } = body || {};
      if (
        typeof ref !== "string" ||
        !ref.startsWith("SDV-") ||
        ref.length > 40 ||
        !ISO_DATE_RE.test(start) ||
        !ISO_DATE_RE.test(end) ||
        end <= start
      ) {
        return new Response(JSON.stringify({ ok: false, error: "invalid booking" }), {
          status: 400,
          headers: { ...corsHeaders(origin), "content-type": "application/json" },
        });
      }
      // Đơn mới đặt chưa thanh toán thì KHÔNG khoá ngày. Chỉ ghi nhận hợp lệ
      // để các bản web cũ gọi vào không bị lỗi; ngày chỉ khoá khi nhân sự xác
      // nhận "Đã thanh toán" trong Google Sheet.
      return new Response(JSON.stringify({ ok: true, locked: false }), {
        headers: { ...corsHeaders(origin), "content-type": "application/json" },
      });
    }

    if (url.pathname === "/sync" && req.method === "POST") {
      // Đồng bộ thủ công ngay lập tức, cần đúng khoá bí mật SYNC_SECRET.
      if (req.headers.get("x-sync-secret") !== env.SYNC_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
      const sorted = await sync(env);
      return new Response(JSON.stringify({ ok: true, count: sorted.length }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
