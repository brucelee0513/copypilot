import { extractByUrl, json } from './_tikhub.js';
import { recordUsage, requireQuota } from './_quota.js';

/** 提取视频文案（纯TikHub版，无需SiliconFlow） */
export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const tikhubKey = env.TIKHUB_API_KEY;
  if (!tikhubKey) {
    return json({ error: '提取服务暂未配置完成' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { url: videoUrl } = body;
  if (!videoUrl) {
    return json({ error: '缺少链接' }, 400);
  }

  // 1. 用 TikHub 提取视频信息和文案
  const extractResult = await extractByUrl(tikhubKey, videoUrl);
  if (!extractResult || extractResult.error) {
    return json({ error: extractResult?.error || '提取失败' }, 502);
  }

  const { data } = extractResult;
  if (!data) {
    return json({ error: '未获取到数据' }, 502);
  }

  // 2. 尝试获取字幕
  let subtitles = [];
  if (data.subtitle && data.subtitle.length > 0) {
    subtitles = data.subtitle;
  } else if (data.subtitles && data.subtitles.length > 0) {
    subtitles = data.subtitles;
  }

  // 3. 如果有字幕，直接解析字幕
  if (subtitles.length > 0) {
    let subtitleText = '';
    for (const sub of subtitles) {
      if (sub.url) {
        try {
          const subResp = await fetch(sub.url);
          if (subResp.ok) {
            const subContent = await subResp.text();
            // 解析SRT/JSON字幕格式
            const lines = subContent.split('\n').filter(l => l.trim() && !l.match(/^\d+$/) && !l.includes('-->'));
            subtitleText += lines.join(' ') + '\n';
          }
        } catch { /* 跳过 */ }
      }
    }

    if (subtitleText.trim()) {
      // 记录用量
      await recordUsage(env, { type: 'transcribe-link', cost: 1 }).catch(() => {});
      return json({
        data: {
          title: data.title || '',
          publishedText: data.published_text || '',
          content: subtitleText.trim(),
          source: 'subtitle'
        }
      });
    }
  }

  // 4. 没有字幕，返回 TikHub 已提取的发布文案
  const title = data.title || '';
  const publishedText = data.published_text || '';

  if (!publishedText && !title) {
    return json({ error: '该视频暂无可提取的文案' }, 404);
  }

  // 记录用量
  await recordUsage(env, { type: 'transcribe-link', cost: 1 }).catch(() => {});

  return json({
    data: {
      title,
      publishedText,
      content: publishedText || title,
      source: 'tikhub_extract'
    }
  });
}
