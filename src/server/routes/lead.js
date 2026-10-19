// Vercel entry point (added automatically when building on Vercel, see astro.config.mjs).
import { handleLead } from '../lead.js';
export const prerender = false;
export const POST = ({ request }) => handleLead(request);
