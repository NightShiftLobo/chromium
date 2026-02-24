(() => {
  const MARK = "data-nsl-dawn-contrast";
  const ATTR_BG = "data-nsl-dawn-bg";
  const ATTR_FG = "data-nsl-dawn-fg";
  const ATTR_BORDER = "data-nsl-dawn-border";
  const ATTR_DARK_BG = "data-nsl-dawn-dark-bg";

  const BG0 = "#f4f1e8";
  const BG1 = "#e9e4d8";
  const BG2 = "#ded7c8";

  function parseRgba(color) {
    if (!color) return null;
    const s = color.trim().toLowerCase();
    if (s === "transparent") return null;

    const m = s.match(/^rgba?\(([^)]+)\)$/);
    if (!m) return null;

    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length < 3) return null;

    const r = Number.parseFloat(parts[0]);
    const g = Number.parseFloat(parts[1]);
    const b = Number.parseFloat(parts[2]);
    const a = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;

    if ([r, g, b, a].some((v) => Number.isNaN(v))) return null;
    return [r, g, b, a];
  }

  function brightness(rgb) {
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  }

  function spread(rgb) {
    return Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]);
  }

  function isHarshBrightNeutral(rgba) {
    if (!rgba) return false;
    if (rgba[3] <= 0.02) return false;
    return brightness(rgba) >= 236 && spread(rgba) <= 24;
  }

  function isVeryLightText(rgba) {
    if (!rgba) return false;
    if (rgba[3] <= 0.02) return false;
    return brightness(rgba) >= 226 && spread(rgba) <= 34;
  }

  function isDarkBackground(rgba) {
    if (!rgba) return false;
    if (rgba[3] <= 0.02) return false;
    return brightness(rgba) <= 72;
  }

  function shouldSkipElement(el) {
    if (!(el instanceof HTMLElement)) return true;
    const tag = el.tagName;
    return (
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      tag === "NOSCRIPT" ||
      tag === "IMG" ||
      tag === "SVG" ||
      tag === "PATH" ||
      tag === "VIDEO" ||
      tag === "CANVAS" ||
      tag === "IFRAME"
    );
  }

  function rootBackgroundIsHarsh() {
    const root = window.getComputedStyle(document.documentElement).backgroundColor;
    const body = document.body
      ? window.getComputedStyle(document.body).backgroundColor
      : null;

    const rootRgb = parseRgba(root);
    const bodyRgb = parseRgba(body);

    if (isHarshBrightNeutral(rootRgb) || isHarshBrightNeutral(bodyRgb)) return true;

    const rootTransparent = !rootRgb || rootRgb[3] <= 0.02;
    const bodyTransparent = !bodyRgb || bodyRgb[3] <= 0.02;
    return rootTransparent && bodyTransparent;
  }

  function clearAdjustments() {
    const adjusted = document.querySelectorAll(
      `[${ATTR_BG}], [${ATTR_FG}], [${ATTR_BORDER}], [${ATTR_DARK_BG}]`
    );

    adjusted.forEach((el) => {
      el.removeAttribute(ATTR_BG);
      el.removeAttribute(ATTR_FG);
      el.removeAttribute(ATTR_BORDER);
      el.removeAttribute(ATTR_DARK_BG);
    });
  }

  function classifyBg(el, cs) {
    if (el === document.documentElement || el === document.body) return "base";

    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") {
      return "control";
    }

    if (cs.boxShadow !== "none") return "control";

    const border = parseRgba(cs.borderTopColor);
    if (border && border[3] > 0.02) return "panel";

    return "panel";
  }

  function adjustElement(el) {
    if (shouldSkipElement(el)) return;

    const cs = window.getComputedStyle(el);
    const bg = parseRgba(cs.backgroundColor);
    const fg = parseRgba(cs.color);
    const border = parseRgba(cs.borderTopColor);

    if (isHarshBrightNeutral(bg)) {
      el.setAttribute(ATTR_BG, classifyBg(el, cs));
    } else {
      el.removeAttribute(ATTR_BG);
    }

    if (isVeryLightText(fg)) {
      el.setAttribute(ATTR_FG, "muted");
    } else {
      el.removeAttribute(ATTR_FG);
    }

    if (isHarshBrightNeutral(border)) {
      el.setAttribute(ATTR_BORDER, "on");
    } else {
      el.removeAttribute(ATTR_BORDER);
    }

    if (isDarkBackground(bg)) {
      el.setAttribute(ATTR_DARK_BG, "on");
    } else {
      el.removeAttribute(ATTR_DARK_BG);
    }
  }

  function scanSubtree(root) {
    if (!root) return;

    if (root.nodeType === Node.ELEMENT_NODE) {
      adjustElement(root);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let current = walker.nextNode();
    let count = 0;

    while (current && count < 5000) {
      adjustElement(current);
      current = walker.nextNode();
      count += 1;
    }
  }

  function setBaseVars() {
    document.documentElement.style.setProperty("--nsl-dawn-bg", BG0);
    document.documentElement.style.setProperty("--nsl-dawn-surface", BG1);
    document.documentElement.style.setProperty("--nsl-dawn-surface-2", BG2);
  }

  let observer;

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) scanSubtree(node);
          });
        }

        if (m.type === "attributes" && m.target instanceof Element) {
          adjustElement(m.target);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"]
    });
  }

  function stopObserver() {
    if (!observer) return;
    observer.disconnect();
    observer = undefined;
  }

  function applyIfNeeded() {
    if (rootBackgroundIsHarsh()) {
      document.documentElement.setAttribute(MARK, "on");
      setBaseVars();
      scanSubtree(document.documentElement);
      startObserver();
    } else {
      document.documentElement.removeAttribute(MARK);
      stopObserver();
      clearAdjustments();
    }
  }

  function boot() {
    applyIfNeeded();
    window.addEventListener("pageshow", applyIfNeeded, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
