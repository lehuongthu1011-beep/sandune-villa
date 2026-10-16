// Nội dung đọc từ /content/*.json — các file này sửa được qua trang quản trị /admin
// (Sveltia CMS). Sửa ở /admin rồi "Publish" sẽ commit thẳng vào các file JSON ở đây,
// web tự build lại. Không sửa trực tiếp file này trừ khi đổi cấu trúc dữ liệu.
import site from "@/content/site.json";
import roomsData from "@/content/rooms.json";
import amenitiesData from "@/content/amenities.json";
import reviewsData from "@/content/reviews.json";
import showcaseData from "@/content/showcase.json";
import galleryData from "@/content/gallery.json";

export const SV_ASSETS = "/assets/";

export const SV_PHOTOS = [
  "photo-pool-hammocks.png",
  "photo-living.png",
  "photo-dining.png",
  "photo-bed-loft-tub.png",
  "photo-sauna.png",
  "photo-bbq-terrace.png",
  "photo-kitchen.png",
  "photo-pool-waterfall.png",
  "photo-bathtub.png",
  "photo-exterior-dusk.png",
].map((n) => SV_ASSETS + n);

export const SV_GALLERY = galleryData.items.map((p) => ({ ...p, src: SV_ASSETS + p.src }));

export const SV_COPY = site.copy;

export const SV_ROOMS = roomsData.items.map((r) => ({ ...r, image: SV_ASSETS + r.image }));

export const SV_AMENITIES = amenitiesData.items;

export const SV_REVIEWS = reviewsData.reviews;

export const SV_SCORES = reviewsData.scores;

export const SV_RATE = site.rate;

export const SV_CONTACT = site.contact;

export const SV_SHOWCASE = showcaseData.items;

// Đọc một trường đa ngôn ngữ kiểu suffix (vd flagVi/flagEn/flagKo/flagZh).
// Thiếu bản dịch thì rơi về Vi để không bao giờ hiện trống.
const LANG_SUFFIX = { vi: "Vi", en: "En", ko: "Ko", zh: "Zh" };
export function pickLang(obj, field, lang) {
  if (!obj) return "";
  const suf = LANG_SUFFIX[lang] || "Vi";
  return obj[field + suf] ?? obj[field + "Vi"] ?? "";
}
