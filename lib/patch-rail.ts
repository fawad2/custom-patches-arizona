// The home page's 3D patch rail: patches hang on cards from a chrome rail; drag, swipe, use the arrows or keys,
// click a patch to take it down and see its details. Plain three.js on top of the server-rendered markup
// (.stage, .cap, .ctl), so the page works and reads fine before (and without) JavaScript or WebGL.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { artSvgForCanvas, hangCard } from "./patch-art";

export type RailItem = {
  slug: string;
  name: string;
  kind: string;
  print: string;
  art: string;
  tag: string;
  price: string;
  lede: string;
  facts: { label: string; value: string }[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const SPACING = 1.2;

/** Fonts as data URLs so the SVG artwork renders with them inside an <img>. */
async function fontCss(): Promise<string> {
  const b64 = async (url: string) => {
    const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
    let s = "";
    for (let k = 0; k < buf.length; k += 32768) s += String.fromCharCode(...buf.subarray(k, k + 32768));
    return btoa(s);
  };
  try {
    const [archivo, graduate] = await Promise.all([b64("/fonts/archivo-latin-wdth.woff2"), b64("/fonts/graduate-latin.woff2")]);
    return `@font-face{font-family:'Archivo Variable';src:url(data:font/woff2;base64,${archivo}) format('woff2');font-weight:100 900;font-stretch:62% 125%}@font-face{font-family:'Graduate';src:url(data:font/woff2;base64,${graduate}) format('woff2')}`;
  } catch {
    return "";
  }
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** The printed backing card (720x960) with the patch artwork, or a blank brand card while artwork loads. */
function cardCanvas(img: HTMLImageElement | null, print: string, blank = false): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = 720;
  cv.height = 960;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 960);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#f1f2f3");
  c.fillStyle = g;
  c.fillRect(0, 0, 720, 960);
  c.fillStyle = "#e4e6e8";
  roundRect(c, 314, 30, 92, 26, 13);
  c.fill();
  c.fillStyle = "rgba(0,0,0,.18)";
  roundRect(c, 314, 30, 92, 8, 4);
  c.fill();
  c.textAlign = "center";
  if (blank) {
    c.fillStyle = "#15171a";
    c.font = '700 34px "Archivo Variable", Arial, sans-serif';
    c.fillText("CUSTOM PATCHES", 360, 470);
    c.fillStyle = "#b5562c";
    c.fillText("ARIZONA", 360, 514);
    c.fillStyle = "#9a9fa6";
    c.font = '500 20px "IBM Plex Mono", monospace';
    c.fillText("MADE TO ORDER", 360, 570);
    return cv;
  }
  if (img) c.drawImage(img, (720 - 604.8) / 2, 144, 604.8, 604.8);
  c.fillStyle = "#9a9fa6";
  c.font = '500 21px "IBM Plex Mono", monospace';
  c.fillText(`CUSTOM PATCHES ARIZONA · ${print.toUpperCase()}`, 360, 0.93 * 960, 648);
  return cv;
}

/** The little price tag hanging next to each card. */
function tagCanvas(text: string): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 112;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#ffffff";
  roundRect(c, 4, 4, 248, 104, 10);
  c.fill();
  c.fillStyle = "#b2b7bd";
  c.beginPath();
  c.arc(26, 56, 7, 0, 2 * Math.PI);
  c.fill();
  c.fillStyle = "#15171a";
  c.font = '500 46px "IBM Plex Mono", monospace';
  c.textBaseline = "middle";
  c.textAlign = "center";
  c.fillText(text, 142, 58, 192);
  return cv;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = fail;
    i.src = src;
  });

/**
 * Mounts the rail. `section` is the element holding .stage, .cap and .ctl (the server-rendered markup).
 * Returns a cleanup function.
 */
export function mountRail(section: HTMLElement, items: RailItem[], start = 0): () => void {
  const stage = section.querySelector<HTMLElement>(".stage")!;
  const cap = section.querySelector<HTMLElement>(".cap")!;
  const [prevBtn, nextBtn] = Array.from(section.querySelectorAll<HTMLButtonElement>(".ctl .arrow"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = start;
  let openIndex: number | null = null;
  let detailEl: HTMLElement | null = null;

  // ----- caption and controls -----
  const setCurrent = (i: number) => {
    current = i;
    const it = items[i];
    stage.setAttribute("aria-label", `Patch rail. ${it.name}, ${i + 1} of ${items.length}. Use the arrow keys to move and Enter to open.`);
    cap.innerHTML = `<div class="cap-meta"><span>${pad(i + 1)} / ${pad(items.length)}</span><span class="pill">${esc(it.kind)}</span></div><p class="cap-name">${esc(it.name)}</p><p class="cap-price"><b>${esc(it.price)}</b></p>`;
    cap.classList.remove("swap");
    void cap.offsetWidth;
    cap.classList.add("swap");
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === items.length - 1;
  };

  // ----- detail view ("take it down") -----
  let api: { go: (i: number) => void; lift: (i: number, up: boolean) => void } | null = null;
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeDetail();
  };
  const openDetail = (i: number) => {
    if (detailEl) return;
    openIndex = i;
    const z = items[i];
    api?.lift(i, true);
    const d = document.createElement("div");
    d.className = "detail";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
    d.setAttribute("aria-labelledby", "d-name");
    d.innerHTML = `<div class="d-bg"></div><div class="d-bar"><span class="mono" style="font-size:11px;color:var(--muted)">${pad(i + 1)} / ${pad(items.length)}</span><button class="close" type="button">Close <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"></path></svg></button></div><div class="d-body"><div class="d-fig"><span style="--cw:clamp(220px, 62vw, 320px)">${hangCard({ art: z.art, label: z.name, print: z.print })}</span></div><div class="d-info"><span class="pill">${esc(z.kind)}</span><h2 class="d-name" id="d-name">${esc(z.name)}</h2><p class="p-from">${esc(z.price)}</p><p class="lede" style="font-size:16px">${esc(z.lede)}</p><dl class="facts">${z.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl><div class="btn-row"><a class="btn btn--copper" href="/contact/?product=${z.slug}">Get a quote</a><a class="btn btn--ghost" href="/${z.slug}/">Full details</a></div></div></div>`;
    d.querySelector(".d-bg")!.addEventListener("click", closeDetail);
    d.querySelector(".close")!.addEventListener("click", closeDetail);
    section.appendChild(d);
    detailEl = d;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("open")));
    (d.querySelector(".close") as HTMLElement).focus();
  };
  function closeDetail() {
    const d = detailEl;
    if (!d) return;
    d.classList.remove("open");
    if (openIndex !== null) api?.lift(openIndex, false);
    window.removeEventListener("keydown", onEsc);
    detailEl = null;
    setTimeout(() => {
      d.remove();
      openIndex = null;
      document.body.style.overflow = "";
      stage.focus({ preventScroll: true });
    }, 380);
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      api?.go(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      api?.go(current - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail(current);
    }
  };
  stage.addEventListener("keydown", onKey);
  const onPrev = () => api?.go(current - 1);
  const onNext = () => api?.go(current + 1);
  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);
  setCurrent(start);

  // ----- WebGL scene -----
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    // No WebGL: show the patches as plain linked cards instead.
    const fb = document.createElement("div");
    fb.className = "stage-fallback";
    fb.innerHTML = items
      .map((it) => `<a href="/${it.slug}/">${hangCard({ art: it.art, label: it.name, print: it.print, tag: it.tag })}</a>`)
      .join("");
    stage.appendChild(fb);
    return () => {
      fb.remove();
      stage.removeEventListener("keydown", onKey);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9dcdf, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(-3, 4, 6);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  // the rail
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dde1, metalness: 1, roughness: 0.22, envMapIntensity: 1.1 });
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 60, 32), chrome);
  rail.rotation.z = Math.PI / 2;
  scene.add(rail);

  // the S-hook each card hangs from
  const v = (y: number, z: number) => new THREE.Vector3(0, y, z);
  const hookCurve = new THREE.CatmullRomCurve3(
    [v(-0.07, 0.045), v(-0.01, 0.075), v(0.06, 0.045), v(0.075, -0.01), v(0.035, -0.065), v(-0.03, -0.06), v(-0.08, -0.02),
      v(-0.16, 0), v(-0.3, 0), v(-0.4, 0.005), v(-0.445, 0.032), v(-0.475, 0), v(-0.455, -0.035), v(-0.425, -0.04)],
    false, "catmullrom", 0.4,
  );
  const hookGeo = new THREE.TubeGeometry(hookCurve, 120, 0.011, 10, false);
  const hookMat = new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 1, roughness: 0.3 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe9ebed, roughness: 0.9 });
  const cardGeo = new THREE.BoxGeometry(1.5, 2, 0.014);
  const tagGeo = new THREE.PlaneGeometry(0.46, 0.2);
  const stringMat = new THREE.LineBasicMaterial({ color: 0x9aa0a6 });
  const backTex = new THREE.CanvasTexture(cardCanvas(null, "", true));
  backTex.colorSpace = THREE.SRGBColorSpace;
  const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.9 });
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const cards = items.map((it, idx) => {
    const pivot = new THREE.Group();
    pivot.add(new THREE.Mesh(hookGeo, hookMat));
    const spin = new THREE.Group();
    spin.position.y = -0.4;
    pivot.add(spin);
    const front = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const card = new THREE.Mesh(cardGeo, [edgeMat, edgeMat, edgeMat, edgeMat, front, backMat]);
    card.position.y = -1;
    card.userData.index = idx;
    spin.add(card);
    const tagTex = new THREE.CanvasTexture(tagCanvas(it.tag));
    tagTex.colorSpace = THREE.SRGBColorSpace;
    tagTex.anisotropy = aniso;
    const tag = new THREE.Mesh(tagGeo, new THREE.MeshBasicMaterial({ map: tagTex, transparent: true }));
    tag.position.set(-0.34, -0.3, 0.05);
    tag.rotation.z = 0.16;
    pivot.add(tag);
    const string = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.53, -0.27, 0.05), new THREE.Vector3(-0.2, -0.16, 0.02), new THREE.Vector3(0, -0.14, 0.01)]),
      stringMat,
    );
    pivot.add(string);
    scene.add(pivot);
    return {
      pivot, spin, card, front,
      ang: 0,
      angV: reduced ? 0 : (idx % 2 ? -1 : 1) * (0.018 + (idx % 3) * 0.006),
      seed: 0.82 + ((37 * idx) % 10) / 26,
      lift: 0,
      liftTo: 0,
    };
  });

  // ----- motion state -----
  let pos = start; // where the rail is now (fractional index)
  let target = start; // where it's heading
  let vel = 0;
  let lastPos = start;
  let dirty = true;
  let shown = -1;
  let drag: null | { x: number; y: number; pos: number; t: number; samples: { x: number; t: number }[]; moved: boolean; locked: boolean | null } = null;
  let wheelAcc = 0;
  let width = 1, height = 1, viewW = 8, pxPerUnit = 100, camDist = 8;

  const resize = () => {
    width = stage.clientWidth || 1;
    height = stage.clientHeight || 1;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(14));
    const dist = Math.max((1.2 * THREE.MathUtils.clamp(3.1 * aspect, 3.1, 7.6)) / (2 * tanHalf * aspect), 3.1 / (2 * tanHalf));
    camera.aspect = aspect;
    camera.position.set(0, -0.78, dist);
    camera.lookAt(0, -1.2, 0);
    camera.updateProjectionMatrix();
    camDist = dist;
    viewW = 2 * dist * tanHalf * aspect;
    pxPerUnit = width / viewW;
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  // draw each patch onto its card once the fonts are in
  let disposed = false;
  (async () => {
    const css = await fontCss();
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    for (let k = 0; k < items.length && !disposed; k++) {
      try {
        const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(artSvgForCanvas(items[k].art, css)));
        const tex = new THREE.CanvasTexture(cardCanvas(img, items[k].print));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = aniso;
        cards[k].front.map = tex;
        cards[k].front.needsUpdate = true;
        dirty = true;
      } catch {}
    }
  })();

  const count = items.length;
  const clampIdx = (i: number) => Math.max(0, Math.min(count - 1, i));
  const go = (i: number) => {
    target = clampIdx(i);
    if (reduced) pos = target;
  };

  const step = () => {
    if (!drag) {
      if (reduced) pos = target;
      else {
        vel += (target - pos) * 0.11;
        vel *= 0.7;
        pos += vel;
        if (Math.abs(target - pos) < 5e-4 && Math.abs(vel) < 5e-4) {
          pos = target;
          vel = 0;
        }
      }
    }
    const delta = pos - lastPos;
    lastPos = pos;
    let moving = Math.abs(delta) > 1e-5 || drag !== null;
    const push = reduced ? 0 : THREE.MathUtils.clamp(0.9 * delta, -0.22, 0.22);
    for (const c of cards) {
      c.angV += (push * c.seed - c.ang) * 0.06;
      c.angV *= 0.9;
      c.ang += c.angV;
      if (Math.abs(c.ang) > 1e-4 || Math.abs(c.angV) > 1e-4) moving = true;
      c.lift += (c.liftTo - c.lift) * (reduced ? 1 : 0.12);
      if (Math.abs(c.liftTo - c.lift) > 0.001) moving = true;
    }
    return moving;
  };

  let raf = 0;
  let visible = true;
  let last = performance.now();
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const steps = Math.min(4, Math.max(1, Math.round((now - last) / 16.67)));
    last = now;
    if (!visible) return;
    let moving = false;
    for (let k = 0; k < steps; k++) moving = step() || moving;
    for (let k = 0; k < count; k++) {
      const c = cards[k];
      const off = k - pos;
      const near = Math.min(Math.abs(off), 1);
      const ease = 1 - (1 - near) * (1 - near);
      c.pivot.position.set(SPACING * off, 0.5 * c.lift, 1.2 * c.lift);
      c.pivot.rotation.z = c.ang;
      c.spin.rotation.y = ease * (-(1.38 * Math.sign(off)) + Math.atan2(-(SPACING * off), camDist));
      c.spin.scale.setScalar(1.05 - 0.12 * near);
      c.pivot.visible = Math.abs(SPACING * off) < viewW / 2 + 2;
    }
    const nearest = clampIdx(Math.round(pos));
    if (nearest !== shown) {
      shown = nearest;
      setCurrent(nearest);
    }
    if (moving || dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };
  raf = requestAnimationFrame(frame);
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(stage);

  // ----- pointer: drag the rail, click a card -----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = (x: number, y: number) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -(2 * ((y - r.top) / r.height)) + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(cards.map((c) => c.card), false)[0];
    return h ? (h.object.userData.index as number) : -1;
  };
  const canvas = renderer.domElement;
  const down = (e: PointerEvent) => {
    if (openIndex !== null) return;
    drag = { x: e.clientX, y: e.clientY, pos, t: performance.now(), samples: [{ x: e.clientX, t: performance.now() }], moved: false, locked: e.pointerType === "mouse" || null };
  };
  const move = (e: PointerEvent) => {
    if (!drag) {
      if (e.pointerType === "mouse") canvas.style.cursor = hit(e.clientX, e.clientY) >= 0 ? "pointer" : "grab";
      return;
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (drag.locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.locked = Math.abs(dx) > Math.abs(dy);
      if (!drag.locked) {
        drag = null; // vertical swipe: let the page scroll
        return;
      }
    }
    if (drag.locked) {
      if (Math.abs(dx) > 5) {
        drag.moved = true;
        stage.classList.add("dragging");
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {}
      }
      if (drag.moved) {
        pos = THREE.MathUtils.clamp(drag.pos - dx / (SPACING * pxPerUnit), -0.4, count - 0.6);
        drag.samples.push({ x: e.clientX, t: performance.now() });
        if (drag.samples.length > 6) drag.samples.shift();
      }
    }
  };
  const up = (e: PointerEvent) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    stage.classList.remove("dragging");
    if (!d.moved) {
      const i = hit(e.clientX, e.clientY);
      if (i >= 0) {
        if (i === Math.round(pos) || i === target) {
          go(i);
          openDetail(i);
        } else go(i);
      }
      return;
    }
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const fling = ((b.x - a.x) / Math.max(16, b.t - a.t)) * 260;
    go(Math.round(pos - fling / (SPACING * pxPerUnit)));
  };
  const cancel = () => {
    drag = null;
    stage.classList.remove("dragging");
    go(Math.round(pos));
  };
  const wheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 60) {
      go(Math.round(target) + Math.sign(wheelAcc));
      wheelAcc = 0;
    }
  };
  canvas.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  canvas.addEventListener("wheel", wheel, { passive: false });

  api = {
    go,
    lift: (i, upward) => {
      cards[i].liftTo = upward ? 1 : 0;
      if (!upward && !reduced) cards[i].angV += 0.06;
      dirty = true;
    },
  };

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    canvas.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    canvas.removeEventListener("wheel", wheel);
    stage.removeEventListener("keydown", onKey);
    prevBtn?.removeEventListener("click", onPrev);
    nextBtn?.removeEventListener("click", onNext);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mat) => {
        (mat as THREE.MeshStandardMaterial).map?.dispose();
        mat.dispose();
      });
    });
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    canvas.remove();
    api = null;
  };
}
