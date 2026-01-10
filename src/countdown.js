// section5.js
/* eslint-env browser */
import { getRemainingParts, pad2 } from './utils.js';

function parseTargetMs(sectionEl) {
  const raw = sectionEl?.dataset?.target;
  if (!raw) throw new Error("Missing data-target on #countdown");

  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) throw new Error("Invalid data-target value (must be ISO date string)");

  return ms;
}

function renderCountdown(sectionEl, parts) {
  const d = sectionEl.querySelector("#cd-days");
  const h = sectionEl.querySelector("#cd-hours");
  const m = sectionEl.querySelector("#cd-mins");
  const s = sectionEl.querySelector("#cd-secs");
  const status = sectionEl.querySelector("#cd-status");

  if (d) d.textContent = String(parts.days);
  if (h) h.textContent = pad2(parts.hours);
  if (m) m.textContent = pad2(parts.mins);
  if (s) s.textContent = pad2(parts.secs);

  if (status) {
    status.textContent = parts.diffMs === 0 ? "Событие уже началось" : "";
  }
}

export function setupCountdown(sectionEl, { now = () => Date.now() } = {}) {
  if (!sectionEl) return { destroy: () => {} };

  const targetMs = parseTargetMs(sectionEl);

  const tick = () => {
    const parts = getRemainingParts(now(), targetMs);
    renderCountdown(sectionEl, parts);
  };

  tick();
  const timerId = window.setInterval(tick, 1000);

  return {
    destroy: () => window.clearInterval(timerId),
  };
}

export function initCountdownSection() {
  const sectionEl = document.querySelector("#countdown");
  if (!sectionEl) return;
  setupCountdown(sectionEl);
}