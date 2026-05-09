import { json } from './_tikhub.js';

export async function onRequestPost(context) {
  const apiKey = context.env.SILICONFLOW_API_KEY;
  const model = context.env.SILICONFLOW_TRANSCRIBE_MODEL || 'FunAudioLLM/SenseVoiceSmall';

  if (!apiKey) {
    return json({ ok: false, message: '转写服务暂未配置完成。' }, 500);
  }

  const form = await context.request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return json({ ok: false, message: '请先选择音频或视频文件。' }, 400);
  }

  const upstreamForm = new FormData();
  upstreamForm.set('model', model);
  upstreamForm.set('file', file, file.name || 'media-file');

  const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: upstreamForm
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    return json(
      {
        ok: false,
        message: payload?.message || payload?.error?.message || '转写失败。',
        detail: payload?.code || payload?.status || null
      },
      response.status
    );
  }

  return json({
    ok: true,
    data: {
      title: file.name,
      text: payload.text || payload.data?.text || ''
    }
  });
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}
