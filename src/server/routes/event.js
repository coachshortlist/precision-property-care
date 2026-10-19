// Vercel entry point (added automatically when building on Vercel, see astro.config.mjs).
import { handleEvent } from '../event.js';
export const prerender = false;
export const POST = ({ request }) => handleEvent(request);
