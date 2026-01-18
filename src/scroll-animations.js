// scroll-animations.js - Модуль для scroll-анимаций появления элементов

import { createInViewObserver } from './utils.js';

/**
 * Настройки scroll-анимации.
 * @param {HTMLElement} container - контейнер для поиска элементов (по умолчанию document)
 * @param {Object} options - опции для IntersectionObserver
 * @returns {{ destroy: () => void }} - объект с методом destroy для очистки
 */
export function setupScrollAnimations(container = document, options = {}) {
  const selector = '.animate-on-scroll';
  const elements = container.querySelectorAll(selector);

  if (!elements.length) {
    return { destroy: () => {} };
  }

  // Настройки observer по умолчанию
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  };

  // Callback при появлении элемента в viewport
  const handleIntersect = (entry) => {
    const el = entry.target;
    el.classList.add('is-visible');

    // Отписываемся после появления (анимация одноразовая)
    if (observer) {
      observer.unobserve(el);
    }
  };

  const observer = createInViewObserver(handleIntersect, observerOptions);

  // Если IntersectionObserver не поддерживается - показываем все элементы сразу
  if (!observer) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return { destroy: () => {} };
  }

  // Начинаем наблюдение за элементами
  elements.forEach((el) => observer.observe(el));

  // Функция очистки
  const destroy = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  return { destroy };
}

/**
 * Инициализация scroll-анимаций для всего документа.
 * Вызывается один раз при загрузке страницы.
 */
export function initScrollAnimations() {
  return setupScrollAnimations(document);
}

/**
 * Добавляет классы анимации к элементам секции.
 * Вспомогательная функция для программного добавления анимаций.
 *
 * @param {HTMLElement} section - секция
 * @param {Array<{selector: string, animation: string, delay?: string}>} config - конфигурация
 */
export function applyAnimations(section, config) {
  config.forEach(({ selector, animation, delay }) => {
    const elements = section.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.add('animate-on-scroll', animation);
      if (delay) {
        el.classList.add(delay);
      }
    });
  });
}
