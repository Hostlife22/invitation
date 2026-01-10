// section7.js
/* eslint-env browser */

function normalizePhoneToTel(phone) {
  if (typeof phone !== "string" || phone.trim() === "") {
    throw new Error("phone is required");
  }
  // Оставляем + и цифры
  const cleaned = phone.trim().replace(/[^\d+]/g, "");
  // Если нет + — не добавляем насильно (могут быть локальные номера), но у вас есть +
  return cleaned;
}

function buildTelHref(phone) {
  return `tel:${normalizePhoneToTel(phone)}`;
}

async function copyToClipboard(text, nav = navigator) {
  if (!text) return false;
  if (!nav || !nav.clipboard || typeof nav.clipboard.writeText !== "function") return false;
  await nav.clipboard.writeText(text);
  return true;
}

export function setupContacts(sectionEl, { locationObj = window.location, nav = navigator } = {}) {
  if (!sectionEl) return { destroy: () => {} };

  const name = sectionEl.dataset.contactName || "Контакт";
  const phoneRaw = sectionEl.dataset.contactPhone || "";
  const tel = buildTelHref(phoneRaw);

  const phoneEl = sectionEl.querySelector("#contact-phone");
  const ctaEl = sectionEl.querySelector("#contact-cta");
  const statusEl = sectionEl.querySelector("#contact-status");

  if (phoneEl) {
    phoneEl.href = tel;
    phoneEl.textContent = phoneRaw;
  }

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg;
  };

  const onCtaClick = () => {
    // Открываем dialer (на мобилках) / обработчик tel: (на десктопе)
    locationObj.assign(tel);
  };

  const onPhoneClick = async (e) => {
    // Не мешаем обычному tel: переходу, но параллельно пытаемся скопировать
    const ok = await copyToClipboard(phoneRaw, nav);
    if (ok) setStatus(`Номер ${name} скопирован`);
  };

  if (ctaEl) ctaEl.addEventListener("click", onCtaClick);
  if (phoneEl) phoneEl.addEventListener("click", onPhoneClick);

  return {
    destroy: () => {
      if (ctaEl) ctaEl.removeEventListener("click", onCtaClick);
      if (phoneEl) phoneEl.removeEventListener("click", onPhoneClick);
    },
  };
}

export function initContactsSection() {
  const sectionEl = document.querySelector("#contacts");
  if (!sectionEl) return;
  setupContacts(sectionEl);
}