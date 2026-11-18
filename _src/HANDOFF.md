# Robot Ninja: project handoff

Independent video game news site. Domain: robot-ninja.com. Hosting: GitHub Pages (same setup as The Leonida Herald).

## Files
- `content.json`: all site content.
  - `edition`: the date shown in the masthead (also decides which releases count as upcoming).
  - `lead`: slug of the front-page top story. `leadCallout`: optional big number plus caption shown under it.
  - `articles`: slug, section (`news`, `reviews`, `industry`), date, optional `updated`, title, dek, facts (pairs for the Key facts box), body, sources.
  - Body format: one paragraph per line, `## ` for subheadings, `- ` for bullets.
  - `releases`: date, title, platforms, note, optional `link` (an article slug). `releaseSources`.
- `build.js`: run `node build.js content.json out` to generate every page, plus archive, RSS `feed.xml`, `sitemap.xml`, `robots.txt`, `404.html`, `CNAME` (robot-ninja.com) and `.nojekyll`.
- `out/`: the generated site. This is what gets pushed to GitHub Pages.

## Design
The masthead is an aizome-indigo "mask" with the section nav running through a cyan "eye slit". Colors: indigo #221E4F (ink), washi #F0EFF5 (page), LED cyan #0FB3C9, steel #8C95AB (Industry), seal red #D7263D (logo only). Fonts: Chakra Petch (headlines, UI) and Literata (body). The logo is a hanko-style red seal with a visor. No game art or screenshots are used (copyright); stories are text-led.

## Rules
- Write every story in our own words, link sources, and say "reportedly" or "according to" for reports that haven't been confirmed.
- Never delete old stories. They stay in the archive. To correct a story, edit it and set `updated`.
- Outside links open in a new tab.
- The disclaimer that the site isn't affiliated with any publisher appears on every page.

## Going live
1. Create a public GitHub repo (for example `hulud86/robot-ninja`) and give the Claude GitHub App access.
2. Push the contents of `out/` to the `main` branch. In Settings > Pages, set Source to "Deploy from a branch", `main` / root. Set the custom domain to robot-ninja.com.
3. At your registrar's DNS: add four A records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, plus a CNAME record for `www` pointing to hulud86.github.io.
4. Once the certificate is issued, tick Enforce HTTPS.

## Daily refresh
Add new stories to `content.json`, set `edition` to today, move `lead` to the day's top story, drop past releases, rebuild, and push `out/`.
