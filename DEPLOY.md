# Deploy — Vercel subdomain + WordPress link (Path A)

Goal: the full app (guided wizard **and** AI assist) live at
`s-tags.yeeboodigital.com`, linked from the WordPress nav. WordPress stays
untouched — it just points at the subdomain.

> The guided wizard (the "island") is always included in this deploy. AI assist
> is the extra tab, enabled by `NEXT_PUBLIC_AI_MODE=on`. One deploy = both.

---

## 1. Push the repo to GitHub

```bash
git init
git add -A
git commit -m "Yeeboo S-Tag Builder"
git branch -M main
git remote add origin https://github.com/<your-org>/stag-builder.git
git push -u origin main
```

`.env.local` is gitignored — your key never goes to GitHub.

## 2. Import into Vercel

- vercel.com → **Add New → Project** → import the GitHub repo.
- Vercel auto-detects Next.js (Build `next build`, Output `.next`). Leave defaults.
- Don't deploy yet — set env vars first (next step), or deploy and add them after.

## 3. Environment variables (Vercel → Settings → Environment Variables)

| Key | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_AI_MODE` | `on` | All |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | **Production** (server only) |
| `NEXT_PUBLIC_SITE_URL` | `https://s-tags.yeeboodigital.com` | All |
| `ANTHROPIC_MODEL` | *(optional)* `claude-haiku-4-5-20251001` | All |

After adding/changing env vars, **redeploy** so they take effect.

## 4. Add Vercel KV (makes the usage guard accurate)

- Vercel → **Storage → Create → KV** → connect it to this project.
- It auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`. The usage guard in
  `lib/usage-guard.ts` picks these up automatically — no code change.
- Without KV the guard still works, but only best-effort per-instance.

## 5. Set the spend cap (the real hard ceiling)

- console.anthropic.com → **Billing / Limits** → set a **$20/month** limit on
  the key's organization. This is what guarantees you can't be surprised.

## 6. Custom subdomain + DNS

- Vercel → **Settings → Domains → Add** `s-tags.yeeboodigital.com`.
- Vercel shows a DNS record to create — usually:
  `CNAME  s-tags  →  cname.vercel-dns.com`
- Add that record wherever `yeeboodigital.com` DNS is managed (your registrar or
  WP host's DNS panel). SSL is issued automatically once DNS resolves.

## 7. Link it from WordPress

- WP admin → **Appearance → Menus** → **Custom Links** →
  URL `https://s-tags.yeeboodigital.com`, text "S-Tag Builder" → add to menu.
- (Optional) drop a button in a page/post pointing to the same URL.

## 8. Post-deploy smoke test

- [ ] Wizard works (no key needed) — pick a pattern, code updates live, Copy works
- [ ] "Describe it with AI" tab present, a real prompt returns code
- [ ] View source / network: `ANTHROPIC_API_KEY` never appears client-side
- [ ] Quick Reference panel + Blackbaud doc links open
- [ ] Mobile layout is usable
- [ ] Spend cap visible in the Anthropic console

---

## Updates later

Push to `main` → Vercel auto-builds and redeploys. To change the wizard
patterns edit `lib/templates.ts`; to change the AI's knowledge edit
`SYSTEM_PROMPT.md` + mirror into `lib/system-prompt.ts`.

---

## Appendix — the standalone static island (optional, not needed for the above)

You do **not** need this for the live site (Path A already serves the wizard).
It's only for a $0 / no-Node mirror — e.g. hosting the free wizard directly on
your WordPress hosting, or on GitHub Pages.

The island is plain static files; it needs Next.js only at **build time** to
generate them, then runs entirely in the browser.

**Root host** (e.g. GitHub Pages user/org site, or a dedicated host):

```bash
npm run build:island      # produces ./out with root-relative asset paths
# upload the contents of ./out to the host root
```

**WordPress subdirectory** (e.g. `yeeboodigital.com/tools/s-tag-builder/`) — set
`ISLAND_BASE_PATH` so all asset/page URLs resolve under that path:

```bash
ISLAND_BASE_PATH=/tools/s-tag-builder npm run build:island
# SFTP the contents of ./out to your WP host at /tools/s-tag-builder/
```

`ISLAND_BASE_PATH` must start with `/` and not end with `/`, and must match the
folder you upload to. It applies only to the static island build — the Vercel
server build (Path A) always serves from root and ignores it.

WordPress (PHP) doesn't render it — the same web server just serves the files
sitting next to your WP install.

### Automated island deploys (GitHub Actions)

Two ready-made workflows in `.github/workflows/`:

**`island-pages.yml` → GitHub Pages** (free, zero credentials). Publishes the
island to `https://<owner>.github.io/<repo>/` on every push to `main`. It sets
`ISLAND_BASE_PATH=/<repo>` automatically.
- One-time: repo → **Settings → Pages → Source: "GitHub Actions"**. Then push.

**`island-wphost.yml` → your WordPress host** (FTPS, manual trigger). Builds for
your subdirectory and uploads `./out`. Stays dormant until you configure:
- Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- Variables: `ISLAND_BASE_PATH` (e.g. `/tools/s-tag-builder`), `FTP_SERVER_DIR`
  (e.g. `/public_html/tools/s-tag-builder/`)
- Run it from the **Actions** tab when you want to publish. (Uses FTPS — if your
  host needs SFTP-over-SSH, swap the upload step for an SFTP action.)
