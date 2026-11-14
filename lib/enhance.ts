// Small browser behaviours on top of the server-rendered pages: the header menus and the quote form.

type NavGroup = { key: string; title: string; items: { slug: string; name: string }[] };

const MENU_OPEN = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 5h14M2 9h14M2 13h14"></path></svg>';
const MENU_CLOSE = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l12 12M15 3 3 15"></path></svg>';

export function enhanceHeader(groups: NavGroup[]): () => void {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header) return () => {};
  const nav = header.querySelector<HTMLElement>(".nav");
  const dds = Array.from(header.querySelectorAll<HTMLElement>(".nav-dd"));
  const setOpen = (el: HTMLElement | null) => {
    for (const d of dds) {
      const on = d === el;
      d.classList.toggle("open", on);
      d.querySelector("button")?.setAttribute("aria-expanded", String(on));
    }
  };
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, ev: K | string, fn: (e: any) => void, opt?: AddEventListenerOptions) => {
    el.addEventListener(ev, fn, opt);
    offs.push(() => el.removeEventListener(ev, fn, opt));
  };
  for (const d of dds) {
    on(d, "mouseenter", () => setOpen(d));
    on(d, "mouseleave", () => setOpen(null));
    const b = d.querySelector("button");
    if (b) on(b, "click", () => setOpen(d.classList.contains("open") ? null : d));
    d.querySelectorAll("a").forEach((a) => on(a, "click", () => setOpen(null)));
  }
  on(document, "click", (e: MouseEvent) => {
    if (nav && !nav.contains(e.target as Node)) setOpen(null);
  });

  const scrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  scrolled();
  on(window, "scroll", scrolled, { passive: true });

  // mobile menu
  const btn = header.querySelector<HTMLButtonElement>(".menu-btn");
  let panel: HTMLElement | null = null;
  const closeMobile = () => {
    panel?.remove();
    panel = null;
    document.body.style.overflow = "";
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      btn.innerHTML = MENU_OPEN;
    }
  };
  const openMobile = () => {
    if (!btn) return;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    panel = document.createElement("div");
    panel.className = "mobile-nav";
    panel.id = "mobile-nav";
    panel.innerHTML =
      groups.map((g) => `<div><h4 class="eyebrow">${esc(g.title)}</h4><ul>${g.items.map((i) => `<li><a href="/${i.slug}/">${esc(i.name)}</a></li>`).join("")}</ul></div>`).join("") +
      '<h4 class="eyebrow">Company</h4><ul><li><a href="/iron-on-instructions/">Iron-on guide</a></li><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li><li><a href="/custom-patches/">All patches</a></li></ul><a class="btn btn--copper" href="/contact/">Get a quote</a>';
    header.appendChild(panel);
    document.body.style.overflow = "hidden";
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close menu");
    btn.innerHTML = MENU_CLOSE;
  };
  if (btn) on(btn, "click", () => (panel ? closeMobile() : openMobile()));
  on(window, "keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(null);
      closeMobile();
    }
  });
  return () => {
    closeMobile();
    offs.forEach((f) => f());
  };
}

export const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel functions accept request bodies up to 4.5 MB

export function enhanceQuoteForms(email: string): () => void {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("form.form"));
  const offs: (() => void)[] = [];
  for (const form of forms) {
    const select = form.querySelector<HTMLSelectElement>('select[name="product"]');
    // On pages without a preset product (home, contact), take ?product=... from the link that brought the visitor here.
    if (select && !select.value) {
      const want = new URLSearchParams(location.search).get("product");
      if (want && Array.from(select.options).some((o) => o.value === want)) select.value = want;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = button?.textContent || "Get my free quote";
    const say = (kind: "ok" | "err", text: string) => {
      let p = form.querySelector<HTMLElement>(".f-msg");
      if (!p) {
        p = document.createElement("p");
        p.setAttribute("role", "status");
        form.appendChild(p);
      }
      p.className = `f-msg ${kind}`;
      p.textContent = text;
    };
    const submit = async (e: SubmitEvent) => {
      e.preventDefault();
      const data = new FormData(form);
      const file = data.get("artwork");
      if (file instanceof File && file.size > MAX_UPLOAD) {
        say("err", `That file is over 4 MB. Send a smaller version, or submit without it and email the artwork to ${email}.`);
        return;
      }
      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }
      form.querySelector(".f-msg")?.remove();
      try {
        const res = await fetch("/api/quote/", { method: "POST", body: data });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || "Something went wrong.");
        const preset = select?.querySelector<HTMLOptionElement>("option[selected]")?.value || "";
        form.reset();
        if (select) select.value = preset;
        location.href = "/thank-you/";
      } catch (err) {
        say("err", `${(err as Error).message} You can also email your artwork and details to ${email}.`);
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = label;
        }
      }
    };
    form.addEventListener("submit", submit);
    offs.push(() => form.removeEventListener("submit", submit));
  }
  return () => offs.forEach((f) => f());
}
