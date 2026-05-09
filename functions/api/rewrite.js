export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => null);
  const text = String(body?.text || '').trim();

  if (!text) {
    return json({ ok: false, message: '缺少文案内容。' }, 400);
  }

  const clean = text.replace(/\s+/g, ' ').trim();
  const hooks = [
    '先给用户一个明确收益点',
    '把场景说具体，让读者马上代入',
    '减少空话，多用动作和结果',
    '结尾加一个轻量互动问题'
  ];

  return json({
    ok: true,
    data: {
      title: 'AI 改写结果',
      text: `版本一：${clean}\n\n版本二：${clean}。如果你也遇到类似问题，可以先从一个小动作开始，今天就把它试起来。\n\n优化建议：\n${hooks.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
