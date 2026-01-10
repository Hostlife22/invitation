// section9.js
/* eslint-env browser */
import { createInViewObserver } from './utils.js';

export function setupFinaleReveal(sectionEl) {
  if (!sectionEl) return { destroy: () => {} };

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    sectionEl.classList.add("is-revealed");
    return { destroy: () => {} };
  }

  const observer = createInViewObserver(() => {
    sectionEl.classList.add("is-revealed");
    observer && observer.disconnect();
  });

  if (!observer) {
    sectionEl.classList.add("is-revealed");
    return { destroy: () => {} };
  }

  observer.observe(sectionEl);

  return { destroy: () => observer.disconnect() };
}

export function initFinaleSection() {
  const sectionEl = document.querySelector("#finale");
  if (!sectionEl) return;
  setupFinaleReveal(sectionEl);
}