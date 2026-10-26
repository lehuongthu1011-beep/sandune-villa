export const metadata = {
  title: "Hướng dẫn quản trị",
  robots: { index: false, follow: false },
};

const Section = ({ title, children }) => (
  <section style={{ marginTop: 40 }}>
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 12px" }}>{title}</h2>
    <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{children}</div>
  </section>
);

export default function GuidePage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px var(--gutter) 100px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: 0 }}>Hướng dẫn sửa nội dung website</h1>
      <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", marginTop: 12 }}>
        Trang này ghi lại cách sửa nội dung SanDune Villa qua trang quản trị, không cần biết code.
      </p>

      <Section title="1. Đăng nhập trang quản trị">
        <p>
          Vào <code>/admin</code> trên website (vd <code>https://sandunevilla.vn/admin</code>), đăng nhập bằng tài khoản
          GitHub được cấp quyền. Sau khi đăng nhập, bên trái hiện danh sách các mục có thể sửa.
        </p>
      </Section>

      <Section title="2. Các mục có thể sửa">
        <ul>
          <li><b>Trang chủ &amp; Thông tin chung</b> — số điện thoại, email, địa chỉ, giá đặt phòng, toàn bộ chữ trên trang chủ (tiêu đề, mô tả, 4 số liệu nổi bật…), có cả bản Tiếng Việt và English.</li>
          <li><b>Danh sách phòng</b> — tên, ảnh, hạng phòng, 3 thông tin ngắn của từng phòng (hiện ở trang Phòng).</li>
          <li><b>Tiện nghi villa</b> — danh sách tiện nghi hiện ở trang chủ và trang Phòng.</li>
          <li><b>Không gian nổi bật</b> — 5 khối ảnh lớn xen kẽ trên trang chủ (hồ bơi, phòng khách, sauna…).</li>
          <li><b>Thư viện ảnh</b> — toàn bộ ảnh và chú thích ở trang Thư viện.</li>
          <li><b>Đánh giá khách</b> — điểm Airbnb/Agoda và các nhận xét hiển thị trên trang chủ.</li>
        </ul>
      </Section>

      <Section title="3. Sửa và đăng">
        <p>
          Sửa xong bấm <b>Lưu</b> (Save) rồi <b>Đăng</b> (Publish/Commit). Thay đổi sẽ tự động build lại và lên web thật
          trong khoảng 1–2 phút. Mọi lần sửa đều lưu lại lịch sử — sửa nhầm vẫn quay lại bản trước được qua GitHub
          (liên hệ người quản trị kỹ thuật nếu cần quay lại).
        </p>
      </Section>

      <Section title="4. Khi khách đặt phòng / gửi liên hệ">
        <p>
          Yêu cầu đặt phòng (trang <code>/book</code>, bước Thanh toán) và yêu cầu liên hệ (trang <code>/contact</code>) sẽ
          tự động: ghi vào Google Sheet, báo qua nhóm Telegram, và gửi email cho chủ nhà. Xem chi tiết kỹ thuật ở file{" "}
          <code>apps-script/Code.gs</code> trong mã nguồn.
        </p>
      </Section>

      <Section title="5. Đổi ảnh">
        <p>
          Khi sửa một mục có trường ảnh (phòng, thư viện, không gian nổi bật…), bấm vào ô ảnh sẽ mở thư viện — có thể
          tải ảnh mới lên trực tiếp hoặc chọn ảnh đã có sẵn trong thư mục <code>assets</code>.
        </p>
      </Section>
    </div>
  );
}
