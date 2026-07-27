/* Renders the portfolio from data/content.json
   Supports: section ordering & layouts (content.sections),
   inline formatting (**bold**, *italic*, [text](url)),
   custom sections with list or card entry styles. */
(async function () {
  const app = document.getElementById('app');

  let C;
  try {
    const res = await fetch('data/content.json', { cache: 'no-store' });
    C = await res.json();
  } catch (e) {
    app.innerHTML = '<div class="wrap" style="padding:140px 0"><p>Could not load site content. Please refresh.</p></div>';
    return;
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* inline formatting: escape first, then apply **bold**, *italic*, [text](url) */
  const fmt = s => esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

  const P = C.profile || {};

  const icons = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.2.67.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 1 9l4 2.18V15c0 .55.45 1 1 1h1v-3.9L12 15l11-6-11-6zm0 13.5L8.5 14.6v2.9c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5v-2.9L12 16.5z"/></svg>',
    orcid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zM7.37 4.6a.94.94 0 1 1 0 1.88.94.94 0 0 1 0-1.88zm-.72 3.04h1.44v10.09H6.65V7.64zm3.56 0h3.9c3.72 0 5.35 2.65 5.35 5.03 0 2.58-2.02 5.06-5.33 5.06h-3.92V7.64zm1.44 1.3v7.49h2.42c3.28 0 4.03-2.49 4.03-3.76 0-2.04-1.3-3.73-4.1-3.73h-2.35z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>'
  };

  const socialLinks = () => {
    let h = '';
    if (P.github) h += `<a href="${esc(P.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icons.github}</a>`;
    if (P.linkedin) h += `<a href="${esc(P.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icons.linkedin}</a>`;
    if (P.scholar) h += `<a href="${esc(P.scholar)}" target="_blank" rel="noopener" aria-label="Google Scholar">${icons.scholar}</a>`;
    if (P.orcid) h += `<a href="${esc(P.orcid)}" target="_blank" rel="noopener" aria-label="ORCID">${icons.orcid}</a>`;
    if (P.email) h += `<a href="mailto:${esc(P.email)}" aria-label="Email">${icons.mail}</a>`;
    return h;
  };

  const nameParts = (P.name || '').split(' ');
  const lastName = nameParts.pop();
  const firstNames = nameParts.join(' ');

  let html = '';
  let secNo = 0;
  const nextNum = () => '§ ' + String(++secNo).padStart(2, '0');
  const navItems = [];

  /* ---- hero (always first) ---- */
  html += `
  <header class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="eyebrow rv">${esc(P.tagline)}</span>
        <h1 class="rv">${esc(firstNames)}<br>${esc(lastName)}</h1>
        <p class="hero-fields rv">${esc(P.fields)}</p>
        <p class="hero-role rv"><strong>${esc(P.role)}</strong>${esc(P.institution)}</p>
        <div class="hero-cta rv">
          <a class="btn inverse solid" href="${esc(P.cv)}" target="_blank" rel="noopener">Download CV</a>
          <a class="btn inverse" href="#contact">Get in Touch</a>
        </div>
      </div>
      <figure class="hero-portrait rv">
        <img src="${esc(P.avatar)}" alt="${esc(P.name)}">
        <figcaption>fig. 01 — the researcher at work</figcaption>
      </figure>
    </div>
  </header>`;

  const LAYOUTS = ['ledger', 'stacked', 'centered'];
  const section = (id, title, body, layout) => {
    const cls = LAYOUTS.includes(layout) && layout !== 'ledger' ? ' layout-' + layout : '';
    return `
  <section class="section${cls}" id="${id}">
    <div class="wrap">
      <div class="section-head"></div>
      <div class="section-grid">
        <div class="section-label rv"><span class="num">${nextNum()}</span><h2>${title}</h2></div>
        <div class="section-body">${body}</div>
      </div>
    </div>
  </section>`;
  };

  /* ---------- built-in section body builders (return null when empty) ---------- */
  const BUILTIN = {};

  BUILTIN.news = { title: 'Research<br>Updates', nav: 'Updates', body(){
    if (!C.news || !C.news.length) return null;
    return C.news.map(n => `
      <div class="news-item rv">
        <span class="news-date">${esc(n.date)}</span>
        <div>
          <h3>${esc(n.title)}</h3>
          ${n.text ? `<p>${fmt(n.text)}</p>` : ''}
          ${n.link ? `<a class="textlink" href="${esc(n.link)}" target="_blank" rel="noopener">Read more</a>` : ''}
        </div>
      </div>`).join('');
  }};

  BUILTIN.about = { title: 'About', nav: 'About', body(){
    const A = C.about || {};
    return `
    <div class="about-grid">
      <div class="about-prose rv">${(A.paragraphs || []).map(p => `<p>${fmt(p)}</p>`).join('')}</div>
      <aside class="bio-card rv">
        <h3>Biographical Notes</h3>
        <div class="bio-row"><span class="k">Email</span><a href="mailto:${esc(P.email)}">${esc(P.email)}</a></div>
        <div class="bio-row"><span class="k">Phone</span>${esc(P.phone)}</div>
        <div class="bio-row"><span class="k">Address</span>${esc(P.address)}</div>
        ${(A.notes || []).map(n => `<div class="bio-row"><span class="k">${esc(n.label)}</span>${esc(n.value)}</div>`).join('')}
      </aside>
    </div>`;
  }};

  BUILTIN.publications = { title: 'Publications', nav: 'Publications', body(){
    if (!C.publications || !C.publications.length) return null;
    return C.publications.map(p => `
    <article class="pub rv">
      <span class="year">${esc(p.year)}</span>
      <div>
        <div class="pub-meta">
          <span class="tag">${esc(p.type)}</span>
          ${p.badge ? `<span class="tag badge">★ ${esc(p.badge)}</span>` : ''}
        </div>
        <h3>${esc(p.title)}</h3>
        <p class="venue">${esc(p.venue)}</p>
        <p class="abstract">${fmt(p.text)}</p>
        ${p.link ? `<a class="textlink" href="${esc(p.link)}" target="_blank" rel="noopener">Read the paper</a>` : ''}
      </div>
    </article>`).join('');
  }};

  BUILTIN.experience = { title: 'Experience', nav: 'Experience', body(){
    if (!C.experience || !C.experience.length) return null;
    return C.experience.map(e => `
    <div class="timeline-item rv">
      <span class="period">${esc(e.period)}</span>
      <h3>${esc(e.title)}</h3>
      <p class="org">${esc(e.org)}</p>
      <p class="desc">${fmt(e.text)}</p>
    </div>`).join('');
  }};

  BUILTIN.education = { title: 'Education', nav: null, body(){
    if (!C.education || !C.education.length) return null;
    return C.education.map(e => `
    <div class="timeline-item rv">
      <span class="period">${esc(e.period)}</span>
      <h3>${esc(e.degree)}</h3>
      <p class="org">${esc(e.org)}</p>
      ${e.result ? `<p class="result">${esc(e.result)}</p>` : ''}
      ${(e.activities && e.activities.length) ? `
        <div class="activities">
          <span class="eyebrow">Co-curricular</span>
          ${e.activities.map(a => `
            <div class="activity">
              <h4>${esc(a.title)}</h4>
              <span class="period">${esc(a.period)}</span>
              <p>${fmt(a.text)}</p>
            </div>`).join('')}
        </div>` : ''}
    </div>`).join('');
  }};

  BUILTIN.skills = { title: 'Skills', nav: null, body(){
    if (!C.skills || !C.skills.length) return null;
    return `
    <div class="skills-grid">
      ${C.skills.map(g => `
        <div class="skill-group rv">
          <h3>${esc(g.group)}</h3>
          ${(g.items || []).map(s => `<div class="skill-row"><span>${esc(s.name)}</span><span class="lvl">${esc(s.level)}</span></div>`).join('')}
        </div>`).join('')}
    </div>`;
  }};

  BUILTIN.courses = { title: 'Courses<br>Taught', nav: null, body(){
    if (!C.courses || !C.courses.length) return null;
    return `<div class="courses">${C.courses.map(c =>
      `<div class="course-row rv"><span>${esc(c.name)}</span><span class="mode">${esc(c.mode)}</span></div>`).join('')}</div>`;
  }};

  BUILTIN.projects = { title: 'Selected<br>Projects', nav: 'Projects', body(){
    if (!C.projects || !C.projects.length) return null;
    return C.projects.map(p => `
    <article class="project rv">
      <div class="project-media">
        ${p.mediaType === 'video'
          ? `<video src="${esc(p.media)}" autoplay muted loop playsinline></video>`
          : `<img src="${esc(p.media)}" alt="${esc(p.title)}" loading="lazy">`}
      </div>
      <div>
        <span class="tags">${esc(p.tags)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${fmt(p.text)}</p>
        ${p.link ? `<a class="textlink" href="${esc(p.link)}" target="_blank" rel="noopener">View on GitHub</a>` : ''}
      </div>
    </article>`).join('');
  }};

  BUILTIN.awards = { title: 'Awards &amp;<br>Scholarships', nav: null, body(){
    if (!C.awards || !C.awards.length) return null;
    return C.awards.map(a =>
      `<div class="award-row rv"><span class="t">${esc(a.title)}</span><span class="o">${esc(a.org)}</span></div>`).join('');
  }};

  BUILTIN.contact = { title: 'Contact', nav: 'Contact', body(){
    return `
    <div class="contact-grid">
      <div class="rv">
        <p class="contact-note">I welcome conversations about research collaborations, graduate study, and academic initiatives in computer vision and machine learning.</p>
        <a class="btn solid" href="mailto:${esc(P.email)}">Write to me</a>
      </div>
      <ul class="contact-list rv">
        <li><span class="k">Email</span><a href="mailto:${esc(P.email)}">${esc(P.email)}</a></li>
        <li><span class="k">Phone</span>${esc(P.phone)}</li>
        <li><span class="k">Address</span>${esc(P.address)}</li>
        ${P.linkedin ? `<li><span class="k">LinkedIn</span><a href="${esc(P.linkedin)}" target="_blank" rel="noopener">Profile</a></li>` : ''}
        ${P.orcid ? `<li><span class="k">ORCID</span><a href="${esc(P.orcid)}" target="_blank" rel="noopener">${esc(P.orcid.replace('https://orcid.org/', ''))}</a></li>` : ''}
        ${P.scholar ? `<li><span class="k">Scholar</span><a href="${esc(P.scholar)}" target="_blank" rel="noopener">Google Scholar</a></li>` : ''}
      </ul>
    </div>`;
  }};

  /* photography renders its own dark full-width shell */
  function renderPhotography(){
    const PH = C.photography || {};
    if (!PH.items || !PH.items.length) return '';
    navItems.push({ id: 'photography', label: 'Photography' });
    return `
  <section class="photo-section" id="photography">
    <div class="wrap">
      <div class="section-head"></div>
      <div class="section-grid">
        <div class="section-label rv"><span class="num">${nextNum()}</span><h2>Photography</h2></div>
        <div style="max-width:100%">
          <p class="photo-intro rv">${fmt(PH.intro)}</p>
          <div class="photo-grid">
            ${PH.items.map(p => `
              <figure class="rv" data-full="${esc(p.src)}">
                <img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy">
                <figcaption>${esc(p.caption)}</figcaption>
              </figure>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`;
  }

  /* ---------- custom sections ---------- */
  const customs = Array.isArray(C.custom) ? C.custom.filter(cs => cs && cs.title) : [];
  const customId = cs => cs.id || 'c-' + slug(cs.title);
  const usedIds = new Set(Object.keys(BUILTIN).concat(['photography', 'top']));

  function renderCustom(cs, layout){
    let id = customId(cs), n = 2;
    while (usedIds.has(id)) id = customId(cs) + '-' + (n++);
    usedIds.add(id);
    const entry = (en, showMeta) => `
      <div>
        ${showMeta && en.meta ? `<span class="entry-meta">${esc(en.meta)}</span>` : ''}
        <h3>${esc(en.title)}</h3>
        ${en.text ? `<p>${fmt(en.text)}</p>` : ''}
        ${en.image ? `<img class="entry-img" src="${esc(en.image)}" alt="${esc(en.title)}" loading="lazy">` : ''}
        ${en.link ? `<a class="textlink" href="${esc(en.link)}" target="_blank" rel="noopener">Read more</a>` : ''}
      </div>`;
    let entries;
    if (cs.style === 'cards'){
      entries = `<div class="cards-grid">${(cs.entries || []).map(en =>
        `<div class="card rv">${entry(en, true)}</div>`).join('')}</div>`;
    } else {
      entries = (cs.entries || []).map(en => `
      <div class="news-item rv">
        <span class="news-date">${esc(en.meta)}</span>
        ${entry(en, false)}
      </div>`).join('');
    }
    const body = (cs.intro ? `<p class="section-intro rv">${fmt(cs.intro)}</p>` : '') + entries;
    navItems.push({ id, label: cs.title });
    return section(id, esc(cs.title), body, layout);
  }

  /* ---------- ordering ---------- */
  const DEFAULT_ORDER = ['news','about','publications','experience','education','skills','courses','projects','awards']
    .concat(customs.map(customId)).concat(['photography','contact']);

  let cfg = Array.isArray(C.sections) ? C.sections.filter(s => s && s.id) : [];
  const present = new Set(cfg.map(s => s.id));
  DEFAULT_ORDER.forEach(id => { if (!present.has(id)) { cfg.push({ id, layout: 'ledger' }); present.add(id); } });

  cfg.forEach(sc => {
    if (sc.id === 'photography'){ html += renderPhotography(); return; }
    if (BUILTIN[sc.id]){
      const b = BUILTIN[sc.id];
      const body = b.body();
      if (body == null) return;
      if (b.nav) navItems.push({ id: sc.id, label: b.nav });
      html += section(sc.id, b.title, body, sc.layout);
      return;
    }
    const cs = customs.find(c => customId(c) === sc.id);
    if (cs) html += renderCustom(cs, sc.layout);
  });

  app.innerHTML = html;

  /* footer bits */
  document.getElementById('footSocial').innerHTML = socialLinks();
  document.getElementById('year').textContent = '© ' + new Date().getFullYear() + ' ' + (P.name || '');
  document.getElementById('brand').textContent = P.name || 'Portfolio';
  document.title = (P.name || 'Portfolio') + ' — ' + (P.tagline || '');

  /* nav rebuilt from rendered sections, in order */
  const links = document.getElementById('navLinks');
  links.innerHTML = navItems.map(n => `<li><a href="#${n.id}">${esc(n.label)}</a></li>`).join('');

  /* reveal on scroll */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* lightbox */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.photo-grid figure').forEach(f => {
    f.addEventListener('click', () => { lbImg.src = f.dataset.full; lb.classList.add('open'); });
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

  /* mobile nav */
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
})();
