<script setup>
import { computed, ref } from 'vue';
import {
  BadgeCheck,
  Captions,
  Check,
  Clipboard,
  Copy,
  FileAudio,
  FileText,
  FileVideo,
  Image,
  Link,
  Loader2,
  Sparkles,
  Upload,
  Wand2
} from 'lucide-vue-next';

const siteName = 'CopyPilot';
const currentPath = ref(window.location.pathname);
const url = ref('');
const fileMode = ref('video');
const textMode = ref('link');
const selectedFile = ref(null);
const loading = ref(false);
const error = ref('');
const notice = ref('');
const result = ref(null);

const pageMap = {
  '/video': {
    badge: '提取视频',
    title: '视频提取工具',
    subtitle: '输入作品链接，一键提取视频文件，适合保存素材、二创剪辑和内容归档。',
    type: 'video',
    theme: 'cyan'
  },
  '/text': {
    badge: '提取文案',
    title: '文案提取工具',
    subtitle: '支持链接提取文案，也支持本地音视频文件转写文案。',
    type: 'text',
    theme: 'indigo'
  },
  '/image-text': {
    badge: '提取图文',
    title: '图文提取工具',
    subtitle: '输入图文作品链接，提取图片素材、标题、正文和标签。',
    type: 'image',
    theme: 'pink'
  },
  '/article': {
    badge: '提取文章',
    title: '公众号文章提取工具',
    subtitle: '输入公众号文章或网页文章链接，提取文章标题、正文、原文图片和基础信息。',
    type: 'article',
    theme: 'green',
    seoTitle: '公众号文章提取工具 - 在线提取文章正文和图片'
  },
  '/wechat-article': {
    badge: '公众号文章提取',
    title: '公众号文章提取工具',
    subtitle: '粘贴公众号文章链接，提取文章标题、正文、原文图片和基础信息。',
    type: 'article',
    theme: 'green',
    seoTitle: '公众号文章提取工具 - 在线提取微信公众号文章'
  },
  '/xiaohongshu': {
    badge: '提取文案',
    title: '文案提取工具',
    subtitle: '支持链接提取文案，也支持本地音视频文件转写文案。',
    type: 'text',
    theme: 'indigo'
  },
  '/douyin': {
    badge: '提取文案',
    title: '文案提取工具',
    subtitle: '支持链接提取文案，也支持本地音视频文件转写文案。',
    type: 'text',
    theme: 'indigo'
  },
  '/extract-video': {
    badge: '提取视频',
    title: '视频提取工具',
    subtitle: '输入作品链接，一键提取视频文件，适合保存素材、二创剪辑和内容归档。',
    type: 'video',
    theme: 'cyan'
  },
  '/douyin-image': {
    badge: '提取图文',
    title: '图文提取工具',
    subtitle: '输入图文作品链接，提取图片素材、标题、正文和标签。',
    type: 'image',
    theme: 'pink'
  },
  '/xiaohongshu-image': {
    badge: '提取图文',
    title: '图文提取工具',
    subtitle: '输入图文作品链接，提取图片素材、标题、正文和标签。',
    type: 'image',
    theme: 'pink'
  },
  '/video-extract': {
    badge: '音视频文件',
    title: '音视频文件文案提取工具',
    subtitle: '上传本地视频或音频文件，提取可复制的文字稿。',
    type: 'media-file',
    theme: 'indigo'
  },
  '/audio-extract': {
    badge: '音视频文件',
    title: '音视频文件文案提取工具',
    subtitle: '上传本地视频或音频文件，提取可复制的文字稿。',
    type: 'media-file',
    theme: 'indigo'
  },
  '/media-extract': {
    badge: '音视频文件',
    title: '音视频文件文案提取工具',
    subtitle: '上传本地视频或音频文件，提取可复制的文字稿。适合课程、直播、播客、访谈和会议录音整理。',
    type: 'media-file',
    theme: 'indigo'
  },
  '/douyin-video-download': {
    badge: '抖音视频提取',
    title: '抖音视频提取工具',
    subtitle: '粘贴抖音作品链接，提取视频预览、下载链接、作品标题、发布文案和话题标签。',
    type: 'video',
    theme: 'cyan',
    seoTitle: '抖音视频提取工具 - 在线提取抖音视频和文案'
  },
  '/xiaohongshu-image-download': {
    badge: '小红书图文提取',
    title: '小红书图文图片提取工具',
    subtitle: '粘贴小红书笔记链接，提取图文笔记的图片素材、标题、正文和话题标签。',
    type: 'image',
    theme: 'pink',
    seoTitle: '小红书图文图片提取工具 - 在线提取笔记图片和文案'
  },
  '/tiktok-video-download': {
    badge: 'TikTok视频提取',
    title: 'TikTok 视频提取工具',
    subtitle: '粘贴 TikTok 分享链接，提取视频素材、标题、发布文案和标签，适合内容整理和二创剪辑。',
    type: 'video',
    theme: 'cyan',
    seoTitle: 'TikTok 视频提取工具 - 在线提取 TikTok 视频和文案'
  },
  '/video-to-text': {
    badge: '视频转文字',
    title: '视频转文字工具',
    subtitle: '上传本地视频文件，自动识别视频中的语音内容并整理成可复制文字稿。',
    type: 'media-file',
    theme: 'indigo',
    seoTitle: '视频转文字工具 - 在线提取视频中的语音文案'
  },
  '/audio-to-text': {
    badge: '音频转文字',
    title: '音频转文字工具',
    subtitle: '上传本地音频文件，自动识别语音内容，快速生成可复制的文字稿。',
    type: 'media-file',
    theme: 'indigo',
    seoTitle: '音频转文字工具 - 在线音频转文案'
  },
  '/privacy': {
    badge: '隐私政策',
    title: '隐私政策',
    subtitle: '了解 CopyPilot 如何处理你提交的链接、文件和基础访问数据。',
    type: 'legal',
    theme: 'blue'
  },
  '/terms': {
    badge: '服务条款',
    title: '服务条款',
    subtitle: '使用 CopyPilot 前，请了解基础使用规则、内容责任和服务限制。',
    type: 'legal',
    theme: 'blue'
  },
  '/copyright': {
    badge: '版权说明',
    title: '版权与内容说明',
    subtitle: 'CopyPilot 只提供内容整理能力，素材版权和平台规则需要由使用者自行确认。',
    type: 'legal',
    theme: 'blue'
  },
  '/contact': {
    badge: '联系我们',
    title: '联系我们',
    subtitle: '如果你遇到提取失败、版权问题或产品建议，可以通过邮件联系我们。',
    type: 'legal',
    theme: 'blue'
  }
};

const toolPage = computed(() => pageMap[currentPath.value]);
const isHome = computed(() => !toolPage.value);
const pageTheme = computed(() => toolPage.value?.theme || 'blue');
const isLegalPage = computed(() => toolPage.value?.type === 'legal');
const isFilePage = computed(() => toolPage.value?.type === 'media-file' || (toolPage.value?.type === 'text' && textMode.value === 'file'));
const fileAccept = computed(() => (fileMode.value === 'audio' ? 'audio/*' : 'video/*'));
const fileLabel = computed(() => (fileMode.value === 'audio' ? '选择音频文件' : '选择视频文件'));
const isLinkInputPage = computed(() => !isFilePage.value);

const featureCards = [
  { title: '50+平台支持', text: '覆盖抖音、小红书、TikTok、快手等主流内容平台。', icon: BadgeCheck },
  { title: '视频文案提取', text: '自动整理视频标题、正文、作者信息和素材链接。', icon: Captions },
  { title: '图片内容提取', text: '适合图文笔记、电商素材和内容拆解。', icon: Image },
  { title: 'AI智能识别', text: '自动识别链接类型，减少手动选择和复制整理。', icon: Sparkles }
];

const steps = [
  ['复制链接', '从抖音、小红书等平台复制作品分享链接。'],
  ['粘贴提取', '把链接粘贴到输入框，点击开始提取。'],
  ['复制结果', '获取文案、图片或视频素材链接，继续整理使用。']
];

const faqs = [
  ['CopyPilot 免费吗？', '基础提取功能面向用户免费开放，高频、批量和高级能力后续可做会员权益。'],
  ['支持哪些平台？', '首页主打 50+ 平台，第一阶段优先打通抖音、小红书、TikTok 等常用平台。'],
  ['为什么有些链接提取失败？', '私密作品、删除作品、平台限制或链接过期，都可能导致失败。'],
  ['提取内容可以商用吗？', '工具只负责内容整理，素材版权和平台规则需要由使用者自行确认。']
];

const seoToolLinks = [
  ['/douyin-video-download', '抖音视频提取'],
  ['/xiaohongshu-image-download', '小红书图文提取'],
  ['/wechat-article', '公众号文章提取'],
  ['/tiktok-video-download', 'TikTok 视频提取'],
  ['/video-to-text', '视频转文字'],
  ['/audio-to-text', '音频转文字']
];

const legalLinks = [
  ['/privacy', '隐私政策'],
  ['/terms', '服务条款'],
  ['/copyright', '版权说明'],
  ['/contact', '联系我们']
];

const legalContent = computed(() => {
  const map = {
    '/privacy': [
      ['我们会处理哪些信息', '你提交的作品链接、上传的音视频文件、提取结果和基础访问日志，用于完成提取、排查错误和保障服务稳定。'],
      ['文件如何处理', '上传文件仅用于生成文字稿。正式上线后会设置自动清理策略，避免长期保存非必要素材。'],
      ['第三方服务', '部分提取和识别能力需要调用第三方服务完成。我们不会把你的内容用于公开展示。']
    ],
    '/terms': [
      ['合理使用', '请只提取你有权处理的内容，不要用于侵犯版权、隐私或平台规则的用途。'],
      ['服务限制', '私密作品、删除作品、过期链接、平台限制或超大文件可能导致提取失败。'],
      ['账号与额度', '后续可能为免费用户设置每日额度，并为高频用户提供会员能力。']
    ],
    '/copyright': [
      ['内容归属', 'CopyPilot 不拥有你提取的原始素材版权，也不会授予你对第三方内容的商业使用权。'],
      ['版权投诉', '如果你认为某些使用行为侵犯了你的权益，可以联系我们处理。'],
      ['使用建议', '下载或复用素材前，请确认原作者授权、平台规则和当地法律要求。']
    ],
    '/contact': [
      ['产品反馈', '如果你希望支持更多平台、批量下载或更好的转写效果，可以把需求发给我们。'],
      ['问题反馈', '反馈时请附上页面路径、失败链接类型和大致时间，方便我们定位。'],
      ['联系邮箱', 'support@copypilot.app']
    ]
  };
  return map[currentPath.value] || [];
});

const resultTitle = computed(() => {
  const detail = primaryDetail.value;
  const explicitTitle =
    result.value?.title ||
    detail?.title ||
    detail?.msg_title ||
    detail?.appmsg_title ||
    detail?.article_title ||
    result.value?.note?.title ||
    result.value?.aweme_detail?.desc ||
    result.value?.itemInfo?.itemStruct?.desc ||
    result.value?.aweme_detail?.share_info?.share_title ||
    result.value?.itemInfo?.itemStruct?.share_info?.share_title ||
    '';

  return cleanTitle(explicitTitle || publishedText.value);
});

const resultHeading = computed(() => {
  if (!result.value) return '提取结果';
  if (toolPage.value?.type === 'text') return '文案提取结果';
  if (toolPage.value?.type === 'video') return '视频提取结果';
  if (toolPage.value?.type === 'image') return '图文提取结果';
  if (toolPage.value?.type === 'article') return '文章提取结果';
  return `${toolPage.value?.badge || '内容'}提取结果`;
});

const resultText = computed(() => {
  const data = result.value;
  const detail = primaryDetail.value;
  if (!data) return '';
  return (
    data.transcript ||
    data.text ||
    readArticleText(detail) ||
    stripHtml(detail?.content_html || detail?.html || detail?.article_content || detail?.digest) ||
    detail?.desc ||
    detail?.displayTitle ||
    data.desc ||
    data.caption ||
    data.aweme_detail?.desc ||
    data.itemInfo?.itemStruct?.desc ||
    data.note?.desc ||
    ''
  );
});

const publishedText = computed(() => {
  const data = result.value;
  const detail = primaryDetail.value;
  if (!data) return '';
  return (
    data.publishedText ||
    detail?.desc ||
    data.desc ||
    data.caption ||
    data.aweme_detail?.desc ||
    data.itemInfo?.itemStruct?.desc ||
    data.note?.desc ||
    ''
  );
});

const tags = computed(() => {
  const detailTags = (primaryDetail.value?.tagList || [])
    .map((tag) => tag.name ? `#${cleanTopicName(tag.name)}` : '')
    .filter(Boolean);
  const text = `${publishedText.value} ${resultText.value}`.trim();
  const textTags = text ? [...text.matchAll(/#[^\s#，,。；;]+/g)].map((match) => `#${cleanTopicName(match[0])}`) : [];
  return [...new Set([...detailTags, ...textTags])];
});

function cleanTitle(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text
    .split(/[#\n\r]/)[0]
    .replace(/^[\s"“”'‘’]+|[\s"“”'‘’]+$/g, '')
    .replace(/[，,。；;！!？?]$/, '')
    .slice(0, 80);
}

const videoLinks = computed(() => {
  const data = result.value;
  if (!data) return [];
  const detail = primaryDetail.value || data.aweme_detail || data.itemInfo?.itemStruct || data.note || data;
  const video = detail.video || data.video || {};
  const links = [];

  if (video.play_addr?.url_list?.length) links.push(...video.play_addr.url_list);
  if (video.download_addr?.url_list?.length) links.push(...video.download_addr.url_list);
  if (detail.video_url) links.push(detail.video_url);
  if (data.video_url) links.push(data.video_url);
  return [...new Set(links)].slice(0, 6);
});

const previewVideoUrl = computed(() => {
  if (!videoLinks.value.length) return '';
  return `/api/video-proxy?url=${encodeURIComponent(videoLinks.value[0])}`;
});

const imageLinks = computed(() => {
  const data = result.value;
  if (!data) return [];
  const detail = primaryDetail.value || data.aweme_detail || data.itemInfo?.itemStruct || data.note || data;
  const images =
    detail.imageList ||
    detail.images ||
    detail.content?.article?.images ||
    detail.image_post_info?.images ||
    data.images ||
    [];
  const links = [];

  if (detail.cover?.url_list?.length) links.push(detail.cover.url_list[0]);
  if (detail.cover) links.push(detail.cover);
  if (detail.cover_url) links.push(detail.cover_url);
  if (detail.msg_cdn_url) links.push(detail.msg_cdn_url);
  for (const image of images) {
    const bestImage = pickImageUrl(image);
    if (bestImage) links.push(bestImage);
  }
  links.push(...extractImageUrls(articleHtml.value));
  return [...new Set(links.map(normalizeMediaUrl).filter(Boolean))].slice(0, 8);
});

const primaryDetail = computed(() => findPrimaryDetail(result.value));
const articleHtml = computed(() => {
  const detail = primaryDetail.value || {};
  return detail.content_html || detail.html || detail.article_content || result.value?.html || '';
});

const hasResultContent = computed(() => result.value || videoLinks.value.length || imageLinks.value.length);
const shouldShowVideoResult = computed(() => toolPage.value?.type === 'video' && videoLinks.value.length);
const shouldShowImageResult = computed(() => ['image', 'article'].includes(toolPage.value?.type) && imageLinks.value.length);
const copyBlockTitle = computed(() => {
  if (toolPage.value?.type === 'text') return textMode.value === 'file' ? '视频/音频识别文案' : '视频识别文案';
  if (toolPage.value?.type === 'image') return '图文正文';
  if (toolPage.value?.type === 'article') return '文章正文';
  return '作品文案';
});

function findPrimaryDetail(data) {
  if (!data) return null;
  return (
    data.noteCard ||
    data.note ||
    data.article ||
    data.mp_article ||
    data.aweme_detail ||
    data.itemInfo?.itemStruct ||
    data.data?.items?.[0]?.noteCard ||
    data.items?.[0]?.noteCard ||
    data.data?.article ||
    data.data?.mp_article ||
    data.data?.noteCard ||
    data.data?.note ||
    data.data ||
    data
  );
}

function normalizeMediaUrl(link) {
  const value = String(link || '').trim();
  if (!value) return '';
  if (value.startsWith('http://')) return `https://${value.slice(7)}`;
  return value;
}

function cleanTopicName(value) {
  return String(value || '')
    .replace(/^#/, '')
    .replace(/\[话题\]$/g, '')
    .trim();
}

function pickImageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (image.urlDefault) return image.urlDefault;
  if (image.src) return image.src;
  if (image.data_src) return image.data_src;
  if (image.dataSrc) return image.dataSrc;
  const defaultInfo = image.infoList?.find((item) => item.imageScene === 'WB_DFT');
  if (defaultInfo?.url) return defaultInfo.url;
  if (image.url) return image.url;
  if (image.url_list?.length) return image.url_list[0];
  if (image.display_image?.url_list?.length) return image.display_image.url_list[0];
  if (image.urlPre) return image.urlPre;
  return image.infoList?.[0]?.url || '';
}

function stripHtml(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readArticleText(detail) {
  const content = detail?.content;
  if (!content) return '';
  if (typeof content === 'string') return stripHtml(content);

  const article = content.article || {};
  const sectionText = Array.isArray(article.sections)
    ? article.sections
        .map((section) => [section.title, section.text].filter(Boolean).join('\n'))
        .filter(Boolean)
        .join('\n\n')
    : '';
  const rawText = Array.isArray(content.raw_content)
    ? content.raw_content.map(readTextLike).filter(Boolean).join('\n\n')
    : '';

  return (
    readTextLike(article.full_text) ||
    readTextLike(article.summary) ||
    sectionText ||
    rawText ||
    readTextLike(content.text) ||
    readTextLike(content.summary) ||
    ''
  );
}

function readTextLike(value) {
  if (!value) return '';
  if (typeof value === 'string') return stripHtml(value);
  if (Array.isArray(value)) return value.map(readTextLike).filter(Boolean).join('\n');
  if (typeof value === 'object') return stripHtml(value.text || value.content || value.value || value.title || '');
  return String(value);
}

function extractImageUrls(html) {
  const text = String(html || '');
  const urls = [];
  for (const match of text.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi)) {
    urls.push(match[1]);
  }
  return urls;
}

function navigate(path) {
  window.history.pushState({}, '', path);
  currentPath.value = path;
  if (path === '/audio-extract') fileMode.value = 'audio';
  if (path === '/audio-to-text') fileMode.value = 'audio';
  if (path === '/video-extract' || path === '/media-extract') fileMode.value = 'video';
  if (path === '/video-to-text') fileMode.value = 'video';
  if (path === '/text') textMode.value = 'link';
  resetResult();
  updateMeta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onpopstate = () => {
  currentPath.value = window.location.pathname;
  updateMeta();
};

function updateMeta() {
  const page = pageMap[currentPath.value];
  const title = page?.seoTitle || page?.title || '支持50+平台 视频和文案提取工具';
  const description = page?.subtitle || '一键提取视频文案、视频转音频MP3、视频提取、图片提取，支持抖音、小红书等50+平台。';
  document.title = `${title} | ${siteName}`;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', description);
}

updateMeta();

async function extract() {
  error.value = '';
  notice.value = '';
  result.value = null;

  const cleanUrl = extractUrl(url.value);
  if (!cleanUrl) {
    error.value = '请先粘贴作品链接。';
    return;
  }

  loading.value = true;
  try {
    url.value = cleanUrl;
    const endpoint = toolPage.value?.type === 'text' && textMode.value === 'link' ? '/api/transcribe-link' : '/api/extract';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, type: toolPage.value?.type || 'auto' })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.message || '提取失败');
    result.value = payload.data;
    notice.value = endpoint === '/api/transcribe-link'
      ? '提取完成，已识别视频本身文案，并整理标题和标签。'
      : '提取完成，已整理视频、标题、文案和标签。';
  } catch (err) {
    error.value = err.message === 'Failed to fetch'
      ? '接口请求失败或超时，请稍后重试；如果是小红书图文，请优先使用手机 App 复制的完整分享链接。'
      : err.message || '提取失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

async function transcribeFile() {
  error.value = '';
  notice.value = '';
  result.value = null;

  if (!selectedFile.value) {
    error.value = '请先选择音频或视频文件。';
    return;
  }

  loading.value = true;
  try {
    const form = new FormData();
    form.set('file', selectedFile.value);
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: form
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.message || '转写失败');
    result.value = {
      title: payload.data.title,
      text: payload.data.text
    };
    notice.value = '转写完成，已提取音视频中的文案。';
  } catch (err) {
    error.value = err.message || '转写失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

function onFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null;
  resetResult();
}

function extractUrl(value) {
  const text = String(value || '').trim();
  const match = text.match(/https?:\/\/[^\s，。]+/i);
  return match ? match[0] : text.startsWith('http') ? text : '';
}

async function paste() {
  error.value = '';
  try {
    url.value = await navigator.clipboard.readText();
  } catch {
    error.value = '无法读取剪贴板，请手动粘贴。';
  }
}

function clearInput() {
  url.value = '';
  resetResult();
}

async function copyText(value) {
  const text = typeof value === 'string' ? value : resultText.value;
  if (!text) return;
  await navigator.clipboard.writeText(text);
  notice.value = '文案已复制。';
}

function resetResult() {
  error.value = '';
  notice.value = '';
  result.value = null;
}
</script>

<template>
  <div class="site" :class="`theme-${pageTheme}`">
    <header class="site-header">
      <a class="logo" href="/" @click.prevent="navigate('/')">
        <span>CP</span>
        <strong>{{ siteName }}</strong>
      </a>
      <nav class="desktop-nav" aria-label="主导航">
        <a href="/" @click.prevent="navigate('/')">首页</a>
        <a href="/video" @click.prevent="navigate('/video')">提取视频</a>
        <a href="/text" @click.prevent="navigate('/text')">提取文案</a>
        <a href="/image-text" @click.prevent="navigate('/image-text')">提取图文</a>
        <a href="/article" @click.prevent="navigate('/article')">提取文章</a>
      </nav>
      <button class="login-button">登录</button>
    </header>

    <main>
      <section v-if="isLegalPage" class="legal-hero">
        <p class="eyebrow">{{ toolPage.badge }}</p>
        <h1>{{ toolPage.title }}</h1>
        <p class="subtitle">{{ toolPage.subtitle }}</p>
        <div class="legal-list">
          <article v-for="([title, text]) in legalContent" :key="title">
            <h2>{{ title }}</h2>
            <p>{{ text }}</p>
          </article>
        </div>
      </section>

      <section v-else class="hero">
        <p class="eyebrow">
          <component
            :is="
              toolPage?.type === 'image'
                ? Image
                : toolPage?.type === 'text'
                  ? Captions
                  : toolPage?.type === 'media-file'
                    ? FileAudio
                    : FileVideo
            "
            :size="18"
          />
          {{ toolPage?.badge || '免费在线视频文案提取' }}
        </p>
        <h1>{{ toolPage?.title || '支持50+平台 视频和文案提取工具' }}</h1>
        <p class="subtitle">
          {{
            toolPage?.subtitle ||
            '一键提取视频文案、视频转音频MP3、视频提取，图片提取。支持抖音、小红书等50+平台，AI智能识别，批量下载，免费使用。'
          }}
        </p>

        <div v-if="toolPage?.type === 'text'" class="mode-switch">
          <button :class="{ active: textMode === 'link' }" @click="textMode = 'link'">
            <Link :size="17" /> 链接提取文案
          </button>
          <button :class="{ active: textMode === 'file' }" @click="textMode = 'file'">
            <FileAudio :size="17" /> 本地音视频提取文案
          </button>
        </div>

        <section v-if="isLinkInputPage" class="extract-box" aria-label="链接提取">
          <input
            v-model="url"
            :placeholder="
              toolPage?.type === 'video'
                ? '粘贴作品链接，提取视频文件'
                : toolPage?.type === 'image'
                  ? '粘贴图文作品链接，提取图片、标题、文案和Tag'
                  : toolPage?.type === 'article'
                    ? '粘贴公众号文章或网页文章链接'
                    : '粘贴作品链接，提取文案、标题和Tag'
            "
          />
          <div class="button-row">
            <button class="primary-button" :disabled="loading" @click="extract">
              <Loader2 v-if="loading" class="spin" :size="18" />
              <Link v-else :size="18" />
              {{ loading ? '提取中...' : '开始提取' }}
            </button>
            <button class="secondary-button" @click="paste"><Clipboard :size="18" /> 粘贴</button>
            <button class="secondary-button" @click="clearInput">清空</button>
          </div>
          <p v-if="error" class="alert error">{{ error }}</p>
          <p v-if="notice" class="alert success">{{ notice }}</p>
        </section>

        <section v-else class="upload-extract-box" aria-label="文件上传提取">
          <div class="file-type-switch" aria-label="文件类型">
            <button :class="{ active: fileMode === 'video' }" @click="fileMode = 'video'">
              <FileVideo :size="17" /> 视频文件
            </button>
            <button :class="{ active: fileMode === 'audio' }" @click="fileMode = 'audio'">
              <FileAudio :size="17" /> 音频文件
            </button>
          </div>
          <label class="upload-drop">
            <input :accept="fileAccept" type="file" @change="onFileChange" />
            <span class="upload-icon">
              <Upload :size="30" />
            </span>
            <strong>{{ selectedFile?.name || fileLabel }}</strong>
            <small>
              {{ fileMode === 'audio' ? '支持 MP3、M4A、WAV 等音频文件' : '支持 MP4、MOV、M4V 等视频文件' }}
            </small>
          </label>
          <div class="button-row">
            <button class="primary-button" :disabled="loading || !selectedFile" @click="transcribeFile">
              <Loader2 v-if="loading" class="spin" :size="18" />
              <Upload v-else :size="18" />
              {{ loading ? '转写中...' : '上传并提取文案' }}
            </button>
          </div>
          <p class="alert info">
            {{ toolPage?.type === 'text'
              ? '上传本地视频或音频，自动识别里面的语音内容并整理成文字。'
              : '上传本地视频或音频，自动提取可复制的文字稿。' }}
          </p>
        </section>

        <div v-if="isHome" class="home-type-tags">
          <button @click="navigate('/video')"><FileVideo :size="17" /> 提取视频</button>
          <button @click="navigate('/text')"><Captions :size="17" /> 提取文案</button>
          <button @click="navigate('/image-text')"><Image :size="17" /> 提取图文</button>
          <button @click="navigate('/article')"><FileText :size="17" /> 提取文章</button>
        </div>
      </section>

      <section v-if="hasResultContent" class="result-section">
        <div class="result-card">
          <div class="section-title">
            <div>
              <p class="eyebrow">结果</p>
              <h2>{{ resultHeading }}</h2>
            </div>
            <button class="icon-button" title="复制文案" @click="copyText"><Copy :size="18" /></button>
          </div>

          <div class="result-layout">
            <article class="result-block">
              <span>作品标题</span>
              <p>{{ resultTitle || '未识别到独立标题' }}</p>
            </article>

            <article class="result-block">
              <span>{{ copyBlockTitle }}</span>
              <p v-if="resultText" class="result-text">{{ resultText }}</p>
              <p v-else>未识别到文案</p>
            </article>

            <article v-if="toolPage?.type === 'text' && textMode === 'link' && publishedText" class="result-block">
              <span>平台发布文案</span>
              <p class="result-text">{{ publishedText }}</p>
            </article>

            <article class="result-block">
              <span>Tag / 话题标签</span>
              <div v-if="tags.length" class="tag-list">
                <button v-for="tag in tags" :key="tag" @click="copyText(tag)">{{ tag }}</button>
              </div>
              <p v-else>未识别到标签</p>
            </article>

            <article v-if="shouldShowVideoResult" class="result-block">
              <span>视频提取 / 去水印</span>
              <div v-if="videoLinks.length" class="video-result">
                <video :src="previewVideoUrl" controls playsinline preload="metadata"></video>
                <div class="video-actions">
                  <a :href="previewVideoUrl" download="video.mp4">下载视频</a>
                  <button @click="copyText(videoLinks[0])">复制视频链接</button>
                </div>
                <div v-if="videoLinks.length > 1" class="media-links">
                  <a v-for="(link, index) in videoLinks.slice(1)" :key="link" :href="link" download target="_blank" rel="noreferrer">
                    备用源 {{ index + 2 }}
                  </a>
                </div>
              </div>
              <p v-else>未返回视频链接</p>
            </article>

            <article v-if="shouldShowImageResult" class="result-block">
              <span>图片素材</span>
              <div class="image-grid">
                <div v-for="(link, index) in imageLinks" :key="link" class="image-card">
                  <a :href="link" target="_blank" rel="noreferrer">
                    <img :src="link" :alt="`图片素材 ${index + 1}`" loading="lazy" referrerpolicy="no-referrer" />
                  </a>
                  <div class="image-actions">
                    <a :href="link" target="_blank" rel="noreferrer">打开</a>
                    <a :href="`/api/image-proxy?url=${encodeURIComponent(link)}&index=${index + 1}`">下载原图</a>
                    <button @click="copyText(link)">复制链接</button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-if="!isLegalPage" id="features" class="section">
        <div class="section-title center">
          <p class="eyebrow"><Sparkles :size="18" /> 强大功能</p>
          <h2>不只是复制链接，而是把内容整理成可用素材</h2>
        </div>
        <div class="feature-grid">
          <article v-for="card in featureCards" :key="card.title">
            <component :is="card.icon" :size="30" />
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
          </article>
        </div>
      </section>

      <section v-if="!isLegalPage" id="steps" class="section steps-section">
        <div class="section-title center">
          <p class="eyebrow"><Check :size="18" /> 使用步骤</p>
          <h2>三步完成视频和文案提取</h2>
        </div>
        <div class="steps-grid">
          <article v-for="([title, text], index) in steps" :key="title">
            <span>{{ index + 1 }}</span>
            <h3>{{ title }}</h3>
            <p>{{ text }}</p>
          </article>
        </div>
      </section>

      <section v-if="!isLegalPage" id="faq" class="section">
        <div class="section-title center">
          <p class="eyebrow"><Wand2 :size="18" /> 常见问题答疑</p>
          <h2>你可能想知道的问题</h2>
        </div>
        <div class="faq-list">
          <article v-for="[question, answer] in faqs" :key="question">
            <h3>{{ question }}</h3>
            <p>{{ answer }}</p>
          </article>
        </div>
      </section>

      <section v-if="!isLegalPage" class="section seo-section">
        <div class="section-title center">
          <p class="eyebrow"><Sparkles :size="18" /> 热门工具</p>
          <h2>按常用场景快速提取内容</h2>
        </div>
        <div class="seo-link-grid">
          <a v-for="[path, label] in seoToolLinks" :key="path" :href="path" @click.prevent="navigate(path)">
            {{ label }}
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>{{ siteName }}</strong>
        <p>支持50+平台的视频和文案提取工具。</p>
      </div>
      <div class="footer-links">
        <nav>
          <strong>核心功能</strong>
          <a href="/" @click.prevent="navigate('/')">首页</a>
          <a href="/video" @click.prevent="navigate('/video')">提取视频</a>
          <a href="/text" @click.prevent="navigate('/text')">提取文案</a>
          <a href="/image-text" @click.prevent="navigate('/image-text')">提取图文</a>
          <a href="/article" @click.prevent="navigate('/article')">提取文章</a>
        </nav>
        <nav>
          <strong>热门工具</strong>
          <a v-for="[path, label] in seoToolLinks" :key="path" :href="path" @click.prevent="navigate(path)">
            {{ label }}
          </a>
        </nav>
        <nav>
          <strong>基础信息</strong>
          <a v-for="[path, label] in legalLinks" :key="path" :href="path" @click.prevent="navigate(path)">
            {{ label }}
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>

