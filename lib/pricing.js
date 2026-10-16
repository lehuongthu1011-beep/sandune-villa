// Giá villa theo ngày. Dữ liệu ở content/pricing.json, sửa qua trang /admin
// (mục "Giá villa theo ngày"). Mỗi đêm được tính theo quy tắc đầu tiên khớp trong
// danh sách. Một quy tắc có khoảng ngày (từ, đến; bỏ trống là mọi ngày), có thể
// lặp lại hằng năm, và có thể chỉ áp dụng cho một số thứ trong tuần. Đêm không
// khớp quy tắc nào tính giá chuẩn (base).
import pricing from "@/content/pricing.json";

export const BASE_PRICE = Number(pricing.base) || 0;

const SEASONS = (pricing.seasons || [])
  .map((s) => ({ ...s, price: Number(s.price) }))
  .filter((s) => s.price > 0);

const DOW = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const HAS_SEASONS = SEASONS.length > 0;

// Giá thấp nhất trong năm, dùng cho chữ "Từ ..." ở trang chủ.
export const LOWEST_PRICE = Math.min(BASE_PRICE || Infinity, ...SEASONS.map((s) => s.price));

const day = (v) => String(v).slice(0, 10);
const md = (iso) => iso.slice(5, 10);

function seasonFor(iso) {
  const dow = DOW[new Date(iso + "T00:00:00Z").getUTCDay()];
  for (const s of SEASONS) {
    if (s.weekdays && s.weekdays.length && !s.weekdays.includes(dow)) continue;
    if (!s.from || !s.to) return s;
    const from = day(s.from);
    const to = day(s.to);
    if (s.yearly) {
      const f = md(from);
      const t = md(to);
      const d = md(iso);
      const hit = f <= t ? d >= f && d <= t : d >= f || d <= t;
      if (hit) return s;
    } else if (iso >= from && iso <= to) {
      return s;
    }
  }
  return null;
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Tên mùa theo ngôn ngữ, rơi về tiếng Việt rồi tiếng Anh nếu thiếu bản dịch. */
export function seasonName(season, lang) {
  if (!season) return "";
  const cap = lang.charAt(0).toUpperCase() + lang.slice(1);
  return season["name" + cap] || season.nameVi || season.nameEn || "";
}

/**
 * Báo giá cho `nights` đêm bắt đầu từ `startIso`.
 * Trả về { total, groups: [{ price, nights, season }] }, các đêm cùng giá gộp lại.
 */
export function quote(startIso, nights) {
  const n = Math.max(1, nights || 1);
  const groups = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const season = startIso ? seasonFor(addDays(startIso, i)) : null;
    const price = season ? season.price : BASE_PRICE;
    total += price;
    const last = groups[groups.length - 1];
    if (last && last.price === price && last.season === season) last.nights += 1;
    else groups.push({ price, nights: 1, season });
  }
  return { total, groups };
}
