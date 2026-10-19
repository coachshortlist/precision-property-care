# Precision Property Care website

The website, price guide and lead dashboard for Precision Property Care.

- **Website:** home, services, a page for each service, our work, about, contact, privacy.
- **Price guide:** customers pick a job, see a rough price and leave their details. Every enquiry is saved as a lead.
- **Lead dashboard** at `/admin/`: only approved email addresses can sign in.

Built with Astro, with leads stored in Supabase. It runs on **Vercel** or **Netlify** with no code changes.

> **Vercel plan:** Vercel's free Hobby plan is for non-commercial use only, and a business website counts as commercial. On Vercel this site needs the **Pro plan** ($20 a month). Netlify's free plan is an alternative; the steps for both are below.

---

## Setting it up (about 30 minutes, one time)

### 1. Put the code on GitHub
1. Open the empty `precision-property-care` repository on GitHub.
2. Click **uploading an existing file**.
3. Drag in everything from this folder, including `package.json`, `vercel.json`, `netlify.toml` and the `src`, `public`, `netlify` and `supabase` folders.
4. Click **Commit changes**.

### 2. Set up the database (Supabase)
1. In Supabase, click **New project**. Name it `precision-property-care` and pick the **London** region. Save the database password somewhere safe.
2. When it's ready, open **SQL Editor**, then **New query**.
3. Open `supabase/schema.sql` from this folder and copy all of it in.
4. **On the last line**, change `change-me@example.com` to the email address that will log in to the dashboard.
5. Click **Run**. You should see "Success. No rows returned".
6. Go to **Authentication**, then **Users**, then **Add user**, then **Create new user**. Use the same email, and tick **Auto Confirm User**. The dashboard signs in with an emailed link, so the password you set here won't be used.
7. Go to **Project Settings**, then **API** (or **API Keys**). Keep this page open, because you'll need three values from it:
   - the **Project URL**
   - the **anon / publishable** key (fine to be public)
   - the **service_role / secret** key (**keep this secret**)

### 3. Put the site online

You need these four environment variables whichever host you use:

| Key | Value |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |
| `PUBLIC_SUPABASE_URL` | Project URL (again) |
| `PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

**On Vercel**
1. Go to **Add New**, then **Project**, and import `precision-property-care` from GitHub.
2. Vercel spots that it's an Astro site, so leave the build settings as they are.
3. Open **Environment Variables** on the same screen and add the four keys above.
4. Click **Deploy**. Your address will be something like `https://precision-property-care.vercel.app`.
5. If you add or change keys later, go to **Deployments**, open the **...** menu on the latest one, and click **Redeploy**.

**Or on Netlify**
1. Go to **Add new site**, then **Import an existing project**, then **GitHub**, and pick the repo. The build settings fill themselves in.
2. Go to **Site configuration**, then **Environment variables**, and add the four keys.
3. Go to **Deploys**, then **Trigger deploy**, then **Deploy site**.

### 4. Let the dashboard sign-in links work
1. In Supabase, go to **Authentication**, then **URL Configuration**.
2. Set **Site URL** to the site's address.
3. Under **Redirect URLs**, add the same address followed by `/admin/`, e.g. `https://precision-property-care.vercel.app/admin/`.

### 5. Test it
1. Open the site and do a price guide with your own details.
2. Go to `/admin/`, enter your email, and click the link that arrives. Your test lead should be there.
3. Delete the test lead from the dashboard when you're done.

---

## Optional: email alert for every new lead
1. Create a free account at resend.com and make an API key.
2. Add these environment variables:
   - `RESEND_API_KEY`: the key
   - `ALERT_EMAIL`: where alerts go. Until a domain is verified in Resend, this must be the email you signed up to Resend with.
3. Redeploy.

Once the real domain is connected and verified in Resend, also add `ALERT_FROM`, e.g. `Website enquiries <leads@precisionpropertycare.co.uk>`.

## When the real domain is bought
1. Add the domain to the site:
   - **Vercel:** Project, then **Settings**, then **Domains**.
   - **Netlify:** **Domain management**, then **Add a domain**.
2. Add the environment variable `SITE_URL`, e.g. `https://www.precisionpropertycare.co.uk`, and redeploy.
3. In Supabase, update the **Site URL** and **Redirect URLs** to the new domain.

---

## Changing content

Almost everything lives in **`src/data/site.js`**:

- **`CONTACT`:** phone, WhatsApp number, email, social links, opening hours and areas covered. Leave a link as `''` to hide its button.
- **`SERVICES`:** every service's name, prices, what's included, and FAQs. Prices are per m² or metre (`low`, `high`, `min`), or fixed options (`choices`).
- **`EXTRAS`:** the add-ons offered in the price guide.
- **`PROJECTS`:** recent jobs on the site. The reviews are currently examples and must be replaced with real ones.

Page wording lives in `src/pages/`. Saving a change on GitHub redeploys the site automatically within a minute or two.

The form endpoints live in `src/server/`. Vercel runs them through `src/server/routes/`, and Netlify runs them through `netlify/functions/`.

**Still to do before advertising:**
- real contact details, prices, photos and reviews
- confirm the Gas Safe, certified electrics, insurance and guarantee claims
- finish the privacy policy
- register with the ICO

## Running it on a computer (developers)
```
npm install
npm run dev
```
To test the forms locally, run `npx vercel dev` (or `npx netlify dev`) with the environment variables in a `.env` file. See `.env.example`.
