// hero.js (ESM)
import { createInViewObserver } from './utils.js';

/**
 * Включает reveal-анимацию hero-секции.
 * Fallback: если IntersectionObserver не доступен — сразу показываем контент.
 */
export function setupHeroReveal(sectionEl) {
  if (!sectionEl) return { destroy: () => {} };

  // Если пользователь предпочитает reduced motion — сразу показываем.
  const prefersReducedMotion =
    typeof window !== "undefined" &&
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

  return {
    destroy: () => observer.disconnect(),
  };
}

/**
 * Авто-инициализация (можно убрать и инициализировать вручную).
 */
export function initHero() {
  const el = document.querySelector("#hero");
  return setupHeroReveal(el);
}