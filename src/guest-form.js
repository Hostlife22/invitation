// guest-form.js - Секция анкеты гостя
/* eslint-env browser */

import { sendToTelegram } from './telegram.js';

function readFormData(formEl) {
  const fd = new FormData(formEl);

  const name = String(fd.get("name") || "").trim();
  const attendance = String(fd.get("attendance") || ""); // "yes" | "no"
  const prefs = fd.getAll("prefs").map((v) => String(v));

  return { name, attendance, prefs };
}

function validateRsvp(data) {
  const errors = {};

  if (!data.name) errors.name = "Пожалуйста, укажите имя и фамилию.";
  if (!data.attendance) errors.attendance = "Пожалуйста, выберите вариант ответа.";

  return errors;
}

function shouldDisablePrefs(attendance) {
  return attendance === "no";
}

function setPrefsDisabled(fieldsetEl, disabled) {
  if (!fieldsetEl) return;

  fieldsetEl.classList.toggle("is-disabled", disabled);

  const inputs = fieldsetEl.querySelectorAll('input[type="checkbox"][name="prefs"]');
  inputs.forEach((el) => {
    el.disabled = disabled;
    if (disabled) el.checked = false;
  });
}

function renderErrors(sectionEl, errors) {
  const errName = sectionEl.querySelector("#err-name");
  const errAttendance = sectionEl.querySelector("#err-attendance");

  if (errName) errName.textContent = errors.name || "";
  if (errAttendance) errAttendance.textContent = errors.attendance || "";
}

function saveToLocalStorage(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function setupGuestForm(sectionEl, { storageKey = "rsvp" } = {}) {
  if (!sectionEl) return { destroy: () => {} };

  const formEl = sectionEl.querySelector("#rsvp-form");
  const prefsFieldset = sectionEl.querySelector("#prefs-fieldset");
  const statusEl = sectionEl.querySelector("#rsvp-status");

  if (!formEl) return { destroy: () => {} };

  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = text || "";
  };

  const syncPrefsByAttendance = () => {
    const data = readFormData(formEl);
    setPrefsDisabled(prefsFieldset, shouldDisablePrefs(data.attendance));
  };

  const onChange = () => {
    setStatus("");
    syncPrefsByAttendance();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    const data = readFormData(formEl);
    const errors = validateRsvp(data);

    renderErrors(sectionEl, errors);

    if (Object.keys(errors).length > 0) {
      setStatus("Пожалуйста, проверьте поля формы.");
      return;
    }

    // Enforce prefs logic
    const payload = {
      ...data,
      prefs: shouldDisablePrefs(data.attendance) ? [] : data.prefs,
      submittedAt: new Date().toISOString(),
    };

    // Блокируем кнопку на время отправки
    const submitBtn = formEl.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus("Отправка...");

    // Отправляем в Telegram
    const telegramResult = await sendToTelegram(payload);

    if (telegramResult.success) {
      saveToLocalStorage(storageKey, payload);
      setStatus("Спасибо! Ваш ответ отправлен.");
    } else {
      // Сохраняем локально даже при ошибке Telegram
      saveToLocalStorage(storageKey, payload);
      setStatus("Ответ сохранён. Проверьте соединение.");
      console.warn("Telegram error:", telegramResult.error);
    }

    if (submitBtn) submitBtn.disabled = false;
  };

  formEl.addEventListener("change", onChange);
  formEl.addEventListener("submit", onSubmit);

  // initial
  syncPrefsByAttendance();

  return {
    destroy: () => {
      formEl.removeEventListener("change", onChange);
      formEl.removeEventListener("submit", onSubmit);
    },
  };
}

export function initGuestFormSection() {
  const sectionEl = document.querySelector("#guest-form");
  if (!sectionEl) return;
  setupGuestForm(sectionEl);
}