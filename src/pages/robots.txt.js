export function GET({ site }){
  return new Response(`User-agent: *\nDisallow: /admin/\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, { headers:{ 'content-type':'text/plain' } });
}
