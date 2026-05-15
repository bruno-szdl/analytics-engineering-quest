# dbt Quest v1 Launch Checklist

## ✅ Documentation Fixes (Complete)

- [x] Updated `CONTRIBUTING.md` — reflects 15-lesson curriculum, not 31-level system
- [x] Updated `docs/lesson-system.md` — current architecture documentation
- [x] Created `docs/seo-setup.md` — comprehensive guide to SEO infrastructure

**What changed**: Removed references to modules, chapters, and renumbering warnings. Clarified the actual 15-lesson structure (L0–L14).

---

## ✅ SEO & Metadata Enhancements (Complete)

### HTML Metadata (`index.html`)

- [x] Title: "dbt quest — Interactive browser game for learning dbt"
- [x] Meta description (155 chars, optimized for Google search results)
- [x] Keywords: dbt, data, SQL, analytics, tutorial, learning, interactive, game, data engineering
- [x] Author: Bruno Szdl
- [x] Canonical URL: https://dbtquest.io/

### Open Graph & Social Sharing

- [x] og:title, og:description, og:image, og:url
- [x] og:image dimensions (1200×630) and alt text
- [x] Twitter Card (summary_large_image)
- [x] twitter:creator: @brunoszdl
- [x] Language: og:locale set to en_US

**Testing**: Use [Open Graph Debugger](https://www.opengraph.xyz/?url=https://dbtquest.io) to verify social previews.

### Search Engine Support

- [x] **robots.txt** (`public/robots.txt`)
  - Allows all crawlers
  - Disallows Facebook/Twitter external bots
  - Points to sitemap
  - Crawl-delay: 1ms

- [x] **sitemap.xml** (`public/sitemap.xml`)
  - Lists all 15 lessons (L0–L14) + privacy page
  - Priorities: 1.0 (homepage), 0.9 (L0–L1), 0.8 (L2–L14), 0.5 (privacy)
  - Lastmod dates set to 2026-05-15 (update as needed)
  - Changefreq: weekly (homepage), monthly (lessons), yearly (privacy)

**Testing**: Verify accessibility:
```bash
curl https://dbtquest.io/robots.txt
curl https://dbtquest.io/sitemap.xml
```

### Structured Data

- [x] JSON-LD `EducationalWebApplication` schema in `<head>`
- [x] Declares name, description, creator, languages supported

**Testing**: Use [Google Rich Results Tester](https://search.google.com/test/rich-results).

### Social Media Image

- [x] **og-image.svg** (`public/og-image.svg`)
  - 1200×630 SVG with dbt quest branding
  - Includes logo, tagline, 3 feature callouts, CTA button
  - Designed to match dark mode of the app

**Optional PNG conversion** (for maximum platform compatibility):
```bash
npm install -g svgexport
cd public
svgexport og-image.svg og-image.png 1200 630
```
Then update `index.html` og:image to `/og-image.png`.

### Deployment Configuration

- [x] **vercel.json**
  - Proper headers for robots.txt (cache 1 day)
  - Proper headers for sitemap.xml (cache 7 days)
  - Static assets cache for 30 days
  - SPA routing rewrites (all non-asset URLs → index.html)

- [x] **security.txt** (`public/.well-known/security.txt`)
  - Security contact: security@dbtquest.io, bruno.szdl@gmail.com
  - Expiration: 2027-05-15
  - RFC 9116 compliant

**Update annually**: Change expiration date in `public/.well-known/security.txt`.

---

## 📋 Pre-Launch Tasks

### Before Deployment

- [ ] **Verify all metadata**:
  ```bash
  npm run build
  grep -E "og:|twitter:" dist/index.html
  ```

- [ ] **Test social preview**:
  - Visit [Open Graph Debugger](https://www.opengraph.xyz/?url=https://dbtquest.io)
  - Share a link on Twitter/LinkedIn and verify preview

- [ ] **Set up Vercel environment**:
  - (Optional) Add `VITE_CF_ANALYTICS_TOKEN` for Cloudflare analytics
  - Deploy with `vercel deploy --prod`

- [ ] **Verify files are served**:
  ```bash
  curl -I https://dbtquest.io/robots.txt        # Should be 200
  curl -I https://dbtquest.io/sitemap.xml       # Should be 200
  curl -I https://dbtquest.io/og-image.svg      # Should be 200
  curl -I https://dbtquest.io/favicon.svg       # Should be 200
  ```

- [ ] **Register with search engines**:
  - [ ] [Google Search Console](https://search.google.com/search-console) — add property, submit sitemap
  - [ ] [Bing Webmaster Tools](https://www.bing.com/webmasters) — add property, submit sitemap
  - [ ] (Optional) [Yandex Webmaster](https://webmaster.yandex.com/) — for Russian audience

- [ ] **Announce on social media**:
  - [ ] Tweet with the link (Twitter will show the og-image preview)
  - [ ] Post on LinkedIn
  - [ ] Share in dbt Slack communities

### Post-Launch Monitoring

- [ ] **Monitor search rankings**:
  - Watch Google Search Console for impressions, clicks, average position
  - Target keywords: "learn dbt", "dbt tutorial", "interactive dbt"

- [ ] **Monitor indexing**:
  - Search Console → Coverage: Verify all 15 lessons are indexed
  - Search Console → Enhancements: Check structured data validation

- [ ] **Monitor analytics**:
  - If analytics enabled: Check Cloudflare dashboard weekly
  - Track: pageviews/lesson, bounce rate, referrer sources, returning visitors

- [ ] **Monitor social sharing**:
  - Periodically re-test og:image with [OG Debugger](https://www.opengraph.xyz/)
  - Verify Twitter/LinkedIn previews still render correctly

---

## 📝 Files Changed / Created

### Modified Files

1. **CONTRIBUTING.md**
   - Removed references to 31-level system
   - Updated to reflect 15-lesson curriculum
   - Clarified lesson addition workflow

2. **docs/lesson-system.md**
   - Replaced old module-based structure docs
   - Added current 15-lesson architecture overview
   - Updated validator and engine reference

3. **index.html**
   - Added comprehensive meta tags (description, keywords, author)
   - Added Open Graph tags (og:title, og:description, og:image)
   - Added Twitter Card tags
   - Added JSON-LD structured data (EducationalWebApplication)
   - Added canonical URL, robots meta tag, theme-color

4. **README.md**
   - Added "Deployment" section
   - Added "SEO & Metadata" subsection
   - Documented environment variables for analytics
   - Included og-image conversion instructions

5. **vercel.json** (new)
   - Configured proper header caching for static files
   - Set up SPA routing rewrites
   - Optimized for Vercel deployment

### New Files

1. **public/robots.txt**
   - Search engine crawling instructions
   - Sitemap reference
   - Crawl-delay configuration

2. **public/sitemap.xml**
   - XML sitemap with all 15 lessons + privacy page
   - Lastmod dates, priorities, changefreq

3. **public/og-image.svg**
   - 1200×630 SVG social media preview image
   - Branded with dbt quest logo and features
   - Can be converted to PNG for broader compatibility

4. **public/.well-known/security.txt**
   - Security contact information
   - Vulnerability disclosure instructions
   - RFC 9116 compliant

5. **docs/seo-setup.md**
   - Comprehensive SEO and metadata documentation
   - Maintenance guide and checklist
   - Troubleshooting and testing instructions

---

## 🎯 Expected Outcomes

### Short-term (Weeks 1–4)

- [ ] All files indexed by Google (search Console coverage)
- [ ] Twitter/LinkedIn previews rendering correctly
- [ ] Initial organic traffic from dbt-related searches
- [ ] No crawl errors in Search Console

### Medium-term (Months 1–3)

- [ ] Page 2–3 rankings for "learn dbt", "dbt tutorial"
- [ ] Steady organic traffic growth
- [ ] Referral traffic from dbt communities (Slack, Reddit, etc.)
- [ ] User feedback on lesson quality

### Long-term (6+ months)

- [ ] Page 1 ranking for branded keywords ("dbt quest")
- [ ] Sustainable organic traffic
- [ ] Backlinks from dbt blogs, tutorials, education sites
- [ ] Potential feature in dbt resources/community pages

---

## 🚀 Launch Commands

```bash
# Verify everything builds
npm run build
npm run lint

# Deploy to Vercel
vercel deploy --prod

# Verify files are live
curl https://dbtquest.io/robots.txt
curl https://dbtquest.io/sitemap.xml
curl https://dbtquest.io/og-image.svg

# Test social preview
# Use: https://www.opengraph.xyz/?url=https://dbtquest.io
```

---

## 📞 Support & Maintenance

- **Bugs or issues**: File on [GitHub](https://github.com/bruno-szdl/dbt-quest/issues)
- **Feature requests**: Use [GitHub Discussions](https://github.com/bruno-szdl/dbt-quest/discussions)
- **Security vulnerabilities**: Email security@dbtquest.io (or use `public/.well-known/security.txt`)
- **General questions**: Check the docs or email bruno.szdl@gmail.com

---

**Last updated**: 2026-05-15
**Status**: ✅ Ready for launch
