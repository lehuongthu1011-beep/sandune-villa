#!/usr/bin/env node
// Đồng bộ lịch đã đặt từ Airbnb / Agoda / Booking.com (qua link iCal) về
// content/unavailable-dates.json để web tự khoá ngày trên lịch đặt phòng.
//
// Link iCal là bí mật (ai có link đều xem được lịch) nên KHÔNG đưa vào code —
// đọc từ biến môi trường, set ở GitHub Actions → Settings → Secrets:
//   AIRBNB_ICAL_URL, AGODA_ICAL_URL, BOOKING_ICAL_URL
//
// Chạy thủ công: node scripts/sync-ota-calendars.mjs
// Chạy tự động: xem .github/workflows/sync-calendars.yml (lịch mỗi vài tiếng)

import { writeFile, readFile } from "node:fs/promises";

const SOURCES = [
  { name: "airbnb", url: process.env.AIRBNB_ICAL_URL },
  { name: "agoda", url: process.env.AGODA_ICAL_URL },
  { name: "booking", url: process.env.BOOKING_ICAL_URL },
].filter((s) => s.url);

const OUT_PATH = new URL("../content/unavailable-dates.json", import.meta.url);

function toISODate(ymd) {
  // "20260812" -> "2026-08-12"
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Phân tích tối giản 1 file iCal: lấy DTSTART/DTEND (dạng VALUE=DATE, all-day)
// của mọi VEVENT, trả về danh sách ngày bị khoá (không tính ngày trả phòng,
// vì khách rời đi sáng hôm đó nên đêm đó vẫn đặt được).
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
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sandune-villa-sync/1.0" } });
    if (!res.ok) {
      console.error(`[${name}] HTTP ${res.status}`);
      return [];
    }
    const text = await res.text();
    const dates = parseIcs(text);
    console.log(`[${name}] ${dates.length} ngày bị khoá`);
    return dates;
  } catch (err) {
    console.error(`[${name}] lỗi:`, err.message);
    return [];
  }
}

async function main() {
  if (SOURCES.length === 0) {
    console.log("Không có link iCal nào trong biến môi trường — bỏ qua.");
    return;
  }
  const all = new Set();
  for (const { name, url } of SOURCES) {
    const dates = await fetchIcs(url, name);
    dates.forEach((d) => all.add(d));
  }
  const sorted = [...all].sort();

  let prev = [];
  try {
    prev = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    /* file chưa tồn tại lần đầu */
  }
  const changed = JSON.stringify(prev) !== JSON.stringify(sorted);

  await writeFile(OUT_PATH, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Đã ghi ${sorted.length} ngày bị khoá vào content/unavailable-dates.json`);
  if (changed) console.log("CHANGED=1");
}

main();
