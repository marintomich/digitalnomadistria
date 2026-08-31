# Digital Nomads Istria — website

A static site for Digital Nomads Istria: plain HTML, CSS, and vanilla JS,
deployable for free on GitHub Pages, with a working contact form and a
git-based CMS for non-technical content edits. No backend, no build step,
no paid services required.

```
index.html              the whole page (one page, anchor-linked sections)
css/style.css            design tokens + layout
js/main.js                nav, scroll-reveal, hero parallax, contact form
js/content-loader.js      loads content/site.json and fills the page
content/site.json         every editable word on the site, in one file
images/                   placeholder illustrations — replace before launch
admin/                    Sveltia CMS (content editor at yoursite.com/admin)
.github/workflows/deploy.yml   publishes the site on every push to main
```

## How content editing works (read this first)

All copy — headings, paragraphs, coworking listings, town notes, contact
details — lives in **`content/site.json`**, not hardcoded in the HTML.
`js/content-loader.js` fetches that file in the visitor's browser and fills
in the page. That means:

- Editing `content/site.json` and pushing it is the *entire* update — there
  is no compile step. GitHub Pages just serves the new file.
- The CMS at `/admin` (see below) is a friendly form that edits this same
  file for someone who doesn't want to touch JSON directly.
- If `content/site.json` is ever unreachable, the page falls back to the
  text already written into `index.html`, so the site is never blank.

## 1. Local development

No install needed. From the project folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(A local static server is required only because `fetch()` for
`content/site.json` is blocked on `file://` URLs by browsers — any static
server works, e.g. `npx serve`.)

## 2. Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder to its `main` branch.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
   (The included `.github/workflows/deploy.yml` will pick this up
   automatically — every push to `main` republishes the site, including
   commits made by the CMS.)
4. Wait for the **Deploy to GitHub Pages** check to go green (Actions tab),
   then open the URL GitHub gives you under Settings → Pages.
5. Optional: add a custom domain under Settings → Pages → Custom domain,
   and create a `CNAME` DNS record pointing at `<username>.github.io`.

That's the whole deployment. There is no build artifact to inspect — the
repo's files are the deployed files.

## 3. Contact form setup (must be done before launch)

The form uses **Web3Forms** (free, no account-holding of submissions,
sends straight to your inbox).

1. Go to https://web3forms.com/ and enter the email address that should
   receive enquiries. It emails you an **Access Key** — no account
   creation required.
2. Open `content/site.json` and replace:
   ```json
   "web3forms_access_key": "REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY"
   ```
   with the real key. (Or set the same field from the CMS at `/admin` →
   "Contact section" → "Web3Forms access key".)
3. Also update `"fallback_email"` in the same file to the real inbox
   address — it's shown on the page as a `mailto:` backup if the form
   service is ever unreachable.
4. Commit/push (or save in the CMS). No other code changes are needed —
   `js/main.js` reads the key from `content/site.json` at runtime.

Until a real key is added, the form shows a clear on-page message
pointing people to the fallback email instead of failing silently.

## 4. Editing content (CMS)

The `/admin` route runs **Sveltia CMS**, a modern, actively-maintained,
Decap-CMS-compatible editor loaded from a CDN — no separate build or
install. It shows a plain form for every section of the site and commits
changes straight to `content/site.json` in this repo; GitHub Pages
republishes automatically afterwards (typically under a minute).

### One-time OAuth setup (do this once, during handoff — not something the
site owner needs to touch)

GitHub requires an OAuth "dance" to let a web app commit to a repo on
someone's behalf. The simplest free option is a small OAuth helper
deployed on **Cloudflare Workers** (free tier is more than sufficient for
this):

1. Create a GitHub OAuth App: **GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App**.
   - Homepage URL: your site's URL.
   - Authorization callback URL: `https://<your-worker-subdomain>.workers.dev/callback`
     (you'll get the exact subdomain in step 2 — you can update this
     field afterwards).
2. Deploy the OAuth helper worker: https://github.com/sveltia/sveltia-cms-auth
   — it's a one-click "Deploy to Cloudflare Workers" README. During setup,
   add two environment variables/secrets to the Worker: `GITHUB_CLIENT_ID`
   and `GITHUB_CLIENT_SECRET` from the OAuth App you just created.
3. In `admin/config.yml`, set:
   ```yaml
   backend:
     name: github
     repo: your-github-username/your-repo-name
     branch: main
     base_url: https://<your-worker-subdomain>.workers.dev
     auth_endpoint: auth
   ```
4. Commit that change. Visit `https://yoursite.com/admin`, click
   **Login with GitHub**, authorize, and the editor opens.

Anyone you invite as a collaborator on the GitHub repo can then log in at
`/admin` with their own GitHub account — no shared password.

### Plan B — no CMS setup at all

If the OAuth setup above is more than you want to maintain, skip `/admin`
entirely and edit `content/site.json` straight from GitHub's own web
editor:

1. Open `content/site.json` in the GitHub repo.
2. Click the pencil ("Edit this file") icon.
3. Change the text between the quotes for whichever field you're
   updating — every field has a plain-English name (`"heading"`,
   `"note"`, `"headline"`, etc.) and the structure is grouped by section
   (`hero`, `why`, `work`, `stay`, `lifestyle`, `community`, `contact`,
   `footer`).
4. Scroll down, click **Commit changes**.
5. The site updates automatically within about a minute — no build step,
   no waiting on the CMS or OAuth.

This is a completely valid permanent way to run the site if a technical
person is willing to make edits occasionally; it just skips the
form-based UI.

## 5. Replacing placeholder imagery

Every image in `images/` is an intentionally simple illustrated
placeholder (not a broken-image box) standing in for real photography.
Each `<img>` tag's `alt` text says exactly what should replace it, e.g.
*"Placeholder: Rovinj coastline at dusk — replace with real photography."*
Swap in real photos at matching aspect ratios:

- `images/hero-hilltown.svg` → hero, roughly 4:5 to 1:1, full-bleed.
- `images/coastline.svg`, `images/vineyard.svg`, `images/terrace.svg` →
  4:3 (work cards) or 5:4 (stay spreads).

Export real photography as WebP with responsive `srcset` sizes before
launch to keep Lighthouse performance scores in the 95+ range — a single
well-compressed WebP per breakpoint is enough; this template doesn't need
a dedicated image pipeline.

## 6. Design rationale (for reading aloud to the client)

*This site is built around one idea: Istria sells itself on restraint,
not spectacle, so the design gets out of the way of the towns, the food,
and the coast it's describing. The palette is limestone and olive — the
actual colours of the peninsula's stone and groves — with terracotta used
sparingly, only for the one action we want someone to take. The
headlines are set in a quiet italic serif, the same register as a
well-edited travel magazine, never a shouting display font. Instead of
generic icon-and-card grids, the "why Istria" section reads like an
editor's notes — a label and a paragraph, row after row — and the "where
to stay" section is laid out as alternating photo spreads, the way a
print feature would run it, not as identical product cards. The one
moment of motion is a slow parallax on the hero photograph; everything
else holds still, because a site about slowing down shouldn't twitch.
The result reads as considered rather than decorated — which is the
actual selling point of the destination it's representing.*

## 7. Quality checklist

- [ ] Real photography swapped in (see §5) and compressed to WebP.
- [ ] Web3Forms access key and fallback email set (see §3).
- [ ] `admin/config.yml` repo name and OAuth `base_url` updated (see §4),
      or Plan B adopted deliberately.
- [ ] Run Lighthouse (Chrome DevTools → Lighthouse) after adding real
      photography — this template ships with no render-blocking scripts,
      no unused JS libraries, and system-safe font-loading, so scores
      should stay 95+ provided images are optimized.
- [ ] Custom domain connected (optional, §2 step 5).
