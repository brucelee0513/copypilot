import { seoRoutes } from '../src/seo-pages.js';

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;
  const today = new Date().toISOString().slice(0, 10);
  const urls = seoRoutes.map((route) => {
    return [
      '  <url>',
      `    <loc>${escapeXml(`${origin}${route}`)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      route === '/' ? '    <priority>1.0</priority>' : '    <priority>0.8</priority>',
      '  </url>'
    ].join('\n');
  }).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      }
    }
  );
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => {
    const map = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;'
    };
    return map[char];
  });
}
