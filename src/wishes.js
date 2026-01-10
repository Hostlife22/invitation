// section6.js
/* eslint-env browser */
import { clampIndex } from './utils.js';

function createSliderModel(items, startIndex = 0) {
  if (!Array.isArray(items)) throw new TypeError("items must be an array");
  if (items.length === 0) throw new Error("items must not be empty");

  return {
    items: items.slice(),
    index: clampIndex(startIndex, items.length),
  };
}

function next(model) {
  model.index = clampIndex(model.index + 1, model.items.length);
  return model;
}

function prev(model) {
  model.index = clampIndex(model.index - 1, model.items.length);
  return model;
}

function current(model) {
  return model.items[model.index];
}

function render(model, { textEl, counterEl, prevBtn, nextBtn }) {
  if (textEl) textEl.textContent = current(model);
  if (counterEl) counterEl.textContent = `${model.index + 1} / ${model.items.length}`;

  const disabled = model.items.length <= 1;
  if (prevBtn) prevBtn.disabled = disabled;
  if (nextBtn) nextBtn.disabled = disabled;
}

export function setupWishesSlider(sectionEl, items) {
  if (!sectionEl) return { destroy: () => {} };

  const textEl = sectionEl.querySelector("#wishes-text");
  const counterEl = sectionEl.querySelector("#wishes-counter");
  const prevBtn = sectionEl.querySelector('[data-action="prev"]');
  const nextBtn = sectionEl.querySelector('[data-action="next"]');

  const model = createSliderModel(items, 0);

  const fadeSwap = (apply) => {
    if (!textEl) return apply();
    textEl.classList.add("is-fading");
    window.setTimeout(() => {
      apply();
      textEl.classList.remove("is-fading");
    }, 180);
  };

  const goPrev = () => fadeSwap(() => render(prev(model), { textEl, counterEl, prevBtn, nextBtn }));
  const goNext = () => fadeSwap(() => render(next(model), { textEl, counterEl, prevBtn, nextBtn }));

  const onClick = (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "prev") goPrev();
    if (action === "next") goNext();
  };

  const onKeyDown = (e) => {
    // Управление стрелками, когда фокус внутри секции
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  // initial render
  render(model, { textEl, counterEl, prevBtn, nextBtn });

  sectionEl.addEventListener("click", onClick);
  sectionEl.addEventListener("keydown", onKeyDown);

  return {
    destroy: () => {
      sectionEl.removeEventListener("click", onClick);
      sectionEl.removeEventListener("keydown", onKeyDown);
    },
  };
}

export function initWishesSection() {
  const sectionEl = document.querySelector("#wishes");
  if (!sectionEl) return;

  // Тексты можно заменить на ваши реальные (включая переносы строк через \n).
  const items = [
    "Будем очень признательны, если вместо\nцветов вы пополните наш домашний\nбар бутылочкой своего любимого\nнапитка, которое мы откроем на\nсемейном празднике ✨",
    "Пожалуйста, поддержите дресс‑код:\nспокойные, природные оттенки —\nнам будет очень приятно 🕊️",
    "Если захотите сказать тост —\nпусть он будет коротким, тёплым и\nот сердца. Мы это запомним 🤍",
  ];

  setupWishesSlider(sectionEl, items);
}