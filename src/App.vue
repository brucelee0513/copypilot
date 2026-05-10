<script setup>
import { computed, onMounted, ref } from 'vue';
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
const lang = ref(localStorage.getItem('copypilot-lang') || 'zh');
const url = ref('');
const fileMode = ref('video');
const textMode = ref('link');
const articleView = ref('text');
const selectedFile = ref(null);
const loading = ref(false);
const error = ref('');
const notice = ref('');
const result = ref(null);
const authOpen = ref(false);
const authLoading = ref(false);
const authEmail = ref('');
const authCode = ref('');
const authMessage = ref('');
const currentUser = ref(null);
const usage = ref(null);
const records = ref([]);
const devCode = ref('');

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
  '/kuaishou-video-download': {
    badge: '快手视频提取',
    title: '快手视频提取工具',
    subtitle: '粘贴快手作品链接，提取视频素材、标题、发布文案和话题标签。',
    type: 'video',
    theme: 'cyan',
    seoTitle: '快手视频提取工具 - 在线提取快手视频和文案'
  },
  '/bilibili-video-download': {
    badge: 'B站视频提取',
    title: 'B站视频提取工具',
    subtitle: '粘贴 Bilibili 视频链接，整理视频素材、标题、简介和基础信息。',
    type: 'video',
    theme: 'cyan',
    seoTitle: 'B站视频提取工具 - 在线提取 Bilibili 视频和文案'
  },
  '/youtube-video-download': {
    badge: 'YouTube视频提取',
    title: 'YouTube 视频提取工具',
    subtitle: '粘贴 YouTube 视频链接，提取视频素材、标题、简介和标签信息。',
    type: 'video',
    theme: 'cyan',
    seoTitle: 'YouTube 视频提取工具 - 在线提取 YouTube 视频信息'
  },
  '/weibo-video-download': {
    badge: '微博视频提取',
    title: '微博视频提取工具',
    subtitle: '粘贴微博视频链接，提取视频素材、正文和话题标签。',
    type: 'video',
    theme: 'cyan',
    seoTitle: '微博视频提取工具 - 在线提取微博视频和文案'
  },
  '/instagram-video-download': {
    badge: 'Instagram视频提取',
    title: 'Instagram 视频提取工具',
    subtitle: '粘贴 Instagram Reels 或帖子链接，整理视频素材、说明文字和标签。',
    type: 'video',
    theme: 'cyan',
    seoTitle: 'Instagram 视频提取工具 - 在线提取 Instagram Reels'
  },
  '/instagram-image-download': {
    badge: 'Instagram图文提取',
    title: 'Instagram 图文图片提取工具',
    subtitle: '粘贴 Instagram 帖子链接，提取图片素材、说明文字和标签。',
    type: 'image',
    theme: 'pink',
    seoTitle: 'Instagram 图文图片提取工具 - 在线提取 Instagram 图片'
  },
  '/lemon8-image-download': {
    badge: 'Lemon8图文提取',
    title: 'Lemon8 图文图片提取工具',
    subtitle: '粘贴 Lemon8 图文链接，提取图片素材、标题、正文和标签。',
    type: 'image',
    theme: 'pink',
    seoTitle: 'Lemon8 图文图片提取工具 - 在线提取 Lemon8 图片和文案'
  },
  '/weibo-image-download': {
    badge: '微博图文提取',
    title: '微博图文图片提取工具',
    subtitle: '粘贴微博图文链接，提取图片素材、正文和话题标签。',
    type: 'image',
    theme: 'pink',
    seoTitle: '微博图文图片提取工具 - 在线提取微博图片和文案'
  },
  '/zhihu-article': {
    badge: '知乎文章提取',
    title: '知乎文章提取工具',
    subtitle: '粘贴知乎文章或回答链接，提取标题、正文、图片和基础信息。',
    type: 'article',
    theme: 'green',
    seoTitle: '知乎文章提取工具 - 在线提取知乎正文和图片'
  },
  '/web-article': {
    badge: '网页文章提取',
    title: '网页文章提取工具',
    subtitle: '粘贴网页文章链接，提取文章标题、正文、图片和基础信息。',
    type: 'article',
    theme: 'green',
    seoTitle: '网页文章提取工具 - 在线提取网页正文和图片'
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
  '/local-video-to-text': {
    badge: '本地视频转文字',
    title: '本地视频提取文案工具',
    subtitle: '上传本地视频文件，识别视频语音并整理成可复制文字稿。',
    type: 'media-file',
    theme: 'indigo',
    seoTitle: '本地视频提取文案工具 - 视频语音转文字'
  },
  '/local-audio-to-text': {
    badge: '本地音频转文字',
    title: '本地音频提取文案工具',
    subtitle: '上传本地音频文件，识别音频语音并整理成可复制文字稿。',
    type: 'media-file',
    theme: 'indigo',
    seoTitle: '本地音频提取文案工具 - 音频语音转文字'
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

const enPageMap = {
  '/video': { badge: 'Video extractor', title: 'Video Download Tool', subtitle: 'Paste a post link to extract video files for saving, editing, and content archiving.' },
  '/text': { badge: 'Text extractor', title: 'Caption & Transcript Tool', subtitle: 'Extract post captions from links, or upload local audio/video files for speech-to-text.' },
  '/image-text': { badge: 'Image post extractor', title: 'Image & Caption Extractor', subtitle: 'Extract images, titles, captions, and tags from image posts.' },
  '/article': { badge: 'Article extractor', title: 'Article Extraction Tool', subtitle: 'Extract article titles, body text, original images, and basic metadata from article links.' },
  '/wechat-article': { badge: 'WeChat article extractor', title: 'WeChat Article Extractor', subtitle: 'Paste a WeChat article link to extract title, body text, original images, and metadata.' },
  '/douyin-video-download': { badge: 'Douyin video download', title: 'Douyin Video Downloader', subtitle: 'Extract Douyin video previews, download links, titles, captions, and hashtags.' },
  '/tiktok-video-download': { badge: 'TikTok video download', title: 'TikTok Video Downloader', subtitle: 'Extract TikTok videos, captions, post text, and tags for content workflows.' },
  '/kuaishou-video-download': { badge: 'Kuaishou video download', title: 'Kuaishou Video Downloader', subtitle: 'Extract Kuaishou videos, titles, captions, and hashtags from shared links.' },
  '/bilibili-video-download': { badge: 'Bilibili video download', title: 'Bilibili Video Downloader', subtitle: 'Extract Bilibili video assets, titles, descriptions, and basic metadata.' },
  '/youtube-video-download': { badge: 'YouTube video download', title: 'YouTube Video Downloader', subtitle: 'Extract YouTube video assets, titles, descriptions, and tags.' },
  '/weibo-video-download': { badge: 'Weibo video download', title: 'Weibo Video Downloader', subtitle: 'Extract Weibo videos, post text, and hashtags.' },
  '/instagram-video-download': { badge: 'Instagram video download', title: 'Instagram Video Downloader', subtitle: 'Extract Instagram Reels or post videos, captions, and tags.' },
  '/xiaohongshu-image-download': { badge: 'Xiaohongshu image extractor', title: 'Xiaohongshu Image Extractor', subtitle: 'Extract images, titles, captions, and hashtags from Xiaohongshu notes.' },
  '/instagram-image-download': { badge: 'Instagram image extractor', title: 'Instagram Image Extractor', subtitle: 'Extract Instagram post images, captions, and tags.' },
  '/lemon8-image-download': { badge: 'Lemon8 image extractor', title: 'Lemon8 Image Extractor', subtitle: 'Extract Lemon8 post images, titles, captions, and tags.' },
  '/weibo-image-download': { badge: 'Weibo image extractor', title: 'Weibo Image Extractor', subtitle: 'Extract Weibo post images, text, and hashtags.' },
  '/zhihu-article': { badge: 'Zhihu article extractor', title: 'Zhihu Article Extractor', subtitle: 'Extract Zhihu article titles, body text, images, and metadata.' },
  '/web-article': { badge: 'Web article extractor', title: 'Web Article Extractor', subtitle: 'Extract article titles, body text, images, and metadata from web pages.' },
  '/video-to-text': { badge: 'Video to text', title: 'Video to Text Tool', subtitle: 'Upload a local video file and convert spoken content into copyable text.' },
  '/audio-to-text': { badge: 'Audio to text', title: 'Audio to Text Tool', subtitle: 'Upload a local audio file and convert speech into copyable text.' },
  '/local-video-to-text': { badge: 'Local video to text', title: 'Local Video Transcript Tool', subtitle: 'Upload local videos and extract speech as editable text.' },
  '/local-audio-to-text': { badge: 'Local audio to text', title: 'Local Audio Transcript Tool', subtitle: 'Upload local audio and extract speech as editable text.' }
};

const uiText = computed(() => {
  const zh = {
    nav: ['首页', '提取视频', '提取文案', '提取图文', '提取文章'],
    login: '登录',
    heroBadge: '免费在线视频文案提取',
    heroTitle: '支持50+平台 视频和文案提取工具',
    heroSubtitle: '一键提取视频文案、视频转音频MP3、视频提取，图片提取。支持抖音、小红书等50+平台，AI智能识别，批量下载，免费使用。',
    linkText: '链接提取文案',
    localText: '本地音视频提取文案',
    start: '开始提取',
    loading: '提取中...',
    paste: '粘贴',
    clear: '清空',
    placeholders: {
      video: '粘贴作品链接，提取视频文件',
      image: '粘贴图文作品链接，提取图片、标题、文案和Tag',
      article: '粘贴公众号文章或网页文章链接',
      text: '粘贴作品链接，提取文案、标题和Tag'
    },
    featureEyebrow: '强大功能',
    featureTitle: '不只是复制链接，而是把内容整理成可用素材',
    stepsEyebrow: '使用步骤',
    stepsTitle: '三步完成视频和文案提取',
    faqEyebrow: '常见问题答疑',
    faqTitle: '你可能想知道的问题',
    seoEyebrow: '热门工具',
    seoTitle: '按平台和场景快速提取内容',
    footerDesc: '支持50+平台的视频、图文、文章和文案提取工具。',
    core: '核心功能',
    hot: '热门工具',
    info: '基础信息'
  };
  const en = {
    nav: ['Home', 'Video', 'Text', 'Images', 'Articles'],
    login: 'Sign in',
    heroBadge: 'Free online content extractor',
    heroTitle: 'Extract videos, captions, images, and articles from 50+ platforms',
    heroSubtitle: 'Paste a link to extract video captions, MP3/audio, downloadable videos, images, and post metadata. Supports Douyin, Xiaohongshu, TikTok, and more.',
    linkText: 'Extract from link',
    localText: 'Upload audio/video',
    start: 'Extract',
    loading: 'Extracting...',
    paste: 'Paste',
    clear: 'Clear',
    placeholders: {
      video: 'Paste a post link to extract video files',
      image: 'Paste an image post link to extract images, title, caption, and tags',
      article: 'Paste a WeChat article or web article link',
      text: 'Paste a post link to extract caption, title, and tags'
    },
    featureEyebrow: 'Features',
    featureTitle: 'Turn links into reusable content assets',
    stepsEyebrow: 'How it works',
    stepsTitle: 'Extract content in three steps',
    faqEyebrow: 'FAQ',
    faqTitle: 'Common questions',
    seoEyebrow: 'Popular tools',
    seoTitle: 'Find tools by platform and workflow',
    footerDesc: 'A video, image, article, and caption extraction tool for 50+ platforms.',
    core: 'Core',
    hot: 'Popular tools',
    info: 'Info'
  };
  return lang.value === 'en' ? en : zh;
});

const toolPage = computed(() => {
  const page = pageMap[currentPath.value];
  if (!page || lang.value !== 'en') return page;
  return { ...page, ...enPageMap[currentPath.value] };
});
const isHome = computed(() => !toolPage.value);
const pageTheme = computed(() => toolPage.value?.theme || 'blue');
const isLegalPage = computed(() => toolPage.value?.type === 'legal');
const isFilePage = computed(() => toolPage.value?.type === 'media-file' || (toolPage.value?.type === 'text' && textMode.value === 'file'));
const fileAccept = computed(() => (fileMode.value === 'audio' ? 'audio/*' : 'video/*'));
const fileLabel = computed(() => (fileMode.value === 'audio' ? '选择音频文件' : '选择视频文件'));
const isLinkInputPage = computed(() => !isFilePage.value);
const authButtonText = computed(() => currentUser.value ? currentUser.value.email.split('@')[0] : uiText.value.login);

const featureCards = computed(() => lang.value === 'en'
  ? [
      { title: '50+ platforms', text: 'Supports Douyin, Xiaohongshu, TikTok, Kuaishou, and more content platforms.', icon: BadgeCheck },
      { title: 'Caption extraction', text: 'Collect titles, captions, author details, and media links automatically.', icon: Captions },
      { title: 'Image extraction', text: 'Useful for image posts, ecommerce assets, and content breakdowns.', icon: Image },
      { title: 'Smart routing', text: 'Detects link types and routes them to the right extraction workflow.', icon: Sparkles }
    ]
  : [
      { title: '50+平台支持', text: '覆盖抖音、小红书、TikTok、快手等主流内容平台。', icon: BadgeCheck },
      { title: '视频文案提取', text: '自动整理视频标题、正文、作者信息和素材链接。', icon: Captions },
      { title: '图片内容提取', text: '适合图文笔记、电商素材和内容拆解。', icon: Image },
      { title: 'AI智能识别', text: '自动识别链接类型，减少手动选择和复制整理。', icon: Sparkles }
    ]);

const steps = computed(() => lang.value === 'en'
  ? [
      ['Copy a link', 'Copy a shared post or article link from a supported platform.'],
      ['Paste and extract', 'Paste the link into CopyPilot and start extraction.'],
      ['Use the result', 'Copy captions, download images, preview videos, or reuse article layouts.']
    ]
  : [
      ['复制链接', '从抖音、小红书等平台复制作品分享链接。'],
      ['粘贴提取', '把链接粘贴到输入框，点击开始提取。'],
      ['复制结果', '获取文案、图片或视频素材链接，继续整理使用。']
    ]);

const faqs = computed(() => lang.value === 'en'
  ? [
      ['Is CopyPilot free?', 'Core extraction features can be offered for free, while high-volume, batch, and advanced AI workflows can become paid plans later.'],
      ['Which platforms are supported?', 'The site targets 50+ platforms and currently prioritizes common video, image, and article workflows.'],
      ['Why do some links fail?', 'Private posts, deleted content, expired links, platform restrictions, or missing permissions can cause failures.'],
      ['Can I use extracted content commercially?', 'CopyPilot organizes content. Copyright, licensing, and platform compliance remain the user’s responsibility.']
    ]
  : [
      ['CopyPilot 免费吗？', '基础提取功能面向用户免费开放，高频、批量和高级能力后续可做会员权益。'],
      ['支持哪些平台？', '首页主打 50+ 平台，优先覆盖抖音、小红书、TikTok、快手、B站、YouTube、Instagram、微博、公众号等常用场景。'],
      ['为什么有些链接提取失败？', '私密作品、删除作品、平台限制、链接过期或接口暂不支持，都可能导致失败。'],
      ['提取内容可以商用吗？', '工具只负责内容整理，素材版权和平台规则需要由使用者自行确认。']
    ]);

const seoToolGroups = computed(() => lang.value === 'en'
  ? [
      { title: 'Video platforms', links: [
        ['/douyin-video-download', 'Douyin video downloader'],
        ['/tiktok-video-download', 'TikTok video downloader'],
        ['/kuaishou-video-download', 'Kuaishou video downloader'],
        ['/bilibili-video-download', 'Bilibili video downloader'],
        ['/youtube-video-download', 'YouTube video downloader'],
        ['/weibo-video-download', 'Weibo video downloader'],
        ['/instagram-video-download', 'Instagram video downloader']
      ] },
      { title: 'Image platforms', links: [
        ['/xiaohongshu-image-download', 'Xiaohongshu image extractor'],
        ['/instagram-image-download', 'Instagram image extractor'],
        ['/lemon8-image-download', 'Lemon8 image extractor'],
        ['/weibo-image-download', 'Weibo image extractor']
      ] },
      { title: 'Article platforms', links: [
        ['/wechat-article', 'WeChat article extractor'],
        ['/zhihu-article', 'Zhihu article extractor'],
        ['/web-article', 'Web article extractor']
      ] },
      { title: 'Speech to text', links: [
        ['/video-to-text', 'Video to text'],
        ['/audio-to-text', 'Audio to text'],
        ['/local-video-to-text', 'Local video transcript'],
        ['/local-audio-to-text', 'Local audio transcript']
      ] }
    ]
  : [
      { title: '视频平台', links: [
        ['/douyin-video-download', '抖音视频提取'],
        ['/tiktok-video-download', 'TikTok 视频提取'],
        ['/kuaishou-video-download', '快手视频提取'],
        ['/bilibili-video-download', 'B站视频提取'],
        ['/youtube-video-download', 'YouTube 视频提取'],
        ['/weibo-video-download', '微博视频提取'],
        ['/instagram-video-download', 'Instagram 视频提取']
      ] },
      { title: '图文平台', links: [
        ['/xiaohongshu-image-download', '小红书图文提取'],
        ['/instagram-image-download', 'Instagram 图文提取'],
        ['/lemon8-image-download', 'Lemon8 图文提取'],
        ['/weibo-image-download', '微博图文提取']
      ] },
      { title: '文章平台', links: [
        ['/wechat-article', '公众号文章提取'],
        ['/zhihu-article', '知乎文章提取'],
        ['/web-article', '网页文章提取']
      ] },
      { title: '转文字工具', links: [
        ['/video-to-text', '视频转文字'],
        ['/audio-to-text', '音频转文字'],
        ['/local-video-to-text', '本地视频提取文案'],
        ['/local-audio-to-text', '本地音频提取文案']
      ] }
    ]);

const seoToolLinks = computed(() => seoToolGroups.value.flatMap((group) => group.links));

const legalLinks = computed(() => lang.value === 'en'
  ? [
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
      ['/copyright', 'Copyright'],
      ['/contact', 'Contact']
    ]
  : [
      ['/privacy', '隐私政策'],
      ['/terms', '服务条款'],
      ['/copyright', '版权说明'],
      ['/contact', '联系我们']
    ]);

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

  if (toolPage.value?.type === 'article') {
    return (
      readArticleText(detail) ||
      stripHtml(detail?.content_html || detail?.html || detail?.article_content || detail?.digest) ||
      stripHtml(data.full_text || data.article_content || data.content_html || data.html || data.text || '') ||
      ''
    );
  }

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
  links.push(...findImageUrlsDeep(detail.content));
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

const articleBlocks = computed(() => {
  if (toolPage.value?.type !== 'article' || !result.value) return [];

  const htmlBlocks = parseArticleHtmlBlocks(articleHtml.value);
  if (htmlBlocks.length) return htmlBlocks;

  const paragraphs = splitArticleParagraphs(resultText.value).map((text) => ({ type: 'text', text }));
  const images = imageLinks.value.map((src, index) => ({ type: 'image', src, index }));
  if (!paragraphs.length) return images;
  if (!images.length) return paragraphs;

  const blocks = [];
  const interval = Math.max(1, Math.ceil(paragraphs.length / (images.length + 1)));
  let imageIndex = 0;

  paragraphs.forEach((paragraph, index) => {
    blocks.push(paragraph);
    if ((index + 1) % interval === 0 && imageIndex < images.length) {
      blocks.push(images[imageIndex]);
      imageIndex += 1;
    }
  });

  while (imageIndex < images.length) {
    blocks.push(images[imageIndex]);
    imageIndex += 1;
  }

  return blocks;
});

const articleCopyHtml = computed(() => {
  if (!articleBlocks.value.length) return '';
  const title = escapeHtml(resultTitle.value || '');
  const body = articleBlocks.value.map((block) => {
    if (block.type === 'heading') {
      return `<h2 style="font-size:18px;line-height:1.6;margin:28px 0 12px;font-weight:700;">${escapeHtml(block.text)}</h2>`;
    }
    if (block.type === 'image') {
      return `<p style="margin:20px 0;text-align:center;"><img src="${escapeHtml(block.src)}" style="max-width:100%;height:auto;" /></p>`;
    }
    return `<p style="font-size:16px;line-height:1.9;margin:14px 0;color:#111;">${escapeHtml(block.text).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return [
    '<section style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;color:#111;">',
    title ? `<h1 style="font-size:22px;line-height:1.5;margin:0 0 22px;font-weight:800;">${title}</h1>` : '',
    body,
    '</section>'
  ].filter(Boolean).join('\n');
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
  const candidates = [];

  candidates.push(readTextLike(article.full_text));
  candidates.push(readTextLike(article.summary));

  const sectionText = Array.isArray(article.sections)
    ? article.sections
        .map((section) => [section.title, section.text].filter(Boolean).join('\n'))
        .filter(Boolean)
        .join('\n\n')
    : '';
  candidates.push(sectionText);

  const rawText = Array.isArray(content.raw_content)
    ? content.raw_content.map(readTextLike).filter(Boolean).join('\n\n')
    : '';
  candidates.push(rawText);
  candidates.push(readTextLike(content.full_text));
  candidates.push(readTextLike(content.text));
  candidates.push(readTextLike(content.summary));
  candidates.push(readTextLike(detail.full_text));
  candidates.push(readTextLike(detail.article_content));

  return candidates
    .map((item) => normalizeArticleText(item))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || '';
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

function normalizeArticleText(value) {
  return String(value || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function findImageUrlsDeep(input) {
  const urls = [];
  const seen = new Set();
  const queue = [input];

  while (queue.length) {
    const item = queue.shift();
    if (!item || seen.has(item)) continue;

    if (typeof item === 'string') {
      if (/^https?:\/\/.+\.(?:jpe?g|png|webp|gif)(?:[?#].*)?$/i.test(item) || /mmbiz|qpic|wx_fmt|xhscdn|rednote/i.test(item)) {
        urls.push(item);
      }
      continue;
    }

    if (typeof item !== 'object') continue;
    seen.add(item);

    const picked = pickImageUrl(item);
    if (picked) urls.push(picked);
    for (const value of Object.values(item)) {
      if (value && (typeof value === 'object' || typeof value === 'string')) queue.push(value);
    }
  }

  return urls;
}

function splitArticleParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}|(?<=[。！？!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseArticleHtmlBlocks(html) {
  if (!html || typeof window === 'undefined' || !window.DOMParser) return [];
  const documentHtml = new DOMParser().parseFromString(html, 'text/html');
  const nodes = [...documentHtml.body.querySelectorAll('h1,h2,h3,p,section,blockquote,img')];
  const blocks = [];

  for (const node of nodes) {
    if (node.tagName === 'IMG') {
      const src = normalizeMediaUrl(node.getAttribute('data-src') || node.getAttribute('src') || '');
      if (src) blocks.push({ type: 'image', src, index: blocks.length });
      continue;
    }

    const img = node.querySelector?.('img');
    if (img && node.textContent.trim().length < 8) {
      const src = normalizeMediaUrl(img.getAttribute('data-src') || img.getAttribute('src') || '');
      if (src) blocks.push({ type: 'image', src, index: blocks.length });
      continue;
    }

    const text = stripHtml(node.innerHTML || node.textContent || '');
    if (!text || text.length < 2) continue;
    const type = /^H[1-3]$/.test(node.tagName) ? 'heading' : 'text';
    if (!blocks.some((block) => block.type === type && block.text === text)) {
      blocks.push({ type, text });
    }
  }

  return blocks.slice(0, 120);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function navigate(path) {
  window.history.pushState({}, '', path);
  currentPath.value = path;
  if (path === '/audio-extract') fileMode.value = 'audio';
  if (path === '/audio-to-text') fileMode.value = 'audio';
  if (path === '/local-audio-to-text') fileMode.value = 'audio';
  if (path === '/video-extract' || path === '/media-extract') fileMode.value = 'video';
  if (path === '/video-to-text') fileMode.value = 'video';
  if (path === '/local-video-to-text') fileMode.value = 'video';
  if (path === '/text') textMode.value = 'link';
  if (path === '/article' || path === '/wechat-article') articleView.value = 'text';
  resetResult();
  updateMeta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('copypilot-lang', lang.value);
  updateMeta();
}

window.onpopstate = () => {
  currentPath.value = window.location.pathname;
  updateMeta();
};

function updateMeta() {
  const page = pageMap[currentPath.value];
  const activePage = toolPage.value || page;
  const title = lang.value === 'en'
    ? activePage?.title || uiText.value.heroTitle
    : activePage?.seoTitle || activePage?.title || uiText.value.heroTitle;
  const description = activePage?.subtitle || uiText.value.heroSubtitle;
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
    await loadMe();
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
    await loadMe();
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

async function loadMe() {
  try {
    const response = await fetch('/api/auth/me');
    const payload = await response.json();
    if (payload.ok) {
      currentUser.value = payload.user;
      usage.value = payload.usage;
      if (payload.user) await loadRecords();
    }
  } catch {
    // 登录状态不影响主工具使用。
  }
}

async function loadRecords() {
  if (!currentUser.value) {
    records.value = [];
    return;
  }
  const response = await fetch('/api/user/records').catch(() => null);
  if (!response?.ok) return;
  const payload = await response.json();
  if (payload.ok) records.value = payload.records || [];
}

async function sendEmailCode() {
  authLoading.value = true;
  authMessage.value = '';
  devCode.value = '';
  try {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail.value })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.message || '验证码发送失败。');
    authMessage.value = payload.message || '验证码已发送。';
    devCode.value = payload.devCode || '';
  } catch (err) {
    authMessage.value = err.message || '验证码发送失败。';
  } finally {
    authLoading.value = false;
  }
}

async function verifyEmailCode() {
  authLoading.value = true;
  authMessage.value = '';
  try {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail.value, code: authCode.value })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.message || '登录失败。');
    currentUser.value = payload.user;
    authOpen.value = false;
    authCode.value = '';
    await loadMe();
  } catch (err) {
    authMessage.value = err.message || '登录失败。';
  } finally {
    authLoading.value = false;
  }
}

function loginWithGoogle() {
  window.location.href = '/api/auth/google';
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
  currentUser.value = null;
  records.value = [];
  await loadMe();
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

async function copyArticleHtml() {
  if (!articleCopyHtml.value) return;
  const plainText = articleBlocks.value
    .map((block) => block.type === 'image' ? `[图片] ${block.src}` : block.text)
    .filter(Boolean)
    .join('\n\n');

  if (window.ClipboardItem && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([articleCopyHtml.value], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      })
    ]);
  } else {
    await navigator.clipboard.writeText(plainText);
  }
  notice.value = '公众号排版已复制，可以粘贴到编辑器。';
}

function resetResult() {
  error.value = '';
  notice.value = '';
  result.value = null;
  articleView.value = 'text';
}

onMounted(loadMe);
</script>

<template>
  <div class="site" :class="`theme-${pageTheme}`">
    <header class="site-header">
      <a class="logo" href="/" @click.prevent="navigate('/')">
        <span class="logo-mark" aria-hidden="true">
          <span class="logo-sheet logo-sheet-back"></span>
          <span class="logo-sheet logo-sheet-front">
            <span class="logo-play"></span>
          </span>
        </span>
        <strong>{{ siteName }}</strong>
      </a>
      <nav class="desktop-nav" aria-label="主导航">
        <a href="/" @click.prevent="navigate('/')">{{ uiText.nav[0] }}</a>
        <a href="/video" @click.prevent="navigate('/video')">{{ uiText.nav[1] }}</a>
        <a href="/text" @click.prevent="navigate('/text')">{{ uiText.nav[2] }}</a>
        <a href="/image-text" @click.prevent="navigate('/image-text')">{{ uiText.nav[3] }}</a>
        <a href="/article" @click.prevent="navigate('/article')">{{ uiText.nav[4] }}</a>
      </nav>
      <div class="header-actions">
        <button class="language-button" @click="toggleLang">{{ lang === 'zh' ? 'EN' : '中文' }}</button>
        <button class="login-button" @click="authOpen = true">{{ authButtonText }}</button>
      </div>
    </header>

    <div v-if="authOpen" class="auth-overlay" @click.self="authOpen = false">
      <section class="auth-panel">
        <button class="auth-close" @click="authOpen = false">×</button>
        <div v-if="!currentUser">
          <p class="eyebrow">账号登录</p>
          <h2>登录后获得更多提取额度</h2>
          <p class="auth-muted">邮箱验证码登录不需要密码。Google 登录需要先配置 OAuth。</p>
          <button class="google-button" @click="loginWithGoogle">使用 Google 登录</button>
          <div class="auth-divider">或使用邮箱验证码</div>
          <input v-model="authEmail" class="auth-input" placeholder="输入邮箱" type="email" />
          <div class="auth-code-row">
            <input v-model="authCode" class="auth-input" placeholder="6 位验证码" inputmode="numeric" />
            <button class="secondary-button" :disabled="authLoading" @click="sendEmailCode">
              {{ authLoading ? '处理中' : '发验证码' }}
            </button>
          </div>
          <button class="primary-button auth-submit" :disabled="authLoading" @click="verifyEmailCode">登录 / 注册</button>
          <p v-if="authMessage" class="auth-message">{{ authMessage }}</p>
          <p v-if="devCode" class="auth-dev">测试验证码：{{ devCode }}</p>
        </div>
        <div v-else>
          <p class="eyebrow">用户中心</p>
          <h2>{{ currentUser.email }}</h2>
          <div class="account-stats">
            <article>
              <span>当前套餐</span>
              <strong>{{ currentUser.plan || 'free' }}</strong>
            </article>
            <article>
              <span>Credits</span>
              <strong>{{ currentUser.credits ?? 0 }}</strong>
            </article>
            <article>
              <span>今日剩余</span>
              <strong>{{ usage?.remainingToday ?? '-' }}</strong>
            </article>
          </div>
          <div class="record-list">
            <h3>最近提取记录</h3>
            <p v-if="!records.length" class="auth-muted">暂无记录。</p>
            <article v-for="item in records" :key="item.id">
              <strong>{{ item.result_title || item.action }}</strong>
              <span>{{ new Date(item.created_at).toLocaleString() }}</span>
            </article>
          </div>
          <button class="secondary-button auth-submit" @click="logout">退出登录</button>
        </div>
      </section>
    </div>

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
          {{ toolPage?.badge || uiText.heroBadge }}
        </p>
        <h1>{{ toolPage?.title || uiText.heroTitle }}</h1>
        <p class="subtitle">
          {{ toolPage?.subtitle || uiText.heroSubtitle }}
        </p>

        <div v-if="toolPage?.type === 'text'" class="mode-switch">
          <button :class="{ active: textMode === 'link' }" @click="textMode = 'link'">
            <Link :size="17" /> {{ uiText.linkText }}
          </button>
          <button :class="{ active: textMode === 'file' }" @click="textMode = 'file'">
            <FileAudio :size="17" /> {{ uiText.localText }}
          </button>
        </div>

        <section v-if="isLinkInputPage" class="extract-box" aria-label="链接提取">
          <p v-if="usage" class="usage-pill">
            {{ currentUser ? `今日剩余 ${usage.remainingToday} 次，Credits ${currentUser.credits ?? 0}` : `游客今日剩余 ${usage.remainingToday} 次` }}
          </p>
          <input
            v-model="url"
            :placeholder="
              toolPage?.type === 'video'
                ? uiText.placeholders.video
                : toolPage?.type === 'image'
                  ? uiText.placeholders.image
                  : toolPage?.type === 'article'
                    ? uiText.placeholders.article
                    : uiText.placeholders.text
            "
          />
          <div class="button-row">
            <button class="primary-button" :disabled="loading" @click="extract">
              <Loader2 v-if="loading" class="spin" :size="18" />
              <Link v-else :size="18" />
              {{ loading ? uiText.loading : uiText.start }}
            </button>
            <button class="secondary-button" @click="paste"><Clipboard :size="18" /> {{ uiText.paste }}</button>
            <button class="secondary-button" @click="clearInput">{{ uiText.clear }}</button>
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
          <button @click="navigate('/video')"><FileVideo :size="17" /> {{ uiText.nav[1] }}</button>
          <button @click="navigate('/text')"><Captions :size="17" /> {{ uiText.nav[2] }}</button>
          <button @click="navigate('/image-text')"><Image :size="17" /> {{ uiText.nav[3] }}</button>
          <button @click="navigate('/article')"><FileText :size="17" /> {{ uiText.nav[4] }}</button>
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

            <div v-if="toolPage?.type === 'article'" class="article-mode-switch">
              <button :class="{ active: articleView === 'text' }" @click="articleView = 'text'">整理正文</button>
              <button :class="{ active: articleView === 'layout' }" @click="articleView = 'layout'">二创排版</button>
              <button :disabled="!articleBlocks.length" @click="copyArticleHtml">复制公众号排版</button>
            </div>

            <article class="result-block">
              <span>{{ copyBlockTitle }}</span>
              <p v-if="resultText && articleView === 'text'" class="result-text">{{ resultText }}</p>
              <div v-else-if="toolPage?.type === 'article' && articleView === 'layout' && articleBlocks.length" class="article-layout-preview">
                <h3 v-if="resultTitle">{{ resultTitle }}</h3>
                <template v-for="(block, index) in articleBlocks" :key="`${block.type}-${index}`">
                  <h4 v-if="block.type === 'heading'">{{ block.text }}</h4>
                  <p v-else-if="block.type === 'text'">{{ block.text }}</p>
                  <figure v-else-if="block.type === 'image'">
                    <img :src="block.src" :alt="`文章图片 ${index + 1}`" loading="lazy" referrerpolicy="no-referrer" />
                    <figcaption>图片 {{ index + 1 }}</figcaption>
                  </figure>
                </template>
              </div>
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
          <p class="eyebrow"><Sparkles :size="18" /> {{ uiText.featureEyebrow }}</p>
          <h2>{{ uiText.featureTitle }}</h2>
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
          <p class="eyebrow"><Check :size="18" /> {{ uiText.stepsEyebrow }}</p>
          <h2>{{ uiText.stepsTitle }}</h2>
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
          <p class="eyebrow"><Wand2 :size="18" /> {{ uiText.faqEyebrow }}</p>
          <h2>{{ uiText.faqTitle }}</h2>
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
          <p class="eyebrow"><Sparkles :size="18" /> {{ uiText.seoEyebrow }}</p>
          <h2>{{ uiText.seoTitle }}</h2>
        </div>
        <div class="seo-group-grid">
          <article v-for="group in seoToolGroups" :key="group.title" class="seo-group">
            <h3>{{ group.title }}</h3>
            <div class="seo-link-grid">
              <a v-for="[path, label] in group.links" :key="path" :href="path" @click.prevent="navigate(path)">
                {{ label }}
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>{{ siteName }}</strong>
        <p>{{ uiText.footerDesc }}</p>
      </div>
      <div class="footer-links">
        <nav>
          <strong>{{ uiText.core }}</strong>
          <a href="/" @click.prevent="navigate('/')">{{ uiText.nav[0] }}</a>
          <a href="/video" @click.prevent="navigate('/video')">{{ uiText.nav[1] }}</a>
          <a href="/text" @click.prevent="navigate('/text')">{{ uiText.nav[2] }}</a>
          <a href="/image-text" @click.prevent="navigate('/image-text')">{{ uiText.nav[3] }}</a>
          <a href="/article" @click.prevent="navigate('/article')">{{ uiText.nav[4] }}</a>
        </nav>
        <nav class="footer-tools">
          <strong>{{ uiText.hot }}</strong>
          <a v-for="[path, label] in seoToolLinks" :key="path" :href="path" @click.prevent="navigate(path)">
            {{ label }}
          </a>
        </nav>
        <nav>
          <strong>{{ uiText.info }}</strong>
          <a v-for="[path, label] in legalLinks" :key="path" :href="path" @click.prevent="navigate(path)">
            {{ label }}
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>

