(() => {
  "use strict";

  const data = window.TEZ;
  const DIR = "assets/pc";
  const IMAGE_TYPES = ["jpg", "png", "webp", "jpeg"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (id) => document.getElementById(id);
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const two = (n) => String(n).padStart(2, "0");
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* ================= Pictures ================= */

  // A picture may be saved as .jpg, .png or .webp: try each in turn.
  const found = new Map();
  function find(name) {
    if (!found.has(name)) {
      found.set(name, new Promise((resolve) => {
        const attempt = (n) => {
          if (n >= IMAGE_TYPES.length) return resolve(null);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => attempt(n + 1);
          img.src = `${DIR}/${name}.${IMAGE_TYPES[n]}`;
        };
        attempt(0);
      }));
    }
    return found.get(name);
  }

  // Show a picture as an element's background. Until the file exists, the
  // element says which file it is waiting for. `quiet` slots stay plain.
  function picture(el, name, quiet) {
    el.classList.add("pic");
    find(name).then((img) => {
      if (img) {
        el.style.backgroundImage = `url("${img.src}")`;
      } else if (!quiet) {
        el.classList.add("is-empty");
        el.dataset.file = `${name}.jpg`;
      }
    });
    return el;
  }

  // Split a sentence into word spans, so each word can move on its own.
  function words(target, sentence, from = 0) {
    const list = sentence.split(" ");
    return list.map((word, i) => {
      const span = make("span", "w", i < list.length - 1 ? `${word} ` : word);
      span.style.setProperty("--i", from + i);
      target.append(span);
      return span;
    });
  }

  /* ================= Words from config.js ================= */

  $("brand").textContent = data.brand;
  $("barStart").textContent = data.start.button;
  $("footMark").textContent = data.brand;
  $("footCity").textContent = `${data.brand} ${data.sub}, ${data.city}`;

  $("heroTitle").setAttribute("aria-label", data.hero.title);
  words($("heroTitle"), data.hero.title).forEach((span) => span.setAttribute("aria-hidden", "true"));
  $("heroNote").textContent = data.hero.note;
  $("hintText").textContent = data.hero.hint;

  // The statement inside the cabin: one block per line, one span per word.
  const sayWords = [];
  $("sayText").setAttribute("aria-label", data.cabin.lines.join(" "));
  data.cabin.lines.forEach((text) => {
    const line = make("span", "say-line");
    line.setAttribute("aria-hidden", "true");
    sayWords.push(...words(line, text, sayWords.length));
    $("sayText").append(line);
  });

  picture($("approachPic"), data.approach.file);
  $("approachLabel").textContent = data.approach.label;
  $("approachTitle").textContent = data.approach.title;
  $("approachText").textContent = data.approach.text;
  $("approachButton").textContent = data.approach.button;
  data.approach.facts.forEach((fact) => {
    const li = make("li");
    li.append(make("b", "", fact.number), make("span", "tag", fact.label));
    $("facts").append(li);
  });

  // Values: a blurred copy of each picture behind, the card and its words in front.
  const values = data.values.map((value, i) => {
    const bg = picture(make("div"), value.file, true);
    $("valuesBg").append(bg);
    const item = make("article", "value");
    const text = make("div", "value-words");
    const count = make("p", "tag");
    count.append(make("b", "", two(i + 1)), ` / ${two(data.values.length)}`);
    text.append(count, make("h3", "", value.title), make("p", "", value.text));
    item.append(picture(make("div", "value-pic"), value.file), text);
    $("valuesList").append(item);
    return { bg, item };
  });
  $("values").style.setProperty("--n", values.length);

  const lineWords = words($("lineText"), data.line);

  // Services: one picture and one block of words each, and a row of names to jump with.
  const services = data.services.map((service, i) => {
    const pic = picture(make("div"), service.file);
    if (i === 0) pic.style.setProperty("--r", 1);
    $("servicePics").append(pic);
    const item = make("article", "service");
    const count = make("p", "tag");
    count.append(make("b", "", two(i + 1)), ` / ${two(data.services.length)}`);
    const link = make("a", "service-link", data.start.button);
    link.href = "#start";
    item.append(count, make("h3", "", service.name), make("p", "", service.text), link);
    $("serviceWords").append(item);
    const li = make("li");
    const button = make("button", "", service.name);
    button.type = "button";
    button.addEventListener("click", () => {
      const box = $("services").getBoundingClientRect();
      const step = (box.height - window.innerHeight) / (data.services.length - 1);
      window.scrollTo({ top: box.top + window.scrollY + i * step, behavior: reducedMotion ? "auto" : "smooth" });
    });
    li.append(button);
    $("serviceIndex").append(li);
    return { pic, item, li };
  });
  $("services").style.setProperty("--n", services.length);

  $("startLabel").textContent = data.start.label;
  $("startTitle").textContent = data.start.title;
  $("startText").textContent = data.start.text;
  $("startButton").textContent = data.start.button;
  $("startPhone").textContent = data.phone;
  $("startPhone").href = `tel:${data.phone.replace(/[^+\d]/g, "")}`;
  $("startEmail").textContent = data.email;
  $("startEmail").href = `mailto:${data.email}`;

  /* ================= The opening film ================= */

  const fly = $("top");
  const canvas = $("film");
  const ctx = canvas.getContext("2d");
  const GLIDE_MS = 130;   // how quickly the picture catches up with the scroll position

  // Where things happen along the pinned stretch (0 = top, 1 = end).
  const FILM = [0.05, 0.72];    // the camera flies
  const SAY = [0.64, 0.9];      // the statement arrives, word by word
  const BLACK = [0.94, 1];      // fade to black, into the next section

  // The two stills: the film's first and last frame. Used until (or instead of) the film.
  const stills = [null, null];
  let stillsReady = 0;
  [data.hero.file, data.cabin.file].forEach((name, i) => {
    find(name).then((img) => {
      stills[i] = img;
      stillsReady += 1;
      drawn = -1;
      requestFrame();
    });
  });

  // If assets/film/manifest.json exists, the opening plays those frames as you
  // scroll. Without it, the first picture zooms in and the second fades up.
  const FILM_DIR = "assets/film/";
  let film = null;

  function startFilm(count) {
    film = new Array(count);
    // Fetch a thin spread of frames first so every part of the film has
    // something to show, then fill in the rest.
    const order = [];
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) if (!order.includes(i)) order.push(i);
    }
    let next = 0;
    const pump = () => {
      if (next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.onload = () => {
        film[i] = img;
        drawn = -1;
        requestFrame();
        pump();
      };
      img.onerror = pump;
      img.src = `${FILM_DIR}f-${String(i + 1).padStart(4, "0")}.jpg`;
    };
    for (let k = 0; k < 6; k++) pump();
  }

  fetch(`${FILM_DIR}manifest.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((manifest) => {
      if (manifest && manifest.count > 1) startFilm(manifest.count);
    })
    .catch(() => {});

  // Draw a picture to fill the canvas, zoomed about a point of the canvas (fx, fy).
  function cover(img, W, H, zoom = 1, fx = 0.5, fy = 0.5) {
    const base = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * base;
    const h = img.naturalHeight * base;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    const px = fx * W;
    const py = fy * H;
    ctx.drawImage(img, px - (px - x) * zoom, py - (py - y) * zoom, w * zoom, h * zoom);
  }

  function nearestFrame(want) {
    for (let d = 0; d < film.length; d++) {
      if (film[want - d]) return film[want - d];
      if (film[want + d]) return film[want + d];
    }
    return null;
  }

  // Scroll positions usually fall between two frames; blending the two makes slow scrolling smooth.
  function drawFilmFrames(t, W, H) {
    const exact = t * (film.length - 1);
    const index = Math.floor(exact);
    const base = nearestFrame(index);
    if (!base) return false;
    cover(base, W, H);
    const next = film[index] === base ? film[index + 1] : null;
    if (next && !reducedMotion) {
      ctx.globalAlpha = exact - index;
      cover(next, W, H);
      ctx.globalAlpha = 1;
    }
    return true;
  }

  const TINTS = ["#101317", "#141d0c"];
  function placeholder(i, W, H, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = TINTS[i];
    ctx.fillRect(0, 0, W, H);
    if (stillsReady === 2) {
      ctx.fillStyle = "rgba(232, 236, 241, 0.5)";
      ctx.textAlign = "center";
      ctx.font = `${Math.round(Math.max(W / 52, 14))}px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillText(`Add ${[data.hero.file, data.cabin.file][i]}.jpg to ${DIR}`, W / 2, H * 0.62);
    }
    ctx.globalAlpha = 1;
  }

  // t: 0 = the three cars, 1 = inside the cabin.
  function drawFlight(t) {
    const W = canvas.width;
    const H = canvas.height;
    if (!W || !H) return;
    if (film && drawFilmFrames(t, W, H)) return;
    // No film yet: push in on the first picture, then let the cabin come up through it.
    const push = t * t;
    if (stills[0]) cover(stills[0], W, H, 1 + 2.4 * push, 0.5, 0.62);
    else placeholder(0, W, H, 1);
    const arrive = smooth(clamp((t - 0.5) / 0.4));
    if (arrive <= 0) return;
    if (stills[1]) {
      ctx.globalAlpha = arrive;
      cover(stills[1], W, H, 1.3 - 0.3 * arrive);
      ctx.globalAlpha = 1;
    } else {
      placeholder(1, W, H, arrive);
    }
  }

  /* ================= Scroll ================= */

  // How far through a pinned section the page is: 0 when it pins, 1 when it lets go.
  function progress(section) {
    const box = section.getBoundingClientRect();
    return clamp(-box.top / Math.max(1, box.height - window.innerHeight));
  }
  const within = (p, [a, b]) => clamp((p - a) / (b - a));

  function setSteps(list, position) {
    const active = Math.round(position);
    list.forEach(({ item, bg, li }, k) => {
      item.classList.toggle("is-on", k === active);
      item.classList.toggle("is-before", k < active);
      if (bg) bg.classList.toggle("is-on", k === active);
      if (li) {
        if (k === active) li.setAttribute("aria-current", "step");
        else li.removeAttribute("aria-current");
      }
    });
  }

  // The picture is never tied straight to the scroll position, because a mouse
  // wheel moves the page in steps. It has a place it should be (target) and
  // glides towards it a little every frame (shown).
  let target = 0;
  let shown = 0;
  let drawn = -1;
  let raf = 0;
  let lastFrame = 0;

  function everythingElse() {
    // The growing picture.
    const a = progress($("approach"));
    $("approach").style.setProperty("--grow", smooth(within(a, [0, 0.62])).toFixed(4));
    $("approach").style.setProperty("--words", within(a, [0.5, 0.72]).toFixed(3));

    // Values and services: which step is showing.
    setSteps(values, progress($("values")) * (values.length - 1));
    const s = progress($("services")) * (services.length - 1);
    setSteps(services, s);
    services.forEach(({ pic }, k) => {
      if (k) pic.style.setProperty("--r", smooth(clamp(s - (k - 1))).toFixed(4));
    });

    // The sentence: words light up as it crosses the screen.
    const box = $("line").getBoundingClientRect();
    const vh = window.innerHeight;
    const lit = clamp((vh * 0.82 - box.top) / (box.height * 0.62 + vh * 0.1)) * lineWords.length;
    lineWords.forEach((span, i) => {
      span.classList.toggle("is-lit", i < Math.floor(lit));
      span.classList.toggle("is-now", i === Math.floor(lit) && lit > 0 && lit < lineWords.length);
    });
  }

  function frame(now) {
    const elapsed = reducedMotion ? Infinity : lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;
    const next = shown + (target - shown) * (1 - Math.exp(-elapsed / GLIDE_MS));
    shown = Math.abs(target - next) < 0.0004 ? target : next;
    if (shown !== drawn) {
      drawn = shown;
      drawFlight(within(shown, FILM));
      // The headline leaves as the camera starts to move.
      const leave = within(shown, [0.02, 0.14]);
      $("hero").style.opacity = (1 - leave).toFixed(3);
      $("hero").style.transform = `translateY(${(-leave * 40).toFixed(1)}px)`;
      $("hint").style.opacity = (1 - within(shown, [0, 0.04])).toFixed(3);
      // The statement: each word arrives in turn.
      const said = within(shown, SAY) * (sayWords.length + 1);
      sayWords.forEach((span, i) => span.style.setProperty("--o", clamp(said - i).toFixed(3)));
      fly.style.setProperty("--dim", within(shown, [SAY[0] - 0.04, SAY[0] + 0.1]).toFixed(3));
      $("black").style.setProperty("--black-in", within(shown, BLACK).toFixed(3));
    }
    everythingElse();
    if (shown === target) {
      raf = 0;
      lastFrame = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  function requestFrame() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function onScroll() {
    target = progress(fly);
    requestFrame();
  }

  function onResize() {
    // Sharp on high-density screens, but never bigger than the film itself.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const shrink = Math.min(1, 1920 / (canvas.clientWidth * ratio));
    canvas.width = Math.round(canvas.clientWidth * ratio * shrink);
    canvas.height = Math.round(canvas.clientHeight * ratio * shrink);
    target = progress(fly);
    shown = target;
    drawn = -1;
    lastFrame = 0;
    requestFrame();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();

  /* ================= Start your build ================= */

  const form = $("startForm");
  const status = $("formStatus");
  const required = [
    { input: $("fName"), error: $("fNameErr"), check: (v) => (v ? "" : "Enter your name.") },
    { input: $("fPhone"), error: $("fPhoneErr"), check: (v) => (!v ? "Enter your phone number." : v.replace(/\D/g, "").length >= 8 ? "" : "Enter a phone number with at least 8 digits.") },
  ];

  required.forEach(({ input, error, check }) => {
    input.addEventListener("input", () => {
      if (check(input.value.trim())) return;
      input.setAttribute("aria-invalid", "false");
      error.textContent = "";
    });
  });

  // There is no server behind this page: the request opens the visitor's own
  // email app with the message written out.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    let firstInvalid = null;
    required.forEach(({ input, error, check }) => {
      const problem = check(input.value.trim());
      input.setAttribute("aria-invalid", String(Boolean(problem)));
      error.textContent = problem;
      if (problem && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const fields = new FormData(form);
    const lines = [
      `Name: ${fields.get("name").trim()}`,
      `Phone: ${fields.get("phone").trim()}`,
      `Plays: ${fields.get("about").trim() || "Not given"}`,
    ];
    if (fields.get("note").trim()) lines.push("", fields.get("note").trim());
    status.textContent = "Your email app should now open with the request written out. Press send there to finish.";
    window.location.href = `mailto:${data.email}?subject=${encodeURIComponent("Spec my rig")}&body=${encodeURIComponent(lines.join("\n"))}`;
  });
})();
