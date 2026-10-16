"use client";
import { useState } from "react";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Button,
  Icon,
  DateRangePicker,
  GuestStepper,
  PriceSummary,
  Divider,
  Overline,
  Figure,
  Rating,
  Stepper,
  Logo,
  AmenityList,
} from "@/components/ds";
import { useLang } from "@/lib/lang-context";
import { SV_ASSETS, SV_CONTACT } from "@/lib/ds-data";
import { sendLead } from "@/lib/notify";

const RATE = 15000000;
const money = (n) => n.toLocaleString("vi-VN") + "₫";
const ADDONS = [];

const B = {
  vi: {
    steps: ["Ngày ở", "Thông tin", "Thanh toán", "Xác nhận"],
    secure: "Thanh toán bảo mật",
    back: "Quay lại",
    next: "Tiếp tục",
    toPay: "Tới thanh toán",
    pay: "Xác nhận & thanh toán",
    exit: "Về trang chủ",
    dTitle: "Chọn ngày ở",
    dLede: "Thuê nguyên căn 5 phòng ngủ, 15.000.000₫ một đêm. Nhận phòng từ 14:00, trả phòng trước 12:00.",
    pickEnd: "Chọn thêm ngày trả phòng để tiếp tục.",
    adults: ["Người lớn", "13 tuổi trở lên"],
    kids: ["Trẻ em", "2 – 12 tuổi"],
    infants: ["Em bé", "Dưới 2 tuổi"],
    gTitle: "Thông tin khách",
    last: "Họ",
    first: "Tên",
    email: "Email",
    phone: "Số điện thoại / Zalo",
    nat: "Quốc tịch",
    natOpts: ["Việt Nam", "Hàn Quốc", "Úc", "Anh"],
    arrive: "Giờ nhận phòng dự kiến",
    req: "Yêu cầu đặc biệt",
    reqHint: "Đón sân bay, giường phụ, nôi em bé, ăn kiêng…",
    addons: "Dịch vụ thêm",
    fill: "Điền họ tên, email và số điện thoại để tiếp tục.",
    payTitle: "Thanh toán",
    mCard: "Thẻ tín dụng / ghi nợ",
    mBank: "Chuyển khoản ngân hàng (VietQR)",
    mCash: "Thanh toán khi nhận phòng",
    cardNo: "Số thẻ",
    cardName: "Tên trên thẻ",
    exp: "Hết hạn",
    cvc: "CVC",
    bankNote: "Mã VietQR sẽ hiện ở bước xác nhận. Giữ phòng trong 60 phút cho tới khi nhận được chuyển khoản.",
    cashNote: "Cần đặt cọc 20% để giữ phòng. Phần còn lại thanh toán khi nhận phòng.",
    policy: "Chính sách huỷ",
    policyBody: "Huỷ trước 7 ngày được hoàn 100%. Từ 7 đến 3 ngày hoàn 50%. Trong vòng 3 ngày không hoàn.",
    agree: "Tôi đã đọc và đồng ý với chính sách huỷ phòng",
    needCard: "Điền đủ thông tin thẻ và đồng ý chính sách huỷ.",
    needAgree: "Đồng ý chính sách huỷ để tiếp tục.",
    code: "Mã đặt phòng",
    doneTitle: "Hẹn gặp bạn ngày",
    book: "Đặt phòng",
    again: "Đặt lần nữa",
    nightsW: (n) => n + " đêm",
    guestsW: (n) => n + " khách",
    rooms: "5 phòng ngủ · 6 giường king",
    whole: "Thuê nguyên căn",
    sumTitle: "Toàn bộ biệt thự",
    clean: "Phí dọn dẹp",
    cleanFree: "Miễn phí",
    cleanInfo: "Đã bao gồm trong giá phòng",
    tax: "Thuế & phí dịch vụ",
    taxInc: "Đã bao gồm",
    services: "Dịch vụ thêm",
    checkin: "Nhận phòng từ 14:00",
    addr: "Mỹ Khê 1, Sơn Trà, Đà Nẵng",
    pickDates: "Chọn ngày",
    monthLabel: "Th8 2026",
    myKhe: "Mỹ Khê · Đà Nẵng",
    afterSix: "Sau 18:00",
    priceUnit: "15.000.000₫ × ",
  },
  en: {
    steps: ["Dates", "Guest details", "Payment", "Confirmation"],
    secure: "Secure payment",
    back: "Back",
    next: "Continue",
    toPay: "Continue to payment",
    pay: "Confirm and pay",
    exit: "Back to the site",
    dTitle: "Choose your dates",
    dLede: "The whole five-bedroom villa, 15,000,000₫ a night. Check in from 14:00, check out by 12:00.",
    pickEnd: "Pick a check-out day to continue.",
    adults: ["Adults", "13 and over"],
    kids: ["Children", "2 – 12 years"],
    infants: ["Infants", "Under 2"],
    gTitle: "Guest details",
    last: "Family name",
    first: "First name",
    email: "Email",
    phone: "Phone / Zalo",
    nat: "Nationality",
    natOpts: ["Vietnam", "Korea", "Australia", "United Kingdom"],
    arrive: "Expected arrival time",
    req: "Special requests",
    reqHint: "Airport pickup, extra bed, cot, dietary needs…",
    addons: "Extras",
    fill: "Add your name, email and phone to continue.",
    payTitle: "Payment",
    mCard: "Credit or debit card",
    mBank: "Bank transfer (VietQR)",
    mCash: "Pay on arrival",
    cardNo: "Card number",
    cardName: "Name on card",
    exp: "Expiry",
    cvc: "CVC",
    bankNote: "The VietQR code appears on the confirmation step. We hold the dates for 60 minutes until the transfer lands.",
    cashNote: "A 20% deposit holds the dates. The balance is due on arrival.",
    policy: "Cancellation",
    policyBody: "Cancel more than 7 days ahead for a full refund. Between 7 and 3 days, 50%. Inside 3 days, no refund.",
    agree: "I have read and agree to the cancellation policy",
    needCard: "Complete the card details and agree to the policy.",
    needAgree: "Agree to the cancellation policy to continue.",
    code: "Booking reference",
    doneTitle: "See you on",
    book: "Book",
    again: "Book again",
    nightsW: (n) => n + (n === 1 ? " night" : " nights"),
    guestsW: (n) => n + (n === 1 ? " guest" : " guests"),
    rooms: "5 bedrooms · 6 king beds",
    whole: "Let whole",
    sumTitle: "The whole villa",
    clean: "Cleaning fee",
    cleanFree: "Free",
    cleanInfo: "Included in the nightly rate",
    tax: "Taxes & service",
    taxInc: "Included",
    services: "Extras",
    checkin: "Check in from 14:00",
    addr: "My Khe 1, Son Tra, Da Nang",
    pickDates: "Select dates",
    monthLabel: "Aug 2026",
    myKhe: "My Khe · Da Nang",
    afterSix: "After 18:00",
    priceUnit: "15,000,000₫ × ",
  },
  ko: {
    steps: ["날짜", "정보", "결제", "확인"],
    secure: "안전한 결제",
    back: "뒤로",
    next: "계속",
    toPay: "결제로 이동",
    pay: "확인 및 결제",
    exit: "홈으로",
    dTitle: "숙박 날짜 선택",
    dLede: "침실 5개 빌라 전체 대여, 1박 15,000,000₫. 체크인 14:00부터, 체크아웃 12:00까지.",
    pickEnd: "체크아웃 날짜를 선택해 계속 진행하세요.",
    adults: ["성인", "13세 이상"],
    kids: ["어린이", "2 – 12세"],
    infants: ["유아", "2세 미만"],
    gTitle: "게스트 정보",
    last: "성",
    first: "이름",
    email: "이메일",
    phone: "전화번호 / Zalo",
    nat: "국적",
    natOpts: ["베트남", "한국", "호주", "영국"],
    arrive: "예상 체크인 시간",
    req: "특별 요청사항",
    reqHint: "공항 픽업, 추가 침대, 유아용 침대, 식단 제한 등…",
    addons: "추가 서비스",
    fill: "이름, 이메일, 전화번호를 입력해 계속 진행하세요.",
    payTitle: "결제",
    mCard: "신용/체크카드",
    mBank: "계좌이체 (VietQR)",
    mCash: "현장 결제",
    cardNo: "카드 번호",
    cardName: "카드 소유자명",
    exp: "유효기간",
    cvc: "CVC",
    bankNote: "VietQR 코드는 확인 단계에서 표시됩니다. 입금이 확인될 때까지 60분간 날짜가 보류됩니다.",
    cashNote: "날짜 확보를 위해 20% 보증금이 필요합니다. 잔액은 현장에서 결제합니다.",
    policy: "취소 정책",
    policyBody: "7일 전 취소 시 100% 환불. 7일~3일 전 취소 시 50% 환불. 3일 이내 취소 시 환불 불가.",
    agree: "취소 정책을 읽고 동의합니다",
    needCard: "카드 정보를 모두 입력하고 취소 정책에 동의해주세요.",
    needAgree: "계속하려면 취소 정책에 동의해주세요.",
    code: "예약 번호",
    doneTitle: "만나뵙는 날",
    book: "예약하기",
    again: "다시 예약하기",
    nightsW: (n) => n + "박",
    guestsW: (n) => n + "명",
    rooms: "침실 5개 · 킹베드 6개",
    whole: "전체 대여",
    sumTitle: "빌라 전체",
    clean: "청소비",
    cleanFree: "무료",
    cleanInfo: "숙박 요금에 포함되어 있습니다",
    tax: "세금 및 서비스료",
    taxInc: "포함됨",
    services: "추가 서비스",
    checkin: "체크인 14:00부터",
    addr: "미케1, 선짜, 다낭",
    pickDates: "날짜 선택",
    monthLabel: "2026년 8월",
    myKhe: "미케 · 다낭",
    afterSix: "18:00 이후",
    priceUnit: "15,000,000₫ × ",
  },
  zh: {
    steps: ["日期", "信息", "付款", "确认"],
    secure: "安全支付",
    back: "返回",
    next: "继续",
    toPay: "前往付款",
    pay: "确认并付款",
    exit: "返回首页",
    dTitle: "选择入住日期",
    dLede: "整栋五卧别墅，每晚15,000,000₫。14:00起入住，12:00前退房。",
    pickEnd: "请选择退房日期以继续。",
    adults: ["成人", "13岁及以上"],
    kids: ["儿童", "2 – 12岁"],
    infants: ["婴儿", "2岁以下"],
    gTitle: "客人信息",
    last: "姓",
    first: "名",
    email: "邮箱",
    phone: "电话 / Zalo",
    nat: "国籍",
    natOpts: ["越南", "韩国", "澳大利亚", "英国"],
    arrive: "预计入住时间",
    req: "特殊需求",
    reqHint: "机场接送、加床、婴儿床、饮食需求等…",
    addons: "附加服务",
    fill: "请填写姓名、邮箱和电话以继续。",
    payTitle: "付款",
    mCard: "信用卡/借记卡",
    mBank: "银行转账（VietQR）",
    mCash: "到店付款",
    cardNo: "卡号",
    cardName: "持卡人姓名",
    exp: "有效期",
    cvc: "安全码",
    bankNote: "VietQR码将在确认步骤显示。我们将为您保留房源60分钟，直至收到转账。",
    cashNote: "需支付20%定金以保留日期，余款到店支付。",
    policy: "取消政策",
    policyBody: "提前7天以上取消全额退款。7天至3天内取消退款50%。3天内取消不予退款。",
    agree: "我已阅读并同意取消政策",
    needCard: "请完整填写卡片信息并同意取消政策。",
    needAgree: "请同意取消政策以继续。",
    code: "预订编号",
    doneTitle: "期待与您相见",
    book: "预订",
    again: "再次预订",
    nightsW: (n) => n + "晚",
    guestsW: (n) => n + "位客人",
    rooms: "5间卧室 · 6张特大床",
    whole: "整栋出租",
    sumTitle: "整栋别墅",
    clean: "清洁费",
    cleanFree: "免费",
    cleanInfo: "已包含在房价中",
    tax: "税费及服务费",
    taxInc: "已包含",
    services: "附加服务",
    checkin: "14:00起入住",
    addr: "美溪1，山茶，岘港",
    pickDates: "选择日期",
    monthLabel: "2026年8月",
    myKhe: "美溪 · 岘港",
    afterSix: "18:00之后",
    priceUnit: "15,000,000₫ × ",
  },
};

const dateLabel = (range, b) => {
  if (range.start == null) return b.pickDates;
  const m = b.monthLabel;
  return range.end == null ? range.start + " " + m : range.start + " – " + range.end + " " + m;
};

function Summary({ b, lang, nights, guests, extras, total }) {
  const rows = [{ label: b.priceUnit + b.nightsW(nights), value: money(RATE * nights) }];
  extras.forEach((x) => rows.push({ label: (x[lang] || x.vi).split(" — ")[0], value: money(x.total) }));
  rows.push({ label: b.clean, value: b.cleanFree, info: b.cleanInfo });
  rows.push({ label: b.tax, value: b.taxInc });
  return (
    <Card elevation="flat" className="sv-r-sticky" style={{ position: "sticky", top: 24 }}>
      <Figure src={SV_ASSETS + "photo-pool-hammocks.png"} shape="full" ratio="16/9" alt="" />
      <div style={{ padding: "var(--space-5)" }}>
        <Overline>{b.myKhe}</Overline>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--size-heading-md)", margin: "8px 0 10px" }}>{b.sumTitle}</h3>
        <Rating value={5} count={52} />
        <Divider style={{ margin: "18px 0" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--font-sans)", fontSize: "var(--size-body-sm)", color: "var(--text-secondary)" }}>
          <span style={{ display: "flex", gap: 10 }}>
            <Icon name="calendar" size={16} />
            {b.dateText} · {b.nightsW(nights)}
          </span>
          <span style={{ display: "flex", gap: 10 }}>
            <Icon name="users" size={16} />
            {b.guestsW(guests)}
          </span>
          <span style={{ display: "flex", gap: 10 }}>
            <Icon name="bed-double" size={16} />
            {b.rooms}
          </span>
          <span style={{ display: "flex", gap: 10 }}>
            <Icon name="house" size={16} />
            {b.whole}
          </span>
        </div>
        <Divider style={{ margin: "18px 0" }} />
        <PriceSummary total={money(total)} rows={rows} />
      </div>
    </Card>
  );
}

export function BookingPageContent({ onExit }) {
  const { lang } = useLang();
  const b0 = B[lang] || B.vi;
  const [step, setStep] = useState(0);
  const [range, setRange] = useState({ start: 12, end: 16 });
  const [g, setG] = useState({ adults: 4, kids: 2, infants: 0 });
  const [form, setForm] = useState({ last: "", first: "", email: "", phone: "", nat: "", arrive: "", notes: "" });
  const [picked] = useState({});
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ no: "", name: "", exp: "", cvc: "" });
  const [agree, setAgree] = useState(true);
  const [warn, setWarn] = useState(null);
  const nights = range.end && range.start ? Math.max(1, range.end - range.start) : 1;
  const guests = g.adults + g.kids + g.infants;
  const extras = ADDONS.filter((x) => picked[x.id]).map((x) => ({ ...x, total: x.price }));
  const total = RATE * nights + extras.reduce((s, x) => s + x.total, 0);
  const b = { ...b0, dateText: dateLabel(range, b0) };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const go = (n) => {
    setWarn(null);
    setStep(n);
    window.scrollTo(0, 0);
  };
  const ref = "SDV-2608-" + String(4000 + nights * 37 + guests * 11).slice(0, 4);
  const sum = <Summary b={b} lang={lang} nights={nights} guests={guests} extras={extras} total={total} />;
  const twoCol = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "var(--space-9)", alignItems: "start" };
  const h2 = { fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "var(--size-display-sm)", margin: 0 };
  const note = { fontFamily: "var(--font-sans)", fontSize: "var(--size-body-sm)", color: "var(--text-brand)" };

  const next0 = () => {
    if (range.start == null || range.end == null) return setWarn(b.pickEnd);
    go(1);
  };
  const next1 = () => {
    if (!form.last.trim() || !form.first.trim() || !form.email.trim() || !form.phone.trim()) return setWarn(b.fill);
    go(2);
  };
  const next2 = () => {
    if (!agree) return setWarn(b.needAgree);
    if (method === "card" && (card.no.replace(/\s/g, "").length < 12 || !card.exp.trim() || !card.cvc.trim())) return setWarn(b.needCard);
    sendLead({
      type: "booking",
      ref,
      lang,
      checkIn: range.start,
      checkOut: range.end,
      nights,
      adults: g.adults,
      kids: g.kids,
      infants: g.infants,
      guests,
      lastName: form.last,
      firstName: form.first,
      email: form.email,
      phone: form.phone,
      nationality: form.nat,
      arrive: form.arrive,
      notes: form.notes,
      paymentMethod: method,
      total,
    });
    go(3);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <header style={{ minHeight: "var(--header-height)", background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px var(--gutter)", width: "100%", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <button onClick={onExit} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }} aria-label={b.exit}>
            <Icon name="arrow-left" size={18} />
            <Logo variant="lockup" height={30} lang={lang} />
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <Stepper steps={b.steps} current={step} />
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-sans)", fontSize: "var(--size-caption)", color: "var(--text-muted)" }}>
              <Icon name="shield-check" size={15} />
              {b.secure}
            </span>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "48px var(--gutter) 96px" }}>
        {step === 0 && (
          <div className="sv-r-split" style={twoCol}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
              <div>
                <h2 style={h2}>{b.dTitle}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--size-body-sm)", marginTop: 8 }}>{b.dLede}</p>
              </div>
              <DateRangePicker year={2026} month={7} start={range.start} end={range.end} unavailable={[3, 4, 5, 22, 23]} onChange={setRange} lang={lang} style={{ maxWidth: 340 }} />
              <Card padded elevation="flat" style={{ maxWidth: 420 }}>
                <GuestStepper label={b.adults[0]} sublabel={b.adults[1]} value={g.adults} onChange={(v) => setG((s) => ({ ...s, adults: v }))} max={10} />
                <Divider />
                <GuestStepper label={b.kids[0]} sublabel={b.kids[1]} value={g.kids} onChange={(v) => setG((s) => ({ ...s, kids: v }))} max={6} />
                <Divider />
                <GuestStepper label={b.infants[0]} sublabel={b.infants[1]} value={g.infants} onChange={(v) => setG((s) => ({ ...s, infants: v }))} max={3} />
              </Card>
              {warn && <p style={note}>{warn}</p>}
              <Button variant="primary" size="lg" iconRight="arrow-right" style={{ alignSelf: "flex-start" }} onClick={next0}>
                {b.next}
              </Button>
            </div>
            {sum}
          </div>
        )}
        {step === 1 && (
          <div className="sv-r-split" style={twoCol}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              <h2 style={h2}>{b.gTitle}</h2>
              <Card padded elevation="flat">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-5)" }}>
                  <Field label={b.last} required>
                    <Input value={form.last} onChange={set("last")} />
                  </Field>
                  <Field label={b.first} required>
                    <Input value={form.first} onChange={set("first")} />
                  </Field>
                  <Field label={b.email} required>
                    <Input iconLeft="mail" value={form.email} onChange={set("email")} />
                  </Field>
                  <Field label={b.phone} required>
                    <Input iconLeft="phone" value={form.phone} onChange={set("phone")} />
                  </Field>
                  <Field label={b.nat}>
                    <Select value={form.nat || b.natOpts[0]} onChange={set("nat")} options={b.natOpts} />
                  </Field>
                  <Field label={b.arrive}>
                    <Select value={form.arrive || "14:00 – 16:00"} onChange={set("arrive")} options={["14:00 – 16:00", "16:00 – 18:00", b.afterSix]} />
                  </Field>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label={b.req} hint={b.reqHint}>
                      <Textarea rows={3} value={form.notes} onChange={set("notes")} />
                    </Field>
                  </div>
                </div>
              </Card>
              {warn && <p style={note}>{warn}</p>}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="secondary" size="lg" iconLeft="arrow-left" onClick={() => go(0)}>
                  {b.back}
                </Button>
                <Button variant="primary" size="lg" iconRight="arrow-right" onClick={next1}>
                  {b.toPay}
                </Button>
              </div>
            </div>
            {sum}
          </div>
        )}
        {step === 2 && (
          <div className="sv-r-split" style={twoCol}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              <h2 style={h2}>{b.payTitle}</h2>
              <Card padded elevation="flat">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Radio name="pm" label={b.mCard} checked={method === "card"} onChange={() => setMethod("card")} />
                  <Radio name="pm" label={b.mBank} checked={method === "bank"} onChange={() => setMethod("bank")} />
                  <Radio name="pm" label={b.mCash} checked={method === "cash"} onChange={() => setMethod("cash")} />
                </div>
                {method === "card" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label={b.cardNo}>
                        <Input iconLeft="credit-card" placeholder="4242 4242 4242 4242" value={card.no} onChange={(e) => setCard((c) => ({ ...c, no: e.target.value }))} />
                      </Field>
                    </div>
                    <Field label={b.cardName}>
                      <Input placeholder="NGUYEN VAN MINH" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                    </Field>
                    <Field label={b.exp}>
                      <Input placeholder="08/29" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} />
                    </Field>
                    <Field label={b.cvc}>
                      <Input placeholder="123" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} />
                    </Field>
                  </div>
                )}
                {method === "bank" && <p style={{ marginTop: 20, fontSize: "var(--size-body-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{b.bankNote}</p>}
                {method === "cash" && <p style={{ marginTop: 20, fontSize: "var(--size-body-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{b.cashNote}</p>}
              </Card>
              <Card padded elevation="flat">
                <Overline>{b.policy}</Overline>
                <p style={{ marginTop: 12, fontSize: "var(--size-body-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{b.policyBody}</p>
                <Checkbox style={{ marginTop: 16 }} label={b.agree} checked={agree} onChange={() => setAgree((v) => !v)} />
              </Card>
              {warn && <p style={note}>{warn}</p>}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="secondary" size="lg" iconLeft="arrow-left" onClick={() => go(1)}>
                  {b.back}
                </Button>
                <Button variant="primary" size="lg" iconRight="lock" onClick={next2}>
                  {b.pay} · {money(total)}
                </Button>
              </div>
            </div>
            {sum}
          </div>
        )}
        {step === 3 && (
          <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", paddingTop: 20 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--status-success-soft)", color: "var(--status-success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Icon name="check" size={30} />
            </div>
            <Overline>
              {b.code} {ref}
            </Overline>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "var(--size-display-md)", margin: "14px 0 0" }}>
              {b.doneTitle}{" "}
              {lang === "vi"
                ? range.start + " tháng 8"
                : lang === "ko"
                  ? "8월 " + range.start + "일"
                  : lang === "zh"
                    ? "8月" + range.start + "日"
                    : "August " + range.start}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--size-body-lg)", marginTop: 16 }}>
              {lang === "vi"
                ? "Chúng tôi đã gửi xác nhận tới " + form.email + ". Chủ nhà sẽ nhắn Zalo cho bạn trước ngày đến một tuần. Cần đổi gì, gọi " + SV_CONTACT.phone + "."
                : lang === "ko"
                  ? "확인 메일을 " + form.email + "(으)로 보내드렸습니다. 도착 일주일 전에 호스트가 Zalo로 연락드립니다. 변경 사항은 " + SV_CONTACT.phone + "로 연락주세요."
                  : lang === "zh"
                    ? "我们已将确认信息发送至 " + form.email + "。房东将在您到达前一周通过Zalo联系您。如需更改，请致电 " + SV_CONTACT.phone + "。"
                    : "We have sent the confirmation to " + form.email + ". The host will message you on Zalo a week before you arrive. To change anything, call " + SV_CONTACT.phone + "."}
            </p>
            <Figure src={SV_ASSETS + "photo-pool-dusk.png"} shape="soft" ratio="16/9" style={{ marginTop: 34 }} alt="" />
            <Card padded elevation="flat" style={{ marginTop: 24, textAlign: "left" }}>
              <AmenityListSummary b={b} nights={nights} guests={guests} />
              <Divider style={{ margin: "18px 0" }} />
              <PriceSummary
                total={money(total)}
                rows={[{ label: money(RATE) + " × " + b.nightsW(nights), value: money(RATE * nights) }].concat(
                  extras.map((x) => ({ label: (x[lang] || x.vi).split(" — ")[0], value: money(x.total) }))
                )}
              />
            </Card>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={onExit}>
                {b.exit}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(0);
                  window.scrollTo(0, 0);
                }}
              >
                {b.again}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AmenityListSummary({ b, nights, guests }) {
  return (
    <AmenityList
      variant="compact"
      columns={2}
      items={[
        { icon: "calendar", name: b.dateText + " · " + b.nightsW(nights) },
        { icon: "users", name: b.guestsW(guests) },
        { icon: "clock", name: b.checkin },
        { icon: "map-pin", name: b.addr },
      ]}
    />
  );
}
