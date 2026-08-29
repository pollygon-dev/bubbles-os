/* =======================================================
   Bubbles OS.

   You should not need to touch this file at all, unless needed. ^_^
   ======================================================= */

// Shows up in every window's status bar. Rename your OS here.
const OS_NAME = "Bubbles OS";

//   --w7-w-bg   : the window colour = title-bar / Aero frame
//   --w7-surface: the window-body content background
const FRAME      = "#8ed2ef";  // active title bar (Aero glass blue)
const FRAME_BLUR = "#c8e4ee";  // inactive (blurred) title bar
const SURFACE    = "#f3fbfe";  // pale sky-tinted window body
const OUTLINE    = "#2c7ea3";  // window border

/* Every window signs itself up from index.html, so adding one never means
   touching this file. Each <section data-tpl="..."> in the templates block
   can carry:

       data-title   what the title bar says      (default: the data-tpl name)
       data-icon    a Boxicons name or a picture (default: a plain window icon)
       data-w       how wide it opens            (default: 520)
       data-h       how tall it opens            (default: 460)

   Add a section, give it a desktop icon, and that is the whole job. */
const WINDOWS = {};
document.querySelectorAll("#templates [data-tpl]").forEach((sec) => {
  const key = sec.dataset.tpl;
  WINDOWS[key] = {
    title: sec.dataset.title || key,
    icon:  sec.dataset.icon  || "bxs-window-alt",
    w: Number(sec.dataset.w) || 520,
    h: Number(sec.dataset.h) || 460,
  };
});

// Window icons can be a Boxicons name ("bxs-star") or a picture in your
// assets folder ("assets/icons/blog.png"). This works out which you meant.
const bx = (icon) => /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(icon || "")
  ? `<img class="win-ico" src="${icon}" alt="">`
  : `<i class="bx ${icon}"></i>`;

// Track open windows so a second click focuses instead of duplicating.
// Each record: { win, node, min }
const openWindows = {};      // key -> record
let cascade = 0;             // offset for staggered placement


/* =======================================================
   Boot screen: the Windows 7 logon look
   Held on screen for a minimum beat so it doesn't just flash,
   and hard-capped so a slow asset can never trap the visitor
   behind it. Tune the two constants below.
   ======================================================= */
const BOOT_MIN_MS = 1700;   // shortest time the boot screen stays up
const BOOT_MAX_MS = 7000;   // longest, no matter what the network does
const bootStarted = Date.now();
let bootHidden = false;

function hideBoot() {
  if (bootHidden) return;
  bootHidden = true;
  const el = document.getElementById("boot");
  if (!el) return;
  el.classList.add("boot-done");
  el.addEventListener("transitionend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 1000);   // fallback if the transition never fires
}

// How long we still owe the boot screen before it may go away.
const bootRemaining = () => Math.max(0, BOOT_MIN_MS - (Date.now() - bootStarted));

setTimeout(hideBoot, BOOT_MAX_MS);

const desktopEl = document.getElementById("desktop");

/* =======================================================
   Responsive window geometry
   ======================================================= */
const MOBILE_MQ = window.matchMedia("(max-width: 640px)");
const isMobile = () => MOBILE_MQ.matches;

/* Where a freshly-spawned window goes.
   Phone: fills the desktop like a maximized app, because a 620px window can't
   cascade onto a 375px screen. Desktop: the design size, clamped to the
   desktop, with the cascade offset held back so the whole frame stays
   on screen. */
function windowGeometry(def) {
  const dw = desktopEl.clientWidth, dh = desktopEl.clientHeight;

  if (isMobile()) {
    const m = 4;
    return { w: dw - m * 2, h: dh - m * 2, x: m, y: m };
  }

  const w = Math.min(def.w, dw - 20);
  const h = Math.min(def.h, dh - 20);
  const offset = (cascade++ % 6) * 28;
  return {
    w, h,
    x: Math.max(10, Math.min(80 + offset, dw - w - 10)),
    y: Math.max(10, Math.min(40 + offset, dh - h - 10)),
  };
}

/* Keep open windows inside the desktop when the viewport changes: rotation,
   mobile browser chrome collapsing, or a resized desktop window. */
let reflowRaf = 0;
function reflowWindows() {
  reflowRaf = 0;
  const dw = desktopEl.clientWidth, dh = desktopEl.clientHeight;
  const mobile = isMobile();

  Object.values(openWindows).forEach((rec) => {
    const win = rec.win;
    if (rec.min || win.max) return;          // minimized/maximized manage themselves

    if (mobile) {
      win.resize(dw - 8, dh - 8).move(4, 4);
      rec.mobile = true;
      return;
    }
    // Crossed back over the breakpoint (a phone rotated to landscape): give the
    // window its design size back instead of leaving it phone-shaped.
    if (rec.mobile) {
      rec.mobile = false;
      const w = Math.min(rec.def.w, dw - 20);
      const h = Math.min(rec.def.h, dh - 20);
      win.resize(w, h).move(
        Math.max(10, Math.round((dw - w) / 2)),
        Math.max(10, Math.round((dh - h) / 2))
      );
      return;
    }
    const w = Math.min(win.width, dw - 20);
    const h = Math.min(win.height, dh - 20);
    if (w !== win.width || h !== win.height) win.resize(w, h);
    win.move(
      Math.max(0, Math.min(win.x, dw - w)),
      Math.max(0, Math.min(win.y, dh - h))
    );
  });
}
window.addEventListener("resize", () => {
  if (!reflowRaf) reflowRaf = requestAnimationFrame(reflowWindows);
});

/* ---------- Build an authentic 7.css window element ---------- */
function build7Window(key, def, content) {
  const win = document.createElement("div");
  win.className = "window active";
  // The documented pink override: redefine 7.css's own variables inline.
  win.style.setProperty("--w7-w-bg", FRAME);      // pink title bar / frame
  win.style.setProperty("--w7-surface", SURFACE); // pale pink body
  win.style.setProperty("--w7-w-bd", OUTLINE);         // dusty-purple outline

  win.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">${bx(def.icon)}&nbsp;${def.title}</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body"></div>
    <div class="status-bar">
      <p class="status-bar-field">Ready</p>
      <p class="status-bar-field">${OS_NAME}</p>
      <p class="status-bar-field">C:\\Bubbles\\${def.title}</p>
    </div>`;

  win.querySelector(".window-body").appendChild(content);
  return win;
}

/* Focus an already-open window; returns true if it existed. */
function focusIfOpen(key) {
  const rec = openWindows[key];
  if (!rec) return false;
  rec.win.show(); rec.win.focus(); rec.min = false; setActiveTask(key);
  return true;
}

/* Core window spawner. Wraps a content node in a 7.css window via WinBox.
   Returns the record. Assumes the window isn't already open. */
function spawnWindow(key, def, content) {
  const node = build7Window(key, def, content);
  const g = windowGeometry(def);

  const win = new WinBox({
    title: def.title,
    root: desktopEl,
    class: "seven",
    width: g.w,
    height: g.h,
    x: g.x,
    y: g.y,
    minwidth: Math.min(300, g.w),
    minheight: Math.min(220, g.h),
    border: 0,
    background: "transparent",
    mount: node,
    onfocus: () => {
      node.classList.add("active");
      node.style.setProperty("--w7-w-bg", FRAME);
      setActiveTask(key);
    },
    onblur: () => {
      node.classList.remove("active");
      node.style.setProperty("--w7-w-bg", FRAME_BLUR);
    },
    onclose: () => { removeTask(key); delete openWindows[key]; return false; },
  });

  const root = node.closest(".winbox") || win.window;
  // `def` and `mobile` are kept so reflowWindows() can restore the design
  // size when the viewport grows back past the phone breakpoint.
  const rec = { win, node, root, min: false, def, mobile: isMobile() };
  openWindows[key] = rec;

  wireTitleBar(rec, key, def);
  addTask(key, def);
  setActiveTask(key);
  return rec;
}

/* ---------- Open / focus a registry window ---------- */
function openWindow(key) {
  const def = WINDOWS[key];
  if (!def) {
    // Usually a desktop icon or menu row pointing at a window that is not there.
    console.warn(`[Bubbles] No window called "${key}". Check that a <section data-tpl="${key}"> exists in index.html.`);
    return;
  }
  if (focusIfOpen(key)) return;

  const tpl = document.querySelector(`#templates [data-tpl="${key}"]`);
  const content = tpl.cloneNode(true);
  content.removeAttribute("data-tpl");
  spawnWindow(key, def, content);

  wire(key, content);                    // behaviour only, the text lives in index.html
  wireInnerButtons(content);
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
}
function escAttr(s) {
  return String(s == null ? "" : s).replace(/["'&<>]/g, (m) => ({ '"': "&quot;", "'": "&#39;", "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
}
/* True for anything that should render as an image rather than an emoji:
   a full URL, or a local path like "assets/thumb.png". */
const isUrl = (s) => /^https?:\/\//i.test(s || "") || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(s || "");

function hideStatusBar(node) {
  const sb = node.closest(".window") && node.closest(".window").querySelector(".status-bar");
  if (sb) sb.style.display = "none";
}
function setDetails(node, iconHtml, title, sub) {
  const d = node.querySelector('[data-fill="details"]');
  if (!d) return;
  d.innerHTML = `<div class="ex-dico">${iconHtml}</div>
    <div class="ex-dinfo"><b>${esc(title)}</b><div>${esc(sub)}</div></div>`;
}

/* =======================================================
   Window wiring

   The content of every window is written directly in index.html.
   Nothing here invents text. These functions only add behaviour to
   markup that's already in index.html: the search box, the lightbox,
   and the About window's side buttons.
   ======================================================= */

function wire(key, node) {
  if (key === "about")        wireAbout(node);
  else if (key === "gallery") wireGallery(node);
  // Blog, Links and Credits are plain HTML. Nothing to wire up.
}

/* ---------- About: sidebar scrolls to a section, and follows scrolling ---------- */
function wireAbout(node) {
  const content = node.querySelector("[data-ab-content]");
  if (!content) return;

  node.querySelectorAll(".ab7-navlink").forEach((link) => {
    link.addEventListener("click", () => {
      node.querySelectorAll(".ab7-navlink").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const target = content.querySelector(`[data-sec="${link.dataset.scroll}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  content.addEventListener("scroll", () => {
    const secs = [...content.querySelectorAll(".ab7-section")];
    let current = secs[0];
    for (const s of secs) if (s.offsetTop - content.scrollTop <= 40) current = s;
    node.querySelectorAll(".ab7-navlink").forEach((l) =>
      l.classList.toggle("active", current && l.dataset.scroll === current.dataset.sec));
  });
}

/* ---------- Projects: folders built from the cards' own tags ---------- */
/* ---------- Gallery: lightbox, counts, search ---------- */
function wireGallery(node) {
  const grid = node.querySelector(".gallery-grid");
  const hdr = node.querySelector('[data-ex="hdr"]');
  if (!grid) return;

  hideStatusBar(node);
  const tiles = [...grid.querySelectorAll(".art")];
  const photos = (n) => `${n} photo${n === 1 ? "" : "s"}`;

  tiles.forEach((tile) => {
    const img = tile.querySelector("img");
    const caption = tile.dataset.caption || (img && img.alt) || "";
    if (img) tile.addEventListener("click", () => openLightbox(img.getAttribute("src"), caption));
    if (caption && !tile.getAttribute("title")) tile.setAttribute("title", caption);
  });

  if (hdr) hdr.textContent = `Gallery (${tiles.length})`;
  setDetails(node, `<i class="bx bxs-image"></i>`, "Gallery", photos(tiles.length));

  const search = node.querySelector('[data-ex="search"]');
  if (search) search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    let shown = 0;
    tiles.forEach((tile) => {
      const hay = ((tile.dataset.caption || "") + " " + tile.textContent).toLowerCase();
      const hit = hay.includes(q);
      tile.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    setDetails(node, `<i class="bx bxs-image"></i>`, "Search results", photos(shown));
  });
}

/* ---------- Wire the 7.css title-bar to WinBox behaviour ---------- */
function wireTitleBar(rec, key, def) {
  const { win, node } = rec;
  const bar = node.querySelector(".title-bar");
  const [btnMin, btnMax, btnClose] = node.querySelectorAll(".title-bar-controls button");

  // Bring to front on any interaction.
  node.addEventListener("mousedown", () => win.focus());

  // Minimize -> hide the window, keep the taskbar button.
  btnMin.addEventListener("click", (e) => {
    e.stopPropagation();
    win.hide();
    rec.min = true;
    setActiveTask(null);
  });

  // Maximize / Restore toggle.
  btnMax.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMax(rec, btnMax);
  });

  // Close.
  btnClose.addEventListener("click", (e) => {
    e.stopPropagation();
    win.close();
  });

  // Double-click the bar toggles maximize (classic Windows behaviour).
  bar.addEventListener("dblclick", (e) => {
    if (e.target.closest(".title-bar-controls")) return;
    toggleMax(rec, btnMax);
  });

  // Start dragging by the 7.css title bar (handled by the global manager).
  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".title-bar-controls")) return;
    if (win.max) return;               // don't drag while maximized
    win.focus();
    if (isMobile()) return;            // phone windows fill the screen, nowhere to drag to
    startDrag(rec, e);
    e.preventDefault();
  });
}

function toggleMax(rec, btnMax) {
  const willMax = !rec.win.max;
  rec.win.maximize(willMax);
  btnMax.setAttribute("aria-label", willMax ? "Restore" : "Maximize");
}

/* ---------- Global drag manager (one set of listeners, rAF-coalesced) ----------
   A single pointer position is captured per frame and applied once via
   requestAnimationFrame, so fast mouse movement can't flood WinBox.move()
   with layout work. */
let drag = null;   // { rec, sx, sy, ox, oy, nx, ny, raf }

function startDrag(rec, e) {
  drag = {
    rec,
    sx: e.clientX, sy: e.clientY,   // pointer start
    ox: rec.win.x, oy: rec.win.y,   // window start
    nx: rec.win.x, ny: rec.win.y,
    raf: 0,
  };
  rec.root.classList.add("wb-moving");
  document.body.style.userSelect = "none";
}

function onDragMove(e) {
  if (!drag) return;
  // Safety net: if the button was released outside the window (so we never
  // got the mouseup), stop dragging instead of sticking to the cursor.
  if (e.buttons === 0) { endDrag(); return; }
  drag.nx = drag.ox + (e.clientX - drag.sx);
  drag.ny = drag.oy + (e.clientY - drag.sy);
  if (!drag.raf) drag.raf = requestAnimationFrame(applyDrag);
}

function applyDrag() {
  if (!drag) return;
  drag.raf = 0;
  drag.rec.win.move(drag.nx, drag.ny);
}

function endDrag() {
  if (!drag) return;
  const d = drag;
  drag = null;                       // clear state FIRST, always
  document.body.style.userSelect = "";
  if (d.raf) cancelAnimationFrame(d.raf);
  d.rec.root.classList.remove("wb-moving");
}

document.addEventListener("pointermove", onDragMove, { passive: true });
document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", endDrag);

/* ---------- Buttons inside window bodies that open other windows ---------- */
function wireInnerButtons(scope) {
  scope.querySelectorAll("[data-window]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openWindow(el.dataset.window);
    });
  });
}

/* ---------- Gallery lightbox ---------- */
function openLightbox(url, caption) {
  let lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML = `<div class="lb-inner">
      <button class="lb-close" aria-label="Close">✕</button>
      <img class="lb-img" alt="">
      <div class="lb-cap"></div>
    </div>`;
    document.body.appendChild(lb);
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lb-close")) closeLightbox();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  }
  lb.querySelector(".lb-img").src = url;
  const cap = lb.querySelector(".lb-cap");
  cap.textContent = caption || "";
  cap.style.display = caption ? "" : "none";
  lb.classList.add("show");
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("show");
}

/* =======================================================
   Taskbar
   ======================================================= */
const taskBar = document.getElementById("task-buttons");

function addTask(key, def) {
  const btn = document.createElement("button");
  btn.className = "task-btn";
  btn.dataset.key = key;
  btn.title = def.title;                 // Win7-style hover tooltip
  btn.innerHTML = `<span>${bx(def.icon)} ${def.title}</span>`;
  btn.addEventListener("click", () => {
    const rec = openWindows[key];
    if (!rec) return;
    // Active + visible -> minimize; otherwise restore + focus.
    if (btn.classList.contains("active") && !rec.min) {
      rec.win.hide();
      rec.min = true;
      setActiveTask(null);
    } else {
      rec.win.show();
      rec.win.focus();
      rec.min = false;
    }
  });
  taskBar.appendChild(btn);
}

function removeTask(key) {
  const btn = taskBar.querySelector(`[data-key="${key}"]`);
  if (btn) btn.remove();
}

function setActiveTask(key) {
  taskBar.querySelectorAll(".task-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.key === key)
  );
}

/* =======================================================
   Desktop icons (single + double click) & keyboard
   ======================================================= */
document.querySelectorAll(".desk-icon").forEach((icon) => {
  const open = () => openWindow(icon.dataset.window);
  icon.addEventListener("click", open);          // single-click to open
  icon.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
});

/* =======================================================
   Start menu
   ======================================================= */
const startBtn = document.getElementById("start-btn");
const startMenu = document.getElementById("start-menu");

function toggleStart(force) {
  const show = force !== undefined ? force : startMenu.hidden;
  startMenu.hidden = !show;
}
startBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleStart(); });

// Menu items open windows.
startMenu.querySelectorAll("[data-window]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow(el.dataset.window);
    toggleStart(false);
  });
});

// Shut down fades the screen out and then sends the visitor somewhere else.
// Change where it goes with data-url on the button in index.html.
document.getElementById("shutdown").addEventListener("click", (e) => {
  const url = e.currentTarget.dataset.url || "https://nekoweb.org";
  toggleStart(false);
  document.body.style.transition = "opacity .8s";
  document.body.style.opacity = "0";
  setTimeout(() => { window.location.href = url; }, 800);
});

// Click outside closes start menu.
document.addEventListener("click", (e) => {
  if (!startMenu.hidden && !startMenu.contains(e.target) && e.target !== startBtn) {
    toggleStart(false);
  }
});

/* =======================================================
   Clock
   ======================================================= */
function tickClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const clock = document.getElementById("clock");
  const date = now.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
  clock.querySelector(".time").textContent = `${h}:${m} ${ampm}`;
  clock.querySelector(".date").textContent = date;
}
tickClock();
setInterval(tickClock, 1000 * 15);

/* =======================================================
   Boot: hold the logon screen a beat, then open Welcome
   ======================================================= */
window.addEventListener("load", () => {
  // Let the boot screen finish its minimum beat, fade it out, then greet
  // with the Welcome window centred on the desktop.
  setTimeout(() => {
    hideBoot();

    setTimeout(() => {
      openWindow("welcome");
      const rec = openWindows.welcome;
      if (rec) {
        // On a phone the window already fills the desktop; only centre it on desktop.
        if (!isMobile()) {
          const dw = desktopEl.clientWidth, dh = desktopEl.clientHeight;
          const def = WINDOWS.welcome;
          rec.win.move(Math.max(10, Math.round((dw - def.w) / 2)), Math.max(10, Math.round((dh - def.h) / 2)));
        }
        const startBtn = rec.node.querySelector(".welcome-start");
        if (startBtn) startBtn.addEventListener("click", () => rec.win.close());
      }
    }, 420);
  }, bootRemaining());
});
