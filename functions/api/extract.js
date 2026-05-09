import { extractByUrl, json } from './_tikhub.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.TIKHUB_API_KEY;
  const baseUrl = env.TIKHUB_BASE_URL || 'https://api.tikhub.io';

  if (!apiKey) {
    return json({ ok: false, message: '提取服务暂未配置完成。' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: '请求格式不正确。' }, 400);
  }

  const url = String(body.url || '').trim();
  if (!url) return json({ ok: false, message: '缺少作品链接。' }, 400);

  try {
    const data = await extractByUrl({ apiKey, baseUrl, url });
    return json({ ok: true, data });
  } catch (error) {
    return json({ ok: false, message: error.message || '解析失败' }, 502);
  }
}
