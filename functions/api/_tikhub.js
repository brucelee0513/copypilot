const ENDPOINTS = [
  { path: '/api/v1/douyin/web/fetch_one_video_by_share_url', param: 'share_url' },
  { path: '/api/v1/douyin/app/v3/fetch_one_video_by_share_url', param: 'share_url' },
  { path: '/api/v1/tiktok/app/v3/fetch_one_video_by_share_url', param: 'share_url' },
  { path: '/api/v1/xiaohongshu/web_v2/fetch_feed_notes_v3', param: 'short_url' }
];

export async function extractByUrl({ apiKey, baseUrl, url }) {
  const endpoints = rankEndpoints(url);
  const errors = [];

  for (const endpoint of endpoints) {
    try {
      const target = new URL(`${baseUrl}${endpoint.path}`);
      target.searchParams.set(endpoint.param, url);

      const response = await fetch(target.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      const payload = await safeJson(response);
      if (response.ok && isSuccessPayload(payload)) {
        return payload.data || payload;
      }
      errors.push(payload?.message || payload?.msg || `${response.status}`);
    } catch (error) {
      errors.push(error.message);
    }
  }

  throw new Error(errors[0] || '解析失败');
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function rankEndpoints(url) {
  const lower = url.toLowerCase();
  if (lower.includes('xiaohongshu') || lower.includes('xhslink')) {
    return [ENDPOINTS[3], ...ENDPOINTS.filter((item) => item !== ENDPOINTS[3])];
  }
  if (lower.includes('tiktok')) {
    return [ENDPOINTS[2], ...ENDPOINTS.filter((item) => item !== ENDPOINTS[2])];
  }
  return ENDPOINTS;
}

function isSuccessPayload(payload) {
  if (!payload) return false;
  if (payload.data) return true;
  if (payload.code === 200 || payload.status_code === 0 || payload.status === 'success') return true;
  return false;
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
