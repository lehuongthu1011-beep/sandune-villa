export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/"] }],
    sitemap: "https://sandunevilla.vn/sitemap.xml",
    host: "https://sandunevilla.vn",
  };
}
