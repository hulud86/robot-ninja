/* Robot Ninja site builder.
   node build.js <content.json> <outDir>
   buildSite(content) returns { "<path>": "<html or text>" }. */
function buildSite(content) {
  const SITE = "https://robot-ninja.com/";
  const NAME = "Robot Ninja";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const parts = d => d.split("-").map(Number);
  const longDate = d => { const [y,m,dd] = parts(d); return months[m-1] + " " + dd + ", " + y; };
  const shortDate = d => { const [,m,dd] = parts(d); return mon[m-1] + " " + dd; };
  const dayName = d => { const [y,m,dd] = parts(d); return days[new Date(Date.UTC(y, m-1, dd)).getUTCDay()]; };
  const rfc822 = d => { const [y,m,dd] = parts(d); return new Date(Date.UTC(y, m-1, dd, 13)).toUTCString(); };
  const order = new Map(content.articles.map((a, i) => [a.slug, i]));
  const arts = content.articles.slice().sort((a,b) => b.date.localeCompare(a.date) || order.get(a.slug) - order.get(b.slug));
  const bySection = s => arts.filter(a => a.section === s);
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;

  const SECTIONS = [
    { id: "front", file: "index.html", name: "Front page" },
    { id: "news", file: "news.html", name: "News", blurb: "Announcements, launches, sales and the stories everyone's talking about." },
    { id: "reviews", file: "reviews.html", name: "Reviews", blurb: "Review roundups and verdicts on the games that matter." },
    { id: "industry", file: "industry.html", name: "Industry", blurb: "Studios, deals, layoffs and labor: the business behind the games." },
    { id: "releases", file: "releases.html", name: "Releases", blurb: "What's coming out and when, across PlayStation, Xbox, Nintendo and PC." },
    { id: "archive", file: "archive.html", name: "Archive", blurb: "Every story we've published, newest first. Nothing gets taken down." }
  ];
  const secById = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

  const seal = (size, title) => `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 64 64" ${title ? 'role="img" aria-label="Robot Ninja"' : 'aria-hidden="true"'}><rect x="2" y="2" width="60" height="60" rx="5" fill="#D7263D"/><rect x="6" y="6" width="52" height="52" rx="3" fill="none" stroke="#F0EFF5" stroke-width="1.6" opacity=".55"/><path d="M14 22h36a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z" fill="#221E4F"/><rect x="19" y="28" width="10" height="5" rx="1.5" fill="#0FB3C9"/><rect x="35" y="28" width="10" height="5" rx="1.5" fill="#0FB3C9"/><path d="M54 34l6 8M54 30l7 3" stroke="#221E4F" stroke-width="3" stroke-linecap="round"/><path d="M22 47h20" stroke="#F0EFF5" stroke-width="3" stroke-linecap="round"/></svg>`;
  const favicon = "data:image/svg+xml," + encodeURIComponent(seal(64, false).replace('class="seal" width="64" height="64" ', 'xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ""));

  const css = `
:root{--washi:#F0EFF5;--washi2:#E2E0EB;--ink:#221E4F;--ink2:#4F4B73;--steel:#8C95AB;--led:#0FB3C9;--leddeep:#0A7F90;--seal:#D7263D;
--head:"Chakra Petch","Arial Narrow",system-ui,sans-serif;--body:Literata,Georgia,"Times New Roman",serif}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--washi);color:var(--ink);font-family:var(--body);font-size:18.5px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--leddeep);text-underline-offset:3px;text-decoration-thickness:1.5px}a:hover{color:var(--ink)}
:focus-visible{outline:3px solid var(--led);outline-offset:2px}
.wrap{max-width:1160px;margin:0 auto;padding:0 24px}
.skip{position:absolute;left:-999px}.skip:focus{left:12px;top:12px;background:var(--led);color:var(--ink);padding:8px 12px;z-index:9}
h1,h2,h3{font-family:var(--head);font-weight:700;line-height:1.04;letter-spacing:-.01em;margin:0;text-wrap:balance}
/* mask: the masthead band, with the nav as its eye slit */
.mask{background:var(--ink);color:var(--washi)}
.mask .top{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0 18px}
.brand{display:flex;align-items:center;gap:16px;text-decoration:none;color:var(--washi)}
.brand .seal{flex:none}
.brand b{display:block;font:700 clamp(38px,6.2vw,64px)/.9 var(--head);letter-spacing:-.02em}
.brand span{display:block;font-size:15px;color:#B9B6D3;margin-top:6px;font-family:var(--body)}
.mask .date{font:500 15px/1.3 var(--head);color:#B9B6D3;text-align:right}
.mask .date b{display:block;color:var(--washi);font-weight:600;font-size:17px}
.slit{background:var(--led);border-top:3px solid var(--ink);border-bottom:3px solid var(--ink)}
.slit ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap}
.slit a{display:block;font:600 17px/1 var(--head);text-decoration:none;color:var(--ink);padding:12px 16px}
.slit li:first-child a{padding-left:0}
.slit a:hover{text-decoration:underline;text-decoration-thickness:2px}
.slit a[aria-current="page"]{background:var(--ink);color:var(--led);padding-left:16px}
.mask-foot{height:14px;background:var(--ink)}
/* shared */
.tag{display:inline-block;font:600 14.5px/1 var(--head);color:var(--ink);background:var(--washi2);padding:6px 9px;text-decoration:none;clip-path:polygon(0 0,100% 0,calc(100% - 7px) 100%,0 100%);padding-right:14px}
a.tag:hover{background:var(--led);color:var(--ink)}
.tag.reviews{background:var(--ink);color:var(--washi)}.tag.industry{background:var(--steel);color:#fff}
.dek{font-size:20.5px;line-height:1.5;color:var(--ink2);margin:14px 0 0;max-width:54ch}
.meta{font:500 15px/1.3 var(--head);color:var(--ink2);margin-top:14px}
footer.site{margin-top:72px;background:var(--ink);color:#C9C6E0;padding:34px 0 48px;font-size:15.5px}
footer.site .cols{display:grid;grid-template-columns:2fr 1fr;gap:32px}
footer.site p{margin:0 0 10px;max-width:62ch}
footer.site a{color:var(--led)}footer.site a:hover{color:var(--washi)}
footer.site .fbrand{display:flex;align-items:center;gap:12px;font:700 28px/1 var(--head);color:var(--washi);margin-bottom:14px}
footer.site ul{list-style:none;margin:0;padding:0}footer.site li{margin-bottom:5px}
@media (max-width:720px){footer.site .cols{grid-template-columns:1fr}.mask .date{display:none}.brand .seal{width:48px;height:48px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

  const listCss = `
.rows{list-style:none;margin:0;padding:0}
.rows li{border-top:2px solid var(--ink)}
.rows li:last-child{border-bottom:2px solid var(--ink)}
.rows a.row{display:grid;grid-template-columns:120px minmax(0,1fr);gap:22px;padding:18px 0 20px;text-decoration:none;color:var(--ink)}
.rows time{font:600 15px/1.35 var(--head);color:var(--ink2);padding-top:4px}
.rows time b{display:block;font-size:26px;color:var(--ink);font-weight:700}
.rows h3{font-size:clamp(24px,2.6vw,30px);margin-top:10px}
.rows p{margin:8px 0 0;color:var(--ink2);font-size:17px;max-width:66ch}
.rows a.row:hover h3{color:var(--leddeep);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}
@media (max-width:620px){.rows a.row{grid-template-columns:1fr;gap:4px}.rows time b{display:inline;font-size:15px}}
`;

  const radarCss = `
.radar{list-style:none;margin:0;padding:0}
.radar li{display:grid;grid-template-columns:66px minmax(0,1fr);gap:14px;padding:12px 0;border-bottom:1px solid var(--steel)}
.radar li:first-child{border-top:1px solid var(--steel)}
.radar time{font:700 15px/1.1 var(--head);color:var(--ink);background:var(--washi2);text-align:center;padding:7px 4px;align-self:start}
.radar time span{display:block;font-size:24px}
.radar b{display:block;font:600 18.5px/1.2 var(--head)}
.radar b a{color:var(--ink)}.radar b a:hover{color:var(--leddeep)}
.radar small{display:block;font-size:15px;color:var(--ink2);margin-top:3px;line-height:1.4}
.radar li.today time{background:var(--led)}
`;

  const frontCss = `
.lead{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:48px;margin-top:36px;align-items:start}
.lead h2{font-size:clamp(40px,5.6vw,72px);margin-top:16px}
.lead h2 a{color:var(--ink);text-decoration:none}.lead h2 a:hover{color:var(--leddeep)}
.score{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;margin-top:26px;background:var(--ink);color:var(--washi);padding:18px 26px 18px 22px;clip-path:polygon(0 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%);max-width:560px}
.score b{font:700 92px/.85 var(--head);color:var(--led);letter-spacing:-.04em}
.score span{font-size:16.5px;line-height:1.45;color:#D7D5EA}
.side h2.h{font-size:28px;padding-bottom:10px;border-bottom:4px solid var(--ink);margin-bottom:0}
.side .more{margin-top:12px;font:600 16px var(--head)}
.block{margin-top:56px}
.block > header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:6px}
.block > header h2{font-size:clamp(30px,3.6vw,40px)}
.block > header a{font:600 16px var(--head)}
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:10px}
.trio a{display:block;text-decoration:none;color:var(--ink);border-top:6px solid var(--ink);padding-top:14px}
.trio a.reviews{border-color:var(--led)}.trio a.industry{border-color:var(--steel)}
.trio h3{font-size:25px;margin-top:10px}
.trio p{margin:8px 0 0;color:var(--ink2);font-size:16.5px}
.trio a:hover h3{color:var(--leddeep)}
@media (max-width:920px){.lead{grid-template-columns:1fr;gap:36px}.trio{grid-template-columns:1fr}}
@media (max-width:520px){.score{grid-template-columns:1fr;gap:8px}.score b{font-size:72px}}
`;

  const articleCss = `
.crumbs{font:500 15px var(--head);margin-top:24px;color:var(--ink2)}
.article{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:52px;margin-top:22px}
.article header h1{font-size:clamp(38px,5.4vw,66px);margin-top:16px}
.article .body{max-width:68ch;margin-top:30px}
.article .body h2{font-size:29px;margin:36px 0 10px}
.article .body p{margin:0 0 18px}
.article .body ul{margin:0 0 20px;padding-left:22px}.article .body li{margin-bottom:8px}
.article .body li::marker{color:var(--leddeep)}
aside.facts{align-self:start;position:sticky;top:18px;margin-top:6px}
.facts .box{background:var(--ink);color:var(--washi);padding:20px 22px 18px;clip-path:polygon(0 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%)}
.facts h2{font-size:23px;color:var(--led)}
.facts dl{margin:4px 0 0}
.facts dt{font:600 14.5px/1.2 var(--head);color:#B9B6D3;margin-top:14px}
.facts dd{margin:3px 0 0;font-size:16.5px;line-height:1.4}
.sources{margin-top:34px;border-top:2px solid var(--ink);padding-top:14px;font-size:16px}
.sources h2{font-size:22px!important;margin:0 0 6px!important}
.sources ul{padding-left:20px!important;margin:0!important}
.related{margin-top:56px}
.related > h2{font-size:32px;padding-bottom:10px;border-bottom:4px solid var(--ink)}
@media (max-width:920px){.article{grid-template-columns:1fr;gap:12px}aside.facts{position:static;order:-1;margin-top:22px}}
`;

  const sectionCss = `
.sechead{margin-top:40px;padding-bottom:20px}
.sechead h1{font-size:clamp(48px,8vw,96px);letter-spacing:-.025em}
.sechead p{font-size:20px;color:var(--ink2);margin:12px 0 0;max-width:58ch}
.month{font-size:30px;margin:44px 0 6px}
.empty{border:2px dashed var(--steel);padding:22px 24px;margin-top:10px}
.empty p{margin:0;max-width:62ch}
.srcline{margin-top:22px;font-size:15.5px;color:var(--ink2)}
.prose{max-width:68ch}.prose h2{font-size:29px;margin:34px 0 10px}.prose p{margin:0 0 18px}
`;

  const edition = content.edition;
  const urlOf = p => SITE + (p === "index.html" ? "" : p);
  const head = (title, desc, path, extra) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${urlOf(path)}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${extra && extra.includes('"NewsArticle"') ? "article" : "website"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${urlOf(path)}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#221E4F">
<link rel="icon" type="image/svg+xml" href="${favicon}">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="${SITE}feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap" rel="stylesheet">
${extra || ""}`;

  const masthead = current => `<a class="skip" href="#main">Skip to content</a>
<header class="mask">
  <div class="wrap top">
    <a class="brand" href="index.html" aria-label="${NAME}, front page">${seal(64, false)}<div><b>Robot Ninja</b><span>Video game news, fast and in plain English.</span></div></a>
    <div class="date"><b>${dayName(edition)}</b>${longDate(edition)}</div>
  </div>
  <nav class="slit" aria-label="Sections"><div class="wrap"><ul>${SECTIONS.map(s => `<li><a href="${s.file}"${s.id === current ? ' aria-current="page"' : ""}>${esc(s.name)}</a></li>`).join("")}</ul></div></nav>
  <div class="mask-foot"></div>
</header>`;

  const footer = `<footer class="site"><div class="wrap cols">
  <div><div class="fbrand">${seal(36, false)}Robot Ninja</div>
  <p>Independent video game news. We aren't affiliated with any publisher, developer or platform holder, and game names belong to their owners.</p>
  <p>Every story is written in our own words and links its sources. Spot a mistake? Corrections are part of the job; see <a href="about.html">About</a>.</p></div>
  <div><ul>${SECTIONS.map(s => `<li><a href="${s.file}">${esc(s.name)}</a></li>`).join("")}<li><a href="about.html">About Robot Ninja</a></li><li><a href="feed.xml">RSS feed</a></li></ul></div>
</div></footer>`;

  const renderBody = body => {
    const out = []; let list = null;
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("- ")) { (list = list || []).push(`<li>${esc(line.slice(2))}</li>`); continue; }
      if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
      out.push(line.startsWith("## ") ? `<h2>${esc(line.slice(3))}</h2>` : `<p>${esc(line)}</p>`);
    }
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("\n");
  };

  const page = (path, title, desc, current, extraCss, mainHtml, extraHead) =>
    head(title, desc, path, extraHead) + `
<style>${css}${extraCss || ""}</style>
</head>
<body>
${masthead(current)}
<main id="main" class="wrap">
${mainHtml}
</main>
${footer}
</body>
</html>
`;

  const tag = a => `<span class="tag ${a.section}">${esc(secById[a.section].name)}</span>`;
  const rows = list => `<ul class="rows">${list.map(a => `<li><a class="row" href="${a.slug}.html"><time datetime="${a.date}"><b>${shortDate(a.date)}</b> ${parts(a.date)[0]}</time><div>${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.dek)}</p></div></a></li>`).join("")}</ul>`;
  const radar = list => `<ul class="radar">${list.map(r => { const [,m,dd] = parts(r.date); const t = r.link ? `<a href="${r.link}.html">${esc(r.title)}</a>` : esc(r.title); return `<li${r.date === edition ? ' class="today"' : ""}><time datetime="${r.date}">${mon[m-1]}<span>${dd}</span></time><div><b>${t}</b><small>${esc(r.platforms)}${r.note ? ". " + esc(r.note) : ""}</small></div></li>`; }).join("")}</ul>`;
  const upcoming = content.releases.filter(r => r.date >= edition).sort((a,b) => a.date.localeCompare(b.date));

  const files = {};

  // Article pages
  for (const a of arts) {
    const sec = secById[a.section];
    const same = bySection(a.section).filter(x => x.slug !== a.slug);
    const more = same.concat(arts.filter(x => x.slug !== a.slug && x.section !== a.section)).slice(0, 3);
    const ld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: a.title, description: a.dek, datePublished: a.date, dateModified: a.updated || a.date, articleSection: sec.name, mainEntityOfPage: SITE + a.slug + ".html", author: { "@type": "Organization", name: NAME, url: SITE }, publisher: { "@type": "Organization", name: NAME, url: SITE } };
    const crumbsLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Front page", item: SITE }, { "@type": "ListItem", position: 2, name: sec.name, item: SITE + sec.file }, { "@type": "ListItem", position: 3, name: a.title, item: SITE + a.slug + ".html" }] };
    files[a.slug + ".html"] = page(a.slug + ".html", `${a.title} | ${NAME}`, a.dek, a.section, articleCss + listCss, `
<div class="crumbs"><a href="index.html">Front page</a> / <a href="${sec.file}">${esc(sec.name)}</a></div>
<div class="article">
  <article>
    <header>
      <a class="tag ${a.section}" href="${sec.file}">${esc(sec.name)}</a>
      <h1>${esc(a.title)}</h1>
      <p class="dek">${esc(a.dek)}</p>
      <div class="meta">By Robot Ninja staff, <time datetime="${a.date}">${longDate(a.date)}</time>${a.updated ? `. Updated <time datetime="${a.updated}">${longDate(a.updated)}</time>` : ""}</div>
    </header>
    <div class="body">
${renderBody(a.body)}
      <section class="sources" aria-label="Sources"><h2>Sources</h2><ul>${a.sources.map(s => `<li>${ext(s.url, s.name)}</li>`).join("")}</ul></section>
    </div>
  </article>
  <aside class="facts" aria-label="Key facts"><div class="box"><h2>Key facts</h2><dl>${(a.facts || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div></aside>
</div>
<section class="related" aria-label="More stories"><h2>More stories</h2>${rows(more)}</section>`,
      `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n<script type="application/ld+json">${JSON.stringify(crumbsLd).replace(/</g, "\\u003c")}</script>`);
  }

  // Section pages
  const secHead = s => `<div class="sechead"><h1>${esc(s.name)}</h1><p>${esc(s.blurb)}</p></div>`;
  for (const id of ["news", "reviews", "industry"]) {
    const s = secById[id], list = bySection(id);
    files[s.file] = page(s.file, `Video game ${s.name.toLowerCase()} | ${NAME}`, s.blurb, id, sectionCss + listCss, secHead(s) + (list.length ? rows(list) : `<div class="empty"><p>No stories here yet. Check the <a href="news.html">news</a> in the meantime.</p></div>`));
  }

  const rl = secById["releases"];
  files[rl.file] = page(rl.file, `Upcoming video game release dates | ${NAME}`, "Upcoming video game release dates for PS5, Xbox Series X|S, Nintendo Switch 2 and PC, updated as dates are confirmed.", "releases", sectionCss + radarCss, secHead(rl) + `
<div class="prose">${radar(upcoming)}</div>
<p class="srcline">Dates are for North America and can change. Sources: ${content.releaseSources.map(s => ext(s.url, s.name)).join(", ")}.</p>`);

  const ar = secById["archive"];
  const byMonth = {};
  for (const a of arts) { const k = a.date.slice(0, 7); (byMonth[k] = byMonth[k] || []).push(a); }
  files[ar.file] = page(ar.file, `Archive: every story | ${NAME}`, "Every Robot Ninja story, newest first.", "archive", sectionCss + listCss, secHead(ar) + Object.keys(byMonth).sort().reverse().map(k => { const [y, m] = k.split("-").map(Number); return `<h2 class="month">${months[m-1]} ${y}</h2>${rows(byMonth[k])}`; }).join(""));

  files["about.html"] = page("about.html", `About ${NAME}`, "Robot Ninja is an independent video game news site.", "", sectionCss, `
<div class="sechead"><h1>About Robot Ninja</h1><p>Independent video game news, written for players.</p></div>
<div class="prose">
<p>Robot Ninja covers the games industry: what's launching, what's been announced, how games are reviewing and what's happening at the studios that make them. We keep stories short and clear, and we say plainly when something is a report rather than a confirmed fact.</p>
<h2>How we write</h2>
<p>Every story is written by us, in our own words, from official announcements and public reporting, and every story links its sources. When a story changes, we update it and note the date. Old stories stay up in the <a href="archive.html">archive</a>.</p>
<h2>Corrections</h2>
<p>If we get something wrong, we fix it and say so on the story.</p>
<h2>Not affiliated</h2>
<p>We're independent. We aren't affiliated with or paid by any publisher, developer or platform holder, and all game names and trademarks belong to their owners.</p>
</div>`);

  files["404.html"] = page("404.html", `Page not found | ${NAME}`, "That page doesn't exist.", "", sectionCss, `
<div class="sechead"><h1>Page not found</h1><p>That page doesn't exist or has moved. Try the <a href="index.html">front page</a> or the <a href="archive.html">archive</a>.</p></div>`).replace(/href="(?!https?:|#|data:)([^"]+)"/g, 'href="/$1"');

  // Front page
  const lead = arts.find(a => a.slug === content.lead) || arts[0];
  const rest = arts.filter(a => a !== lead);
  const trio = rest.slice(0, 3);
  const latest = rest.slice(3);
  const call = content.leadCallout;
  const frontLd = { "@context": "https://schema.org", "@type": "WebSite", name: NAME, url: SITE, description: "Independent video game news." };
  files["index.html"] = page("index.html", `${NAME}: video game news, reviews and release dates`, "Independent video game news: launches, review roundups, industry stories and upcoming release dates for PlayStation, Xbox, Nintendo and PC.", "front", frontCss + listCss + radarCss, `
<section class="lead" aria-label="Top story">
  <div>
    <a class="tag ${lead.section}" href="${secById[lead.section].file}">${esc(secById[lead.section].name)}</a>
    <h2><a href="${lead.slug}.html">${esc(lead.title)}</a></h2>
    <p class="dek">${esc(lead.dek)}</p>
    <div class="meta"><time datetime="${lead.date}">${longDate(lead.date)}</time></div>
    ${call ? `<a class="score" href="${lead.slug}.html" style="text-decoration:none"><b>${esc(call.big)}</b><span>${esc(call.small)}</span></a>` : ""}
  </div>
  <aside class="side" aria-labelledby="radar-h">
    <h2 class="h" id="radar-h">Release radar</h2>
    ${radar(upcoming.slice(0, 6))}
    <div class="more"><a href="releases.html">Full release calendar</a></div>
  </aside>
</section>
<section class="block" aria-labelledby="top-h">
  <header><h2 id="top-h">Also today</h2></header>
  <div class="trio">${trio.map(a => `<a class="${a.section}" href="${a.slug}.html">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.dek)}</p></a>`).join("")}</div>
</section>
${latest.length ? `<section class="block" aria-labelledby="latest-h">
  <header><h2 id="latest-h">Latest</h2><a href="archive.html">Every story in the archive</a></header>
  ${rows(latest)}
</section>` : ""}`, `<script type="application/ld+json">${JSON.stringify(frontLd)}</script>`);

  // Feeds and SEO files
  const pages = ["index.html", ...SECTIONS.slice(1).map(s => s.file), "about.html", ...arts.map(a => a.slug + ".html")];
  const lastmod = p => { const a = arts.find(x => x.slug + ".html" === p); return a ? (a.updated || a.date) : edition; };
  files["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${urlOf(p)}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  files["feed.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n<title>${NAME}</title><link>${SITE}</link><description>Independent video game news.</description><language>en-us</language>\n<atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>\n${arts.slice(0, 30).map(a => `<item><title>${esc(a.title)}</title><link>${SITE}${a.slug}.html</link><guid>${SITE}${a.slug}.html</guid><pubDate>${rfc822(a.date)}</pubDate><category>${esc(secById[a.section].name)}</category><description>${esc(a.dek)}</description></item>`).join("\n")}\n</channel></rss>\n`;
  files["robots.txt"] = `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`;
  files["CNAME"] = "robot-ninja.com\n";
  files[".nojekyll"] = "";
  return files;
}

if (typeof module !== "undefined" && require.main === module) {
  const fs = require("fs"), path = require("path");
  const [src, out] = process.argv.slice(2);
  const files = buildSite(JSON.parse(fs.readFileSync(src, "utf8")));
  fs.mkdirSync(out, { recursive: true });
  for (const [f, c] of Object.entries(files)) fs.writeFileSync(path.join(out, f), c);
  console.log(Object.keys(files).length + " files written to " + out);
}
