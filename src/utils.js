// utils.js
/**
 * Утилиты для всего приложения
 */

/**
 * Создаёт IntersectionObserver (если поддерживается).
 * Отдельная функция упрощает unit-тестирование через мок.
 */
export function createInViewObserver(onEnter, options = {}) {
  if (typeof window === "undefined") return null;
  if (!("IntersectionObserver" in window)) return null;

  const opts = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
    ...options,
  };

  return new window.IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) onEnter(entry);
    }
  }, opts);
}

/**
 * Возвращает остаток времени до targetMs.
 * nowMs и targetMs — числа в миллисекундах.
 */
export function getRemainingParts(nowMs, targetMs) {
  if (!Number.isFinite(nowMs) || !Number.isFinite(targetMs)) {
    throw new TypeError("nowMs and targetMs must be numbers");
  }

  let diff = Math.max(0, targetMs - nowMs);

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
 const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  return { diffMs: diff, days, hours, mins, secs };
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Возвращает матрицу недель для календаря.
 * weekStartsOn: 1 => ПН (как на скриншоте).
 */
export function getMonthMatrix({ year, month, weekStartsOn = 1 }) {
  // month: 1..12
 if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new TypeError("year and month must be integers");
  }
  if (month < 1 || month > 12) {
    throw new RangeError("month must be in 1..12");
  }

  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  // JS: 0=Sun..6=Sat. Нормализуем под weekStartsOn (1=Mon).
  const firstDow = firstOfMonth.getDay(); // 0..6
  const shift = (firstDow - weekStartsOn + 7) % 7;

  const weeks = [];
  let day = 1 - shift; // может быть отрицательным => предыдущий месяц

  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(year, month - 1, day);
      const inMonth = date.getMonth() === (month - 1);
      week.push({
        day: date.getDate(),
        inMonth,
      });
      day += 1;
    }
    weeks.push(week);
  }

  return weeks;
}

export function clampIndex(index, length) {
  if (length <= 0) return 0;
  // wrap-around
  return ((index % length) + length) % length;
}