export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/huong-dan", "/book"] }],
    sitemap: "https://sandunevilla.vn/sitemap.xml",
    host: "https://sandunevilla.vn",
  };
}
