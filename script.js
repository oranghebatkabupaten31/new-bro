document.addEventListener("DOMContentLoaded", () => {
  // Boot sequence: sengaja dibuat lebih lama (~6 detik) dengan log ala terminal
  const preloader = document.querySelector("#preloader");
  const progressBar = document.querySelector("#loader-progress");
  const progressText = document.querySelector("#loader-percent");
  const loaderLog = document.querySelector("#loader-log");
  const bootSteps = [
    [0, "kernel.init() ............ ok"],
    [12, "mount /ui/core ............ ok"],
    [26, "load fonts & assets ....... ok"],
    [41, "compile stylesheets ........ ok"],
    [57, "connect design-system ...... ok"],
    [72, "optimize animations ........ ok"],
    [88, "verify identity ............ ok"],
    [99, "ACCESS GRANTED"]
  ];
  let progress = 0, stepIndex = 0, stall = 0;
  const pushLog = text => {
    if (!loaderLog) return;
    const p = document.createElement("p");
    p.innerHTML = `<b>&gt;</b>${text}`;
    loaderLog.appendChild(p);
    while (loaderLog.children.length > 3) loaderLog.firstElementChild.remove();
  };
  const finishLoading = () => {
    window.setTimeout(() => {
      preloader?.classList.add("done");
      document.body.classList.remove("is-loading");
    }, 700);
  };
  const loadingTimer = window.setInterval(() => {
    if (stall > 0) { stall--; return; }
    if (Math.random() < 0.08) { stall = 2 + Math.floor(Math.random() * 4); return; } // jeda acak biar terasa "loading beneran"
    progress = Math.min(100, progress + 0.9 + Math.random() * 1.5);
    const shown = Math.floor(progress);
    while (stepIndex < bootSteps.length && shown >= bootSteps[stepIndex][0]) pushLog(bootSteps[stepIndex++][1]);
    if (progressBar) progressBar.style.width = `${shown}%`;
    if (progressText) progressText.textContent = `${String(Math.max(1, shown)).padStart(2, "0")}%`;
    if (progress >= 100) { window.clearInterval(loadingTimer); finishLoading(); }
  }, 80);

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  menuButton?.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(opened));
  });
  document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  // Scroll reveal
  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach(node => observer.observe(node));
  } else revealNodes.forEach(node => node.classList.add("visible"));

  // Scroll-spy: menu aktif mengikuti section yang sedang dilihat
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const spyTargets = navLinks.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spyTargets.forEach(t => spy.observe(t));
  }

  // Contact form opens the visitor's email app. Replace this address with yours.
  const contactForm = document.querySelector("#contact-form");
  contactForm?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent(`Portfolio message from ${data.get("name")}`);
    const body = encodeURIComponent(`Nama: ${data.get("name")}\nEmail: ${data.get("email")}\n\nPesan:\n${data.get("message")}`);
    const feedback = document.querySelector("#form-feedback");
    feedback.textContent = "Membuka aplikasi email kamu...";
    window.location.href = `mailto:emailkamu@example.com?subject=${subject}&body=${body}`;
  });

  // Guestbook demo: comments are displayed in this browser only (not stored on a server).
  const commentForm = document.querySelector("#comment-form");
  const commentList = document.querySelector("#comment-list");
  const imageInput = document.querySelector("#comment-image");
  const fileName = document.querySelector("#file-name");
  const imagePreview = document.querySelector("#image-preview");
  let selectedImage = "";
  imageInput?.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    selectedImage = "";
    imagePreview.innerHTML = "";
    fileName.textContent = file ? file.name : "Optional · JPG / PNG";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      fileName.textContent = "File terlalu besar (maks. 2 MB)";
      imageInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      selectedImage = String(reader.result);
      const img = document.createElement("img");
      img.src = selectedImage;
      img.alt = "Preview gambar komentar";
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  commentForm?.addEventListener("submit", event => {
    event.preventDefault();
    const name = commentForm.elements["comment-name"].value.trim();
    const message = commentForm.elements["comment-text"].value.trim();
    if (!name || !message) return;
    const empty = commentList.querySelector(".empty-comments");
    empty?.remove();

    const item = document.createElement("article");
    item.className = "comment-item";
    const heading = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = name;
    const time = document.createElement("time");
    time.textContent = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    heading.append(strong, time);
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    item.append(heading, paragraph);
    if (selectedImage) {
      const img = document.createElement("img");
      img.src = selectedImage;
      img.alt = "Gambar yang diunggah pada komentar";
      item.appendChild(img);
    }
    commentList.prepend(item);
    commentForm.reset();
    selectedImage = "";
    imagePreview.innerHTML = "";
    fileName.textContent = "Optional · JPG / PNG";
  });



  // ===== Role typing (mengetik & menghapus bergantian) =====
  const roleEl = document.querySelector("#role-text");
  if (roleEl) {
    const roles = ["Information Technology Enthusiast", "Network Engineering", "Junior Cyber Security", "Software & Hardware Engineering", "IT Support", "Junior Front-End Developer"];
    let ri = 0, ci = roles[0].length, deleting = true;
    const typeStep = () => {
      const word = roles[ri];
      ci += deleting ? -1 : 1;
      roleEl.textContent = word.slice(0, ci);
      let delay = deleting ? 45 : 85;
      if (!deleting && ci === word.length) { deleting = true; delay = 1700; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
      window.setTimeout(typeStep, delay);
    };
    window.setTimeout(typeStep, 3200);
  }

  // ===== Counter statistik naik dari 0 =====
  const statsGrid = document.querySelector(".stats-grid");
  if (statsGrid && "IntersectionObserver" in window) {
    const nums = [...statsGrid.querySelectorAll("strong")];
    const targets = nums.map(n => parseInt(n.textContent, 10) || 0);
    nums.forEach(n => (n.textContent = "00"));
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const run = now => {
        const k = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - k, 3);
        nums.forEach((n, i) => (n.textContent = String(Math.round(targets[i] * e)).padStart(2, "0")));
        if (k < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, { threshold: 0.4 }).observe(statsGrid);
  }

  // ===== Latency HUD yang terus berubah =====
  const latency = document.querySelector("#hud-latency");
  if (latency) window.setInterval(() => { latency.textContent = `${8 + Math.floor(Math.random() * 14)}ms`; }, 1100);

  // ===== Floating IT tokens (kode, ikon CPU/server/database, dll.) =====
  const floaters = document.querySelector("#it-floaters");
  if (floaters) {
    const tokens = ["</>", "{ }", "01", "=>", "&&", "0xFF", "git push", "npm i", "<div>", "sudo", "404", "API", "SQL", "fn()", "$ _", "UTF-8", "#!/bin", "::", "[]", "200 OK", "const", "async", "</html>", "ctrl+c", "0110"];
    const icons = [
      '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="10" y="10" width="4" height="4"/></svg>',
      '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/></svg>',
      '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
      '<svg viewBox="0 0 24 24"><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/></svg>',
      '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
      '<svg viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M8 21h8M12 18v3M7 9l3 2-3 2M12 13h4"/></svg>'
    ];
    const rand = (a, b) => a + Math.random() * (b - a);
    const count = window.innerWidth < 700 ? 12 : 24;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      const isIcon = i % 4 === 0;
      el.className = "it-f" + (!isIcon && i % 3 === 0 ? " chip" : "");
      if (isIcon) el.innerHTML = icons[(i / 4) % icons.length | 0];
      else el.textContent = tokens[Math.floor(Math.random() * tokens.length)];
      el.style.setProperty("--x", `${rand(2, 96).toFixed(1)}%`);
      el.style.setProperty("--fs", isIcon ? `${rand(22, 38).toFixed(0)}px` : `${rand(10, 17).toFixed(0)}px`);
      el.style.setProperty("--a", rand(0.07, 0.2).toFixed(2));
      el.style.setProperty("--dur", `${rand(20, 38).toFixed(1)}s`);
      el.style.setProperty("--del", `-${rand(0, 38).toFixed(1)}s`);
      el.style.setProperty("--dx", `${rand(-70, 70).toFixed(0)}px`);
      el.style.setProperty("--r0", `${rand(-12, 0).toFixed(0)}deg`);
      el.style.setProperty("--r1", `${rand(0, 14).toFixed(0)}deg`);
      floaters.appendChild(el);
    }
  }

  // ===== Canvas: jaringan node + data packet + hujan biner/hex =====
  const canvas = document.querySelector("#it-canvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -999, y: -999 };
    let W = 0, H = 0, dpr = 1, nodes = [], cols = [], packets = [];
    const glyphs = "01010101ABCDEF{}<>/;=+#$%".split("");
    const FS = 12, LINK = 135;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(26, Math.min(70, Math.round((W * H) / 24000)));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1 + Math.random() * 1.4 }));
      const colCount = Math.floor(W / 34);
      cols = Array.from({ length: colCount }, (_, i) => ({ x: i * 34 + 10, y: Math.random() * H, v: .6 + Math.random() * 1.6, len: 8 + Math.floor(Math.random() * 10), on: Math.random() < .45 }));
      packets = [];
    };

    const frame = t => {
      ctx.clearRect(0, 0, W, H);
      // hujan kode
      ctx.font = `${FS}px "DM Mono", monospace`;
      for (const c of cols) {
        if (!c.on) { if (Math.random() < .002) c.on = true; continue; }
        c.y += c.v;
        if (c.y - c.len * FS > H) { c.y = -Math.random() * 200; c.v = .6 + Math.random() * 1.6; c.on = Math.random() < .8; }
        for (let k = 0; k < c.len; k++) {
          const a = (1 - k / c.len) * (k === 0 ? .26 : .10);
          ctx.fillStyle = `rgba(190,170,255,${a.toFixed(3)})`;
          ctx.fillText(glyphs[(Math.floor(t / 140) + k * 7 + c.x) % glyphs.length | 0], c.x, c.y - k * FS);
        }
      }
      // node & garis
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(190,170,255,${((1 - d / LINK) * .16).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (!reduce && packets.length < 14 && Math.random() < .0012) packets.push({ a, b, k: 0, s: .012 + Math.random() * .02 });
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 190) {
          ctx.strokeStyle = `rgba(190,170,255,${((1 - dm / 190) * .4).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(190,170,255,.55)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
      // data packet yang berjalan di sepanjang garis
      packets = packets.filter(p => (p.k += p.s) < 1);
      for (const p of packets) {
        const x = p.a.x + (p.b.x - p.a.x) * p.k, y = p.a.y + (p.b.y - p.a.y) * p.k;
        ctx.fillStyle = "#e4d9ff"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 10;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        ctx.shadowBlur = 0;
      }
      if (!reduce) requestAnimationFrame(frame);
    };

    build();
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    window.addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
    requestAnimationFrame(frame);
  }

  // ===== ID card di tali fisika: tarik kartu / tali, klik untuk membalik =====
  const idWorld = document.querySelector("#idc-world");
  const idHang = document.querySelector("#idc-hang");
  const idCard = document.querySelector("#idc-card");
  const rEdge = document.querySelector("#rope-edge"), rFill = document.querySelector("#rope-fill"), rStitch = document.querySelector("#rope-stitch");
  if (idWorld && idHang && idCard) {
    // barcode deterministik
    document.querySelectorAll(".idc-barcode").forEach(svg => {
      const vb = svg.viewBox.baseVal;
      let seed = Number(svg.dataset.seed) || 1;
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      let x = 0, html = "";
      while (x < vb.width) {
        const w = 0.9 + Math.floor(rnd() * 3) * 0.9;
        if (x + w > vb.width) break;
        html += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${vb.height}"/>`;
        x += w + 0.9 + Math.floor(rnd() * 3) * 0.7;
      }
      svg.innerHTML = html;
    });

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 9, L = 100, SEG = L / (N - 1), GRAV = 0.5, DAMP = 0.994;
    let ropeStretch = 1;
    let W = 0, S = 0.82, ax = 0, ay = -50;
    const nodes = Array.from({ length: N }, () => ({ x: 0, y: 0, px: 0, py: 0, im: 1 }));
    nodes[0].im = 0; nodes[N - 1].im = 0.45;
    const grab = { on: false, ox: 0, oy: 0, tx: 0, ty: 0, sx: 0, sy: 0, lastX: 0, moved: 0 };
    const flip = { ry: 0, v: 0, target: 0 };
    let ang = 0, angV = 0, visible = true, last = performance.now(), acc = 0;

    const measure = () => {
      const r = idWorld.getBoundingClientRect();
      const newAx = r.width / 2;
      const shift = newAx - ax;
      W = r.width;
      S = parseFloat(getComputedStyle(idWorld).getPropertyValue("--s")) || 0.82;
      if (ax && shift) nodes.forEach(n => { n.x += shift; n.px += shift; });
      ax = newAx;
      rEdge.style.strokeWidth = (31 * S).toFixed(1);
      rFill.style.strokeWidth = (27.5 * S).toFixed(1);
    };
    measure();
    // posisi awal: kartu terayun dari kanan supaya ada gerakan masuk
    const theta = reduceMotion ? 0 : 0.95;
    nodes.forEach((n, i) => { n.x = n.px = ax + Math.sin(theta) * SEG * i; n.y = n.py = ay + Math.cos(theta) * SEG * i; });
    flip.ry = reduceMotion ? 0 : -140;
    let resizeT; window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(measure, 120); });

    const toWorld = e => { const r = idWorld.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const beginPull = e => {
      const [wx, wy] = toWorld(e), end = nodes[N - 1];
      Object.assign(grab, { on: true, moved: 0, sx: wx, sy: wy, lastX: wx, ox: end.x - wx, oy: end.y - wy, tx: end.x, ty: end.y });
      flip.v *= 0.3;
      idHang.classList.add("is-grabbing");
      idHang.setPointerCapture?.(e.pointerId);
    };
    idHang.addEventListener("pointerdown", beginPull);
    const ropeHit = document.querySelector("#rope-hit");
    ropeHit?.addEventListener("pointerdown", beginPull);
    idHang.addEventListener("pointermove", e => {
      if (!grab.on) return;
      const [wx, wy] = toWorld(e);
      grab.tx = wx + grab.ox; grab.ty = wy + grab.oy;
      grab.moved = Math.max(grab.moved, Math.hypot(wx - grab.sx, wy - grab.sy));
      if (grab.moved > 5) flip.v = clamp(flip.v + (wx - grab.lastX) * 0.07, -9, 9);
      grab.lastX = wx;
    });
    const release = () => {
      if (!grab.on) return;
      grab.on = false;
      idHang.classList.remove("is-grabbing");
      flip.target = grab.moved < 6 ? Math.round(flip.ry / 180) * 180 + 180 : Math.round((flip.ry + flip.v * 8) / 180) * 180;
    };
    idHang.addEventListener("pointerup", release);
    idHang.addEventListener("pointercancel", release);
    idCard.addEventListener("keydown", e => {
      const end = nodes[N - 1];
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip.target = Math.round(flip.ry / 180) * 180 + 180; }
      if (e.key === "ArrowLeft") end.x -= 28;
      if (e.key === "ArrowRight") end.x += 28;
      if (e.key === "ArrowDown") end.y += 24;
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(idWorld);

    const step = now => {
      if (!grab.on) ropeStretch += (1 - ropeStretch) * 0.035;
      const wind = reduceMotion ? 0 : Math.sin(now * 0.0011) * 0.012;
      for (let i = 1; i < N; i++) {
        const n = nodes[i];
        if (grab.on && i === N - 1) continue;
        const vx = (n.x - n.px) * DAMP, vy = (n.y - n.py) * DAMP;
        n.px = n.x; n.py = n.y;
        n.x += vx + wind * i; n.y += vy + GRAV * (i === N - 1 ? 1.8 : 1);
      }
      if (grab.on) {
        const e = nodes[N - 1];
        let tx = grab.tx, ty = grab.ty;
        const dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy), max = L * 2.55;
        ropeStretch += (clamp(d / L, 1, 1.75) - ropeStretch) * 0.18;
        if (d > max) { tx = ax + dx / d * max; ty = ay + dy / d * max; }
        e.px = e.x; e.py = e.y;
        e.x += (tx - e.x) * 0.45; e.y += (ty - e.y) * 0.45;
      }
      for (let it = 0; it < 16; it++) {
        nodes[0].x = ax; nodes[0].y = ay;
        for (let i = 0; i < N - 1; i++) {
          const a = nodes[i], b = nodes[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-4;
          const targetSeg = SEG * ropeStretch;
          const diff = (d - targetSeg) / d;
          const wa = a.im, wb = (grab.on && i + 1 === N - 1) ? 0 : b.im, ws = wa + wb;
          if (!ws) continue;
          a.x += dx * diff * wa / ws; a.y += dy * diff * wa / ws;
          b.x -= dx * diff * wb / ws; b.y -= dy * diff * wb / ws;
        }
      }
    };

    const render = now => {
      const e = nodes[N - 1], p = nodes[N - 3];
      const target = clamp(Math.atan2(-(e.x - p.x), e.y - p.y), -1.3, 1.3);
      angV += (target - ang) * 0.14; angV *= 0.8; ang += angV;
      // balik depan/belakang
      if (!grab.on) flip.v += (flip.target - flip.ry) * 0.06;
      flip.v *= grab.on ? 0.92 : 0.85;
      flip.ry += flip.v;
      idHang.style.transform = `translate(${e.x.toFixed(2)}px,${e.y.toFixed(2)}px) rotate(${ang.toFixed(4)}rad) scale(${S}) translate(-135px,58px)`;
      idCard.style.transform = `rotateY(${flip.ry.toFixed(2)}deg)`;
      idCard.style.setProperty("--shine", `${(50 - (((flip.ry % 360) + 360) % 360 - 180) * 0.35).toFixed(1)}%`);
      let d = `M${ax.toFixed(1)} ${ay - 260} L${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`;
      for (let i = 1; i < N - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        d += ` Q${a.x.toFixed(1)} ${a.y.toFixed(1)} ${((a.x + b.x) / 2).toFixed(1)} ${((a.y + b.y) / 2).toFixed(1)}`;
      }
      d += ` L${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
      rEdge.setAttribute("d", d); rFill.setAttribute("d", d); rStitch.setAttribute("d", d);
    };

    const tick = now => {
      requestAnimationFrame(tick);
      if (!visible) { last = now; return; }
      acc += Math.min(50, now - last); last = now;
      let guard = 0;
      while (acc >= 16.67 && guard++ < 3) { step(now); acc -= 16.67; }
      render(now);
    };
    requestAnimationFrame(tick);
  }

  // ===== Galeri screenshot project (auto-rotate) + lightbox =====
  document.querySelectorAll(".shot-frame").forEach(frame => {
    const imgs = [...frame.querySelectorAll(".shot-stage img")], dots = [...frame.querySelectorAll(".shot-dots i")];
    let k = 0, hold = false;
    const show = i => { k = i; imgs.forEach((im, j) => im.classList.toggle("on", j === k)); dots.forEach((d, j) => d.classList.toggle("on", j === k)); };
    frame.addEventListener("pointerenter", () => { hold = true; });
    frame.addEventListener("pointerleave", () => { hold = false; });
    dots.forEach((d, j) => d.addEventListener("click", () => show(j)));
    window.setInterval(() => { if (!hold && imgs.length > 1) show((k + 1) % imgs.length); }, 3200);
  });
  const lightbox = document.querySelector("#lightbox");
  if (lightbox) {
    const lbImg = lightbox.querySelector("img");
    const close = () => { lightbox.hidden = true; document.body.style.overflow = ""; };
    document.addEventListener("click", e => {
      const target = e.target.closest?.("[data-zoom]");
      if (target) { lbImg.src = target.currentSrc || target.src; lbImg.alt = target.alt || ""; lightbox.hidden = false; document.body.style.overflow = "hidden"; }
    });
    lightbox.addEventListener("click", close);
    window.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  // ===== Salin username (Discord) =====
  document.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
    const mark = btn.querySelector(".copy-mark"), old = mark?.textContent;
    try { await navigator.clipboard.writeText(btn.dataset.copy); if (mark) mark.textContent = "COPIED"; }
    catch { if (mark) mark.textContent = btn.dataset.copy; }
    window.setTimeout(() => { if (mark) mark.textContent = old; }, 1600);
  }));

  // Cursor-following light and subtle 3D hover tilt
  if (window.matchMedia("(pointer:fine)").matches) {
    const aura = document.querySelector(".cursor-aura");
    window.addEventListener("pointermove", event => {
      if (aura) aura.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    }, { passive: true });

    document.querySelectorAll(".stat-card, .edu-card, .doc-card, .comp-card, .tech-item, .cert-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(800px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }
});
