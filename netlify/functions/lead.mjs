// Netlify entry point. The logic lives in src/server/lead.js so Vercel and Netlify share it.
import { handleLead } from '../../src/server/lead.js';
export default (req) => handleLead(req);
export const config = { path:['/api/lead', '/api/lead/'] };
