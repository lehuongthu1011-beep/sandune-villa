export const dynamic = "force-static";

const SITE = "https://sandunevilla.vn";

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE + "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: SITE + "/rooms", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: SITE + "/gallery", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: SITE + "/contact", lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];
}
