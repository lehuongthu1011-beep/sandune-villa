// Cloudflare Worker: đồng bộ lịch đặt từ Airbnb/Agoda/Booking.com mỗi phút,
// lưu vào KV, và cấp API cho web đọc trực tiếp lúc tải trang.
//
// Triển khai: xem worker/README.md

const ALLOWED_ORIGINS = ["https://sandunevilla.vn", "http://localhost:3000"];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET, OPTIONS",
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

async function sync(env) {
  const all = new Set();
  const results = await Promise.all([
    fetchIcs(env.AIRBNB_ICAL_URL, "airbnb"),
    fetchIcs(env.AGODA_ICAL_URL, "agoda"),
    fetchIcs(env.BOOKING_ICAL_URL, "booking"),
    fetchIcs(env.CTRIP_ICAL_URL, "ctrip"),
  ]);
  results.flat().forEach((d) => all.add(d));
  const sorted = [...all].sort();
  await env.CALENDAR_KV.put("unavailable-dates", JSON.stringify(sorted));
  await env.CALENDAR_KV.put("unavailable-dates-updated-at", new Date().toISOString());
  return sorted;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sync(env));
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";

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
