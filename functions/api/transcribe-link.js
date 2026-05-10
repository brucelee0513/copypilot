import { extractByUrl, json } from './_tikhub.js';
import { recordUsage, requireQuota } from './_auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const tikhubKey = env.TIKHUB_API_KEY;
  const tikhubBaseUrl = env.TIKHUB_BASE_URL || 'https://api.tikhub.io';
  const siliconFlowKey = env.SILICONFLOW_API_KEY;
  const model = env.SILICONFLOW_TRANSCRIBE_MODEL || 'FunAudioLLM/SenseVoiceSmall';

  if (!tikhubKey) return json({ ok: false, message: '提取服务暂未配置完成。' }, 500);
  if (!siliconFlowKey) return json({ ok: false, message: '转写服务暂未配置完成。' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: '请求格式不正确。' }, 400);
  }

  const url = String(body.url || '').trim();
  if (!url) return json({ ok: false, message: '缺少作品链接。' }, 400);

  const quota = await requireQuota(context, 'extract');
  if (!quota.ok) return json({ ok: false, message: quota.message, needLogin: quota.status === 401 }, quota.status);

  try {
    const sourceData = await extractByUrl({ apiKey: tikhubKey, baseUrl: tikhubBaseUrl, url });
    const videoUrl = getVideoLinks(sourceData)[0];

    if (!videoUrl) {
      return json({
        ok: false,
        message: '已解析作品信息，但没有拿到可转写的视频源。',
        data: sourceData
      }, 502);
    }

    const mediaResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        Referer: 'https://www.douyin.com/'
      }
    });

    if (!mediaResponse.ok) {
      return json({
        ok: false,
        message: '视频源下载失败，暂时无法转写视频本身文案。',
        status: mediaResponse.status,
        data: sourceData
      }, 502);
    }

    const mediaBlob = await mediaResponse.blob();
    const transcriptPayload = await transcribeBlob({
      apiKey: siliconFlowKey,
      model,
      blob: mediaBlob,
      filename: 'source-video.mp4'
    });
    const publishedText = getPublishedText(sourceData);

    const data = {
      ...sourceData,
      text: transcriptPayload.text || '',
      transcript: transcriptPayload.text || '',
      publishedText
    };
    await recordUsage(context, quota, {
      action: 'extract',
      sourceUrl: url,
      resultTitle: getPublishedText(sourceData) || sourceData?.title || null
    });
    const headers = quota.setCookie ? { 'Set-Cookie': quota.setCookie } : {};

    return json({
      ok: true,
      data
    }, 200, headers);
  } catch (error) {
    return json({ ok: false, message: error.message || '链接视频转写失败。' }, 502);
  }
}

async function transcribeBlob({ apiKey, model, blob, filename }) {
  const form = new FormData();
  form.set('model', model);
  form.set('file', new File([blob], filename, { type: blob.type || 'video/mp4' }));

  const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error?.message || '视频转写失败。');
  }

  return {
    text: payload.text || payload.data?.text || '',
    raw: payload
  };
}

function getVideoLinks(data) {
  const detail = data?.aweme_detail || data?.itemInfo?.itemStruct || data?.note || data || {};
  const video = detail.video || data?.video || {};
  const links = [];

  if (video.play_addr?.url_list?.length) links.push(...video.play_addr.url_list);
  if (video.download_addr?.url_list?.length) links.push(...video.download_addr.url_list);
  if (detail.video_url) links.push(detail.video_url);
  if (data?.video_url) links.push(data.video_url);
  return [...new Set(links)].filter(Boolean);
}

function getPublishedText(data) {
  return (
    data?.desc ||
    data?.caption ||
    data?.aweme_detail?.desc ||
    data?.itemInfo?.itemStruct?.desc ||
    data?.note?.desc ||
    ''
  );
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}
