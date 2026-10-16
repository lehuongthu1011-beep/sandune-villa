// Giá villa theo mùa. Dữ liệu ở content/pricing.json, sửa qua trang /admin
// (mục "Giá villa theo mùa"). Mỗi đêm được tính theo mùa chứa ngày đó. Đêm không
// thuộc mùa nào tính giá chuẩn (base). Mùa nằm trên trong danh sách được ưu tiên
// khi hai mùa chồng ngày nhau.
import pricing from "@/content/pricing.json";

export const BASE_PRICE = Number(pricing.base) || 0;

const SEASONS = (pricing.seasons || [])
  .map((s) => ({ ...s, price: Number(s.price) }))
  .filter((s) => s.price > 0 && s.from && s.to);

export const HAS_SEASONS = SEASONS.length > 0;

// Giá thấp nhất trong năm, dùng cho chữ "Từ ..." ở trang chủ.
export const LOWEST_PRICE = Math.min(BASE_PRICE || Infinity, ...SEASONS.map((s) => s.price));

const day = (v) => String(v).slice(0, 10);
const md = (iso) => iso.slice(5, 10);

function seasonFor(iso) {
  for (const s of SEASONS) {
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
