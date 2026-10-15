/** @type {import('next').NextConfig} */
const nextConfig = {
  // Xuất ra site tĩnh (thư mục "out") để deploy thẳng lên Cloudflare Pages,
  // không cần máy chủ Node chạy nền.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
