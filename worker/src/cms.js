// Cổng đăng nhập /admin (Sveltia CMS) bằng email + mã 6 số.
//
// Luồng:
//   1. Sveltia mở cửa sổ GET /cms/auth (trang nhập email, nằm ngay trong Worker).
//   2. Nhân sự nhập email, Worker gửi mã 6 số qua Apps Script (MailApp).
//   3. Nhập đúng mã, Worker cấp mã phiên 64 ký tự hex, gửi về /admin bằng
//      postMessage theo giao thức Sveltia ("authorizing:github" rồi
//      "authorization:github:success:{token}").
//   4. Sveltia gọi GitHub qua cổng /gh/api/v3/* và /gh/api/graphql. Cổng đổi mã
//      phiên thành mã GitHub của công ty (CMS_GITHUB_TOKEN) rồi chuyển tiếp.
//      Nhân sự không cần tài khoản GitHub.
//
// Quyền truy cập do biến CMS_ALLOWED_EMAILS quyết định và được kiểm tra lại ở
// MỌI request cổng. Bỏ một email khỏi danh sách là phiên của người đó mất tác
// dụng ngay.
//
// Dữ liệu tạm (mã OTP, phiên, đếm giới hạn) nằm chung KV CALENDAR_KV, tách bằng
// tiền tố "otp:", "sess:", "rl:". Xem worker/README.md để cài secret.

const ADMIN_ORIGINS = [
  "https://sandunevilla.vn",
  "https://www.sandunevilla.vn",
  "https://sandune-villa.pages.dev",
  "http://localhost:3000",
];

const REPO_OWNER = "lehuongthu1011-beep";
const REPO_NAME = "sandune-villa";

const OTP_TTL_SECONDS = 600; // mã có hiệu lực 10 phút
const OTP_MAX_TRIES = 5; // sai quá 5 lần thì huỷ mã
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // phiên 30 ngày
const MAX_BODY_BYTES = 30 * 1024 * 1024; // ảnh upload qua CMS là base64, chừa chỗ rộng

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const encoder = new TextEncoder();

// ---------------------------------------------------------------- tiện ích

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Mã 6 số phân bố đều (loại bỏ phần dư để không lệch xác suất).
function randomCode() {
  const a = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / 1000000) * 1000000;
  let n;
  do {
    crypto.getRandomValues(a);
    n = a[0];
  } while (n >= limit);
  return String(n % 1000000).padStart(6, "0");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function normEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

// CMS_ALLOWED_EMAILS: mỗi dòng (hoặc cách nhau bằng dấu phẩy) là
//   email                   hoặc        email=Tên hiển thị
function parseStaff(env) {
  const staff = new Map();
  for (const part of String(env.CMS_ALLOWED_EMAILS || "").split(/[\n,;]+/)) {
    const [emailRaw, ...nameParts] = part.split("=");
    const email = normEmail(emailRaw);
    if (!email) continue;
    staff.set(email, nameParts.join("=").trim() || email.split("@")[0]);
  }
  return staff;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extraHeaders },
  });
}

async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// Đếm số lần trong một khoảng thời gian (KV không nguyên tử, đủ dùng để chặn
// dò mã hàng loạt).
async function bump(env, key, ttl) {
  const current = parseInt((await env.CALENDAR_KV.get(key)) || "0", 10) + 1;
  await env.CALENDAR_KV.put(key, String(current), { expirationTtl: Math.max(ttl, 60) });
  return current;
}

function clientIp(req) {
  return req.headers.get("cf-connecting-ip") || "unknown";
}

async function hashCode(env, email, code) {
  const salt = await sha256Hex("sandune-cms-otp:" + env.OTP_MAIL_SECRET);
  return sha256Hex(`${salt}:${email}:${code}`);
}

// ------------------------------------------------------- gửi mã qua Apps Script

async function sendMail(env, email, code, name) {
  try {
    const res = await fetch(env.OTP_MAIL_URL, {
      method: "POST",
      // text/plain để Apps Script nhận được JSON mà không cần preflight.
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "otp",
        secret: env.OTP_MAIL_SECRET,
        email,
        code,
        name,
        minutes: OTP_TTL_SECONDS / 60,
      }),
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* Apps Script trả HTML khi lỗi */
    }
    if (!res.ok || !data || data.ok !== true) {
      console.error("[cms] Apps Script không gửi được mã:", res.status, text.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[cms] Lỗi gọi Apps Script:", err.message);
    return false;
  }
}

// ------------------------------------------------------------ trang đăng nhập

const LOGIN_PAGE = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Đăng nhập quản trị · SanDune Villa</title>
<style nonce="__NONCE__">
  :root { color-scheme: light dark; --bg:#f6f1e9; --fg:#2b2620; --muted:#7a6f62; --card:#fffdf9; --line:#e2d8c8; --accent:#9a7240; --accent-fg:#fff; --err:#b3261e; }
  @media (prefers-color-scheme: dark) { :root { --bg:#1d1a16; --fg:#f1ebe1; --muted:#a79c8d; --card:#26221d; --line:#3a342c; --accent:#c79a5c; --accent-fg:#1d1a16; --err:#f2b8b5; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--fg); font:16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { width:100%; max-width:380px; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:28px 24px; }
  h1 { font-size:20px; margin:0 0 4px; }
  p.sub { margin:0 0 20px; color:var(--muted); font-size:14px; }
  label { display:block; font-size:14px; margin-bottom:6px; }
  input { width:100%; font:inherit; padding:11px 12px; border:1px solid var(--line); border-radius:8px; background:transparent; color:inherit; }
  input:focus { outline:2px solid var(--accent); outline-offset:1px; }
  input.code { letter-spacing:.4em; text-align:center; font-size:22px; }
  button { width:100%; margin-top:14px; font:inherit; font-weight:600; padding:11px 12px; border:0; border-radius:8px; background:var(--accent); color:var(--accent-fg); cursor:pointer; }
  button:disabled { opacity:.6; cursor:default; }
  button.link { background:none; color:var(--muted); font-weight:400; text-decoration:underline; margin-top:8px; padding:6px; }
  .msg { min-height:20px; margin:12px 0 0; font-size:14px; }
  .msg.err { color:var(--err); }
  .msg.ok { color:var(--muted); }
  [hidden] { display:none !important; }
</style>
</head>
<body>
<main>
  <h1>Quản trị SanDune Villa</h1>

  <form id="f-email" autocomplete="on">
    <p class="sub">Nhập email nhân sự. Mã đăng nhập gồm 6 số sẽ được gửi về email này.</p>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" inputmode="email" autocomplete="email" required autofocus>
    <button id="b-send" type="submit">Gửi mã đăng nhập</button>
  </form>

  <form id="f-code" hidden autocomplete="off">
    <p class="sub" id="code-sub"></p>
    <label for="code">Mã 6 số</label>
    <input id="code" class="code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required>
    <button id="b-verify" type="submit">Đăng nhập</button>
    <button id="b-resend" class="link" type="button">Gửi lại mã</button>
    <button id="b-back" class="link" type="button">Đổi email</button>
  </form>

  <p id="msg" class="msg" role="status"></p>
</main>

<script nonce="__NONCE__">
(function () {
  var ORIGINS = __ORIGINS__;
  var openerOrigin = null;

  // Giao thức bắt tay của Sveltia: cửa sổ này báo "authorizing:github", Sveltia
  // phản hồi đúng chuỗi đó. Origin của người phản hồi phải nằm trong danh sách
  // cho phép thì mới gửi mã phiên về.
  window.addEventListener("message", function (e) {
    if (e.source !== window.opener) return;
    if (ORIGINS.indexOf(e.origin) === -1) return;
    if (e.data === "authorizing:github") openerOrigin = e.origin;
  });
  if (window.opener) window.opener.postMessage("authorizing:github", "*");

  var $ = function (id) { return document.getElementById(id); };
  var msg = $("msg");
  var email = "";
  var resendTimer = null;

  function say(text, kind) { msg.textContent = text || ""; msg.className = "msg" + (kind ? " " + kind : ""); }

  function post(path, body) {
    return fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, data: d }; }); });
  }

  function startResendCooldown() {
    var left = 60;
    var btn = $("b-resend");
    btn.disabled = true;
    clearInterval(resendTimer);
    resendTimer = setInterval(function () {
      left -= 1;
      btn.textContent = left > 0 ? "Gửi lại mã (" + left + " giây)" : "Gửi lại mã";
      if (left <= 0) { btn.disabled = false; clearInterval(resendTimer); }
    }, 1000);
    btn.textContent = "Gửi lại mã (60 giây)";
  }

  function sendCode() {
    $("b-send").disabled = true;
    say("Đang gửi mã...", "ok");
    return post("/cms/auth/send", { email: email }).then(function (r) {
      $("b-send").disabled = false;
      if (r.status === 200 && r.data.ok) {
        $("f-email").hidden = true;
        $("f-code").hidden = false;
        $("code-sub").textContent = "Nếu " + email + " đã được cấp quyền, mã đã được gửi. Mã có hiệu lực 10 phút. Hãy xem cả thư rác.";
        $("code").value = "";
        $("code").focus();
        startResendCooldown();
        say("");
      } else {
        say(r.data.message || "Không gửi được mã. Hãy thử lại sau.", "err");
      }
    }).catch(function () { $("b-send").disabled = false; say("Mất kết nối. Hãy thử lại.", "err"); });
  }

  $("f-email").addEventListener("submit", function (e) {
    e.preventDefault();
    email = $("email").value.trim().toLowerCase();
    sendCode();
  });

  $("b-resend").addEventListener("click", function () { sendCode(); });

  $("b-back").addEventListener("click", function () {
    clearInterval(resendTimer);
    $("f-code").hidden = true;
    $("f-email").hidden = false;
    say("");
    $("email").focus();
  });

  function deliver(token, attempt) {
    if (!window.opener) {
      say("Không tìm thấy trang quản trị đã mở cửa sổ này. Hãy đóng cửa sổ và bấm Đăng nhập lại ở trang /admin.", "err");
      return;
    }
    if (!openerOrigin) {
      if (attempt < 10) {
        window.opener.postMessage("authorizing:github", "*");
        setTimeout(function () { deliver(token, attempt + 1); }, 300);
      } else {
        say("Trang quản trị không phản hồi. Hãy đóng cửa sổ và bấm Đăng nhập lại ở trang /admin.", "err");
      }
      return;
    }
    window.opener.postMessage("authorization:github:success:" + JSON.stringify({ token: token, provider: "github" }), openerOrigin);
    say("Đăng nhập thành công. Cửa sổ này sẽ tự đóng.", "ok");
    setTimeout(function () { window.close(); }, 600);
  }

  $("f-code").addEventListener("submit", function (e) {
    e.preventDefault();
    var code = $("code").value.replace(/\\s/g, "");
    if (!/^[0-9]{6}$/.test(code)) { say("Mã gồm đúng 6 chữ số.", "err"); return; }
    $("b-verify").disabled = true;
    say("Đang kiểm tra...", "ok");
    post("/cms/auth/verify", { email: email, code: code }).then(function (r) {
      $("b-verify").disabled = false;
      if (r.status === 200 && r.data.ok && r.data.token) { deliver(r.data.token, 0); }
      else { say(r.data.message || "Mã không đúng hoặc đã hết hạn.", "err"); }
    }).catch(function () { $("b-verify").disabled = false; say("Mất kết nối. Hãy thử lại.", "err"); });
  });
})();
</script>
</body>
</html>`;

function loginPage() {
  const nonce = randomHex(16);
  const html = LOGIN_PAGE.replaceAll("__NONCE__", nonce).replace("__ORIGINS__", JSON.stringify(ADMIN_ORIGINS));
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "content-security-policy":
        `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; ` +
        `base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
    },
  });
}

// ---------------------------------------------------------- gửi mã / xác nhận

async function handleSend(req, env) {
  if (!env.OTP_MAIL_URL || !env.OTP_MAIL_SECRET || !env.CMS_ALLOWED_EMAILS) {
    return json({ message: "Cổng đăng nhập chưa được cài đặt xong. Hãy báo cho quản trị viên." }, 503);
  }
  const body = await readJson(req);
  const email = normEmail(body && body.email);
  if (!email) return json({ message: "Email không hợp lệ." }, 400);

  const ipKey = "rl:send-ip:" + (await sha256Hex("ip:" + clientIp(req))).slice(0, 32);
  if ((await bump(env, ipKey, 600)) > 10) {
    return json({ message: "Gửi mã quá nhiều lần. Hãy thử lại sau 10 phút." }, 429);
  }

  const emailHash = await sha256Hex("email:" + email);
  const cooldownKey = "rl:send-email:" + emailHash.slice(0, 32);
  if (await env.CALENDAR_KV.get(cooldownKey)) {
    return json({ message: "Hãy chờ 1 phút rồi gửi lại mã." }, 429);
  }
  await env.CALENDAR_KV.put(cooldownKey, "1", { expirationTtl: 60 });

  // Email không có trong danh sách vẫn nhận phản hồi giống hệt, không ai dò
  // được ai là nhân sự.
  const staff = parseStaff(env);
  if (staff.has(email)) {
    const code = randomCode();
    const record = {
      hash: await hashCode(env, email, code),
      tries: 0,
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
    };
    await env.CALENDAR_KV.put("otp:" + emailHash.slice(0, 32), JSON.stringify(record), {
      expirationTtl: OTP_TTL_SECONDS,
    });
    if (!(await sendMail(env, email, code, staff.get(email)))) {
      return json({ message: "Không gửi được email lúc này. Hãy báo cho quản trị viên." }, 502);
    }
  }
  return json({ ok: true });
}

async function handleVerify(req, env) {
  if (!env.OTP_MAIL_SECRET || !env.CMS_ALLOWED_EMAILS) {
    return json({ message: "Cổng đăng nhập chưa được cài đặt xong." }, 503);
  }
  const body = await readJson(req);
  const email = normEmail(body && body.email);
  const code = String((body && body.code) || "").replace(/\s/g, "");
  if (!email || !/^\d{6}$/.test(code)) return json({ message: "Mã gồm đúng 6 chữ số." }, 400);

  const ipKey = "rl:verify-ip:" + (await sha256Hex("ip:" + clientIp(req))).slice(0, 32);
  if ((await bump(env, ipKey, 600)) > 30) {
    return json({ message: "Thử mã quá nhiều lần. Hãy thử lại sau 10 phút." }, 429);
  }

  const failure = json({ message: "Mã không đúng hoặc đã hết hạn." }, 400);
  const otpKey = "otp:" + (await sha256Hex("email:" + email)).slice(0, 32);
  const raw = await env.CALENDAR_KV.get(otpKey);
  if (!raw) return failure;

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    await env.CALENDAR_KV.delete(otpKey);
    return failure;
  }
  if (record.tries >= OTP_MAX_TRIES || Date.now() > record.expiresAt) {
    await env.CALENDAR_KV.delete(otpKey);
    return failure;
  }

  if (!timingSafeEqual(record.hash, await hashCode(env, email, code))) {
    record.tries += 1;
    if (record.tries >= OTP_MAX_TRIES) {
      await env.CALENDAR_KV.delete(otpKey);
    } else {
      const ttl = Math.max(60, Math.ceil((record.expiresAt - Date.now()) / 1000));
      await env.CALENDAR_KV.put(otpKey, JSON.stringify(record), { expirationTtl: ttl });
    }
    return failure;
  }

  await env.CALENDAR_KV.delete(otpKey); // mỗi mã chỉ dùng một lần
  if (!parseStaff(env).has(email)) return failure;

  const token = randomHex(32);
  await env.CALENDAR_KV.put(
    "sess:" + (await sha256Hex(token)),
    JSON.stringify({ email, createdAt: new Date().toISOString() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
  return json({ ok: true, token });
}

// ----------------------------------------------------------------- cổng GitHub

function gatewayCors(origin) {
  const headers = {
    vary: "Origin",
    "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, accept, x-github-api-version",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
  };
  if (ADMIN_ORIGINS.includes(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

async function getSession(req, env) {
  const match = (req.headers.get("authorization") || "").match(/^(?:token|bearer)\s+([0-9a-f]{64})$/i);
  if (!match) return null;
  const raw = await env.CALENDAR_KV.get("sess:" + (await sha256Hex(match[1].toLowerCase())));
  if (!raw) return null;
  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    return null;
  }
  const staff = parseStaff(env);
  if (!staff.has(session.email)) return null; // bị gỡ khỏi danh sách: mất quyền ngay
  return { email: session.email, name: staff.get(session.email) };
}

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Hồ sơ giả cho GET /user: Sveltia chỉ cần tên và ảnh đại diện để hiện góc phải.
async function fakeUser(session) {
  const login = session.email.split("@")[0].replace(/[^a-z0-9-]/gi, "-").slice(0, 39) || "nhan-su";
  const initial = (session.name || login).trim().charAt(0).toUpperCase() || "N";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#9a7240"/>' +
    `<text x="32" y="43" font-size="30" text-anchor="middle" fill="#fff" font-family="sans-serif">${escapeXml(initial)}</text></svg>`;
  return {
    id: parseInt((await sha256Hex(session.email)).slice(0, 8), 16),
    login,
    name: session.name,
    email: session.email,
    avatar_url: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
  };
}

// Thao tác không cho đi qua cổng, kể cả khi mã GitHub của công ty lỡ có quyền.
const REST_DENY =
  /\/(hooks|keys|collaborators|invitations|actions|forks|dispatches|rulesets|environments|transfer|pages|secrets|variables)(\/|$)|\/branches\/[^/]+\/protection/i;
// Ghi (POST/PUT/PATCH/DELETE) chỉ được ở các đường dẫn sửa nội dung.
const REST_WRITE_OK = /^\/repos\/[^/]+\/[^/]+\/(contents(\/|$)|git\/(blobs|trees|commits)(\/|$))/;
const BAD_MUTATION =
  /(Repository|Protection|Collaborator|DeployKey|Webhook|Secret|Environment|Ruleset|Organization|Team|Sponsor|Token|Invitation|Visibility|Ownership)/i;

function mutationNames(query) {
  const names = [];
  const re = /\b([A-Za-z][A-Za-z0-9_]*)\s*\(\s*input\s*:/g;
  let m;
  while ((m = re.exec(query))) names.push(m[1]);
  return names;
}

async function readLimitedText(req) {
  const declared = parseInt(req.headers.get("content-length") || "0", 10);
  if (declared > MAX_BODY_BYTES) return null;
  const text = await req.text();
  return text.length > MAX_BODY_BYTES ? null : text;
}

async function handleGateway(req, env, url, origin) {
  const cors = gatewayCors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  if (!env.CMS_GITHUB_TOKEN || !env.CMS_ALLOWED_EMAILS) {
    return json({ message: "Cổng đăng nhập chưa được cài đặt xong. Hãy báo cho quản trị viên." }, 503, cors);
  }

  const session = await getSession(req, env);
  if (!session) {
    return json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Hãy đăng nhập lại." }, 401, cors);
  }

  const apiBase = (env.GITHUB_API_BASE || "https://api.github.com").replace(/\/$/, "");
  const headers = new Headers({
    authorization: `Bearer ${env.CMS_GITHUB_TOKEN}`,
    "user-agent": "sandune-villa-cms-gateway/1.0",
    accept: req.headers.get("accept") || "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  });
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const suffix = ` · ${session.name}`;

  let target;
  let body;
  const path = url.pathname;

  if (/%2e|\.\.|%5c|\/\//i.test(path.replace("/gh/api/", "/"))) {
    return json({ message: "Đường dẫn không hợp lệ." }, 400, cors);
  }

  if (path === "/gh/api/graphql") {
    if (req.method !== "POST") return json({ message: "Chỉ chấp nhận POST." }, 405, cors);
    const text = await readLimitedText(req);
    if (text === null) return json({ message: "Dữ liệu gửi lên quá lớn." }, 413, cors);
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return json({ message: "Dữ liệu GraphQL không hợp lệ." }, 400, cors);
    }
    const query = String((payload && payload.query) || "");
    if (/\bmutation\b/i.test(query) && mutationNames(query).some((n) => BAD_MUTATION.test(n))) {
      console.error("[cms] Chặn mutation:", mutationNames(query).join(","), session.email);
      return json({ message: "Thao tác này không được phép qua trang quản trị." }, 403, cors);
    }
    // Ghi tên người sửa vào lịch sử commit.
    const message = payload && payload.variables && payload.variables.input && payload.variables.input.message;
    if (message && typeof message.headline === "string" && !message.headline.endsWith(suffix)) {
      message.headline += suffix;
    }
    target = `${apiBase}/graphql`;
    body = JSON.stringify(payload);
  } else if (path === "/gh/api/v3/user") {
    return json(await fakeUser(session), 200, cors);
  } else if (path.startsWith("/gh/api/v3/")) {
    const restPath = path.slice("/gh/api/v3".length);
    const segments = restPath.split("/");
    let owner = "";
    let repo = "";
    try {
      owner = decodeURIComponent(segments[2] || "");
      repo = decodeURIComponent(segments[3] || "");
    } catch {
      return json({ message: "Đường dẫn không hợp lệ." }, 400, cors);
    }
    const sameRepo =
      segments[1] === "repos" &&
      owner.toLowerCase() === REPO_OWNER.toLowerCase() &&
      repo.toLowerCase() === REPO_NAME.toLowerCase();
    if (!sameRepo || REST_DENY.test(restPath)) {
      console.error("[cms] Chặn đường dẫn:", req.method, restPath, session.email);
      return json({ message: "Trang quản trị chỉ được dùng cho nội dung của SanDune Villa." }, 403, cors);
    }
    const readOnly = req.method === "GET" || req.method === "HEAD";
    if (!readOnly && !REST_WRITE_OK.test(restPath)) {
      console.error("[cms] Chặn ghi:", req.method, restPath, session.email);
      return json({ message: "Thao tác này không được phép qua trang quản trị." }, 403, cors);
    }
    if (!readOnly) {
      const text = await readLimitedText(req);
      if (text === null) return json({ message: "Dữ liệu gửi lên quá lớn." }, 413, cors);
      body = text;
      if (/\/contents\//.test(restPath) && text) {
        try {
          const payload = JSON.parse(text);
          if (payload && typeof payload.message === "string" && !payload.message.endsWith(suffix)) {
            payload.message += suffix;
            body = JSON.stringify(payload);
          }
        } catch {
          /* giữ nguyên nếu không phải JSON */
        }
      }
    }
    target = `${apiBase}${restPath}${url.search}`;
  } else {
    return json({ message: "Không tìm thấy." }, 404, cors);
  }

  let res;
  try {
    res = await fetch(target, { method: req.method, headers, body });
  } catch (err) {
    console.error("[cms] Không gọi được GitHub:", err.message);
    return json({ message: "Không kết nối được GitHub lúc này. Hãy thử lại sau." }, 502, cors);
  }

  // Mã GitHub của công ty hết hạn: trả 503, không trả 401, để Sveltia không
  // bắt nhân sự đăng nhập lại liên tục trong khi lỗi nằm ở phía cổng.
  if (res.status === 401) {
    console.error("[cms] Mã GitHub của công ty bị từ chối (hết hạn hoặc bị thu hồi).");
    return json(
      { message: "Mã GitHub của công ty đã hết hạn. Hãy báo cho quản trị viên tạo mã mới (xem worker/README.md)." },
      503,
      cors
    );
  }

  const out = new Headers(cors);
  const type = res.headers.get("content-type");
  if (type) out.set("content-type", type);
  const etag = res.headers.get("etag");
  if (etag) out.set("etag", etag);
  const link = res.headers.get("link");
  if (link) out.set("link", link.replaceAll(apiBase, `${url.origin}/gh/api/v3`));
  return new Response(res.body, { status: res.status, headers: out });
}

// -------------------------------------------------------------------- điều phối

// Trả về Response nếu đường dẫn thuộc cổng CMS, ngược lại trả null để index.js
// xử lý tiếp các endpoint lịch đặt phòng.
export async function handleCms(req, env, url, origin) {
  const path = url.pathname;

  if (path === "/cms/auth" && req.method === "GET") return loginPage();
  if (path === "/cms/auth/send" && req.method === "POST") return handleSend(req, env);
  if (path === "/cms/auth/verify" && req.method === "POST") return handleVerify(req, env);
  if (path === "/gh/api/graphql" || path.startsWith("/gh/api/v3/")) return handleGateway(req, env, url, origin);

  return null;
}
