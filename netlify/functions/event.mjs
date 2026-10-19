// Netlify entry point. The logic lives in src/server/event.js so Vercel and Netlify share it.
import { handleEvent } from '../../src/server/event.js';
export default (req) => handleEvent(req);
export const config = { path:['/api/event', '/api/event/'] };
