import { SLUGS } from '../data/site.js';
export function GET({ site }){
  const paths = ['/', '/services/', '/our-work/', '/about/', '/contact/', '/privacy/', ...Object.values(SLUGS).map(s => `/services/${s}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers:{ 'content-type':'application/xml' } });
}
