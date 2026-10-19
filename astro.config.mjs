import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Works on Vercel or Netlify with no changes.
// On Vercel the two form endpoints run as Vercel Functions; on Netlify they run from netlify/functions.
const onVercel = !!process.env.VERCEL;

const site = process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  || process.env.URL
  || 'http://localhost:4321';

const apiRoutes = {
  name: 'api-routes',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      injectRoute({ pattern: '/api/lead', entrypoint: './src/server/routes/lead.js' });
      injectRoute({ pattern: '/api/event', entrypoint: './src/server/routes/event.js' });
    }
  }
};

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  ...(onVercel ? { adapter: vercel(), integrations: [apiRoutes] } : {})
});
