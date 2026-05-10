import { authJson, getConfig, hashValue, makeId } from '../_auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return authJson({ ok: false, message: '数据库暂未配置。' }, 500);

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  if (!email) return authJson({ ok: false, message: '请输入正确的邮箱。' }, 400);

  const recent = await env.DB.prepare(
    `SELECT created_at FROM email_login_codes
     WHERE email = ? AND created_at > datetime('now', '-60 seconds')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email).first();
  if (recent) return authJson({ ok: false, message: '验证码发送太频繁，请 60 秒后再试。' }, 429);

  const config = getConfig(env);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await hashValue(`${email}:${code}`, config.sessionSecret);
  await env.DB.prepare(
    `INSERT INTO email_login_codes (id, email, code_hash, expires_at, ip_hash)
     VALUES (?, ?, ?, datetime('now', '+10 minutes'), ?)`
  ).bind(makeId('code'), email, codeHash, await getIpHash(request, config.sessionSecret)).run();

  const sent = await sendEmailCode({ email, code, config });
  return authJson({
    ok: true,
    message: sent ? '验证码已发送，请查看邮箱。' : '验证码已生成。当前未配置邮件服务，测试环境可直接使用 devCode。',
    devCode: sent ? undefined : code
  });
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function getIpHash(request, secret) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  return hashValue(ip, secret);
}

async function sendEmailCode({ email, code, config }) {
  if (!config.resendKey) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: email,
      subject: 'CopyPilot 登录验证码',
      text: `你的 CopyPilot 登录验证码是 ${code}，10 分钟内有效。`,
      html: `<p>你的 CopyPilot 登录验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>10 分钟内有效。</p>`
    })
  });
  return response.ok;
}
