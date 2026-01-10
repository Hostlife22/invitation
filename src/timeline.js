// section4.js
/* eslint-env browser */

function getTimelineItems(rootEl) {
  if (!rootEl) return [];
  return Array.from(rootEl.querySelectorAll(".timeline__item"));
}

function setActiveItem(items, activeEl) {
  for (const el of items) {
    el.classList.toggle("is-active", el === activeEl);
  }
}

export function setupTimelineSelection(rootEl) {
  const items = getTimelineItems(rootEl);
  if (items.length === 0) return { destroy: () => {} };

  const onClick = (e) => {
    const item = e.target.closest(".timeline__item");
    if (!item) return;
    setActiveItem(items, item);
  };

  const onKeyDown = (e) => {
    const item = e.target.closest(".timeline__item");
    if (!item) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveItem(items, item);
    }
  };

  rootEl.addEventListener("click", onClick);
  rootEl.addEventListener("keydown", onKeyDown);

  return {
    destroy: () => {
      rootEl.removeEventListener("click", onClick);
      rootEl.removeEventListener("keydown", onKeyDown);
    },
  };
}

export function initTimelineSection() {
  const rootEl = document.querySelector("#timeline");
  if (!rootEl) return;
  setupTimelineSelection(rootEl);
}