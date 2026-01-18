// mobile.js - Функционал для мобильной версии

import { sendToTelegram } from './telegram.js';

/**
 * Проверяет, является ли устройство мобильным (по ширине экрана)
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth <= 768;
}

/**
 * Инициализация кнопки "Листайте вниз" в Hero секции
 */
function setupScrollButton() {
  const scrollBtn = document.getElementById('hero-scroll-btn');
  const inviteDateSection = document.getElementById('invite-date');

  if (!scrollBtn || !inviteDateSection) return;

  scrollBtn.addEventListener('click', () => {
    inviteDateSection.scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * Инициализация sticky CTA кнопки
 */
function setupStickyCta() {
  const stickyBtn = document.getElementById('sticky-cta-btn');
  const modal = document.getElementById('form-modal');

  if (!stickyBtn || !modal) return;

  stickyBtn.addEventListener('click', () => {
    openModal();
  });
}
function setupGuestCta() {
  const guestBtn = document.getElementById('guest-form__btn');
  const modal = document.getElementById('form-modal');

  if (!guestBtn || !modal) return;

  guestBtn.addEventListener('click', () => {
    openModal();
  });
}

/**
 * Инициализация модального окна
 */
function setupModal() {
  const modal = document.getElementById('form-modal');
  const closeBtn = document.getElementById('modal-close');
  const overlay = document.getElementById('modal-overlay');

  if (!modal || !closeBtn || !overlay) return;

  // Закрытие по кнопке
  closeBtn.addEventListener('click', closeModal);

  // Закрытие по клику на overlay
  overlay.addEventListener('click', closeModal);

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/**
 * Открытие модального окна
 */
function openModal() {
  const modal = document.getElementById('form-modal');
  if (!modal) return;

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  // Синхронизируем данные из основной формы в модальную
  syncFormData('rsvp-form', 'rsvp-form-modal');

  // Фокус на первое поле формы
  const firstInput = modal.querySelector('input[type="text"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

/**
 * Закрытие модального окна
 */
function closeModal() {
  const modal = document.getElementById('form-modal');
  if (!modal) return;

  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

/**
 * Синхронизация данных между формами
 * @param {string} sourceFormId - ID исходной формы
 * @param {string} targetFormId - ID целевой формы
 */
function syncFormData(sourceFormId, targetFormId) {
  const sourceForm = document.getElementById(sourceFormId);
  const targetForm = document.getElementById(targetFormId);

  if (!sourceForm || !targetForm) return;

  // Синхронизируем текстовые поля
  const sourceName = sourceForm.querySelector('input[name="name"]');
  const targetName = targetForm.querySelector('input[name="name"]');
  if (sourceName && targetName && sourceName.value) {
    targetName.value = sourceName.value;
  }

  // Синхронизируем radio buttons (attendance)
  const sourceAttendance = sourceForm.querySelector('input[name="attendance"]:checked');
  if (sourceAttendance) {
    const targetAttendance = targetForm.querySelector(`input[name="modal-attendance"][value="${sourceAttendance.value}"]`);
    if (targetAttendance) {
      targetAttendance.checked = true;
    }
  }

  // Синхронизируем checkboxes (prefs)
  const sourcePrefs = sourceForm.querySelectorAll('input[name="prefs"]:checked');
  sourcePrefs.forEach((checkbox) => {
    const targetCheckbox = targetForm.querySelector(`input[name="modal-prefs"][value="${checkbox.value}"]`);
    if (targetCheckbox) {
      targetCheckbox.checked = true;
    }
  });
}

/**
 * Обработка отправки модальной формы
 */
function setupModalFormSubmit() {
  const modalForm = document.getElementById('rsvp-form-modal');
  const mainForm = document.getElementById('rsvp-form');

  if (!modalForm) return;

  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Валидация
    const name = modalForm.querySelector('input[name="name"]');
    const attendance = modalForm.querySelector('input[name="modal-attendance"]:checked');
    const status = document.getElementById('modal-rsvp-status');
    const submitBtn = modalForm.querySelector('button[type="submit"]');

    // Очищаем предыдущие ошибки
    const errName = document.getElementById('modal-err-name');
    const errAttendance = document.getElementById('modal-err-attendance');
    if (errName) errName.textContent = '';
    if (errAttendance) errAttendance.textContent = '';

    if (!name || !name.value.trim()) {
      if (errName) errName.textContent = 'Пожалуйста, введите ваше имя';
      name?.focus();
      return;
    }

    if (!attendance) {
      if (errAttendance) errAttendance.textContent = 'Пожалуйста, выберите вариант';
      return;
    }

    // Собираем данные из модальной формы
    const formData = {
      name: name.value.trim(),
      attendance: attendance.value,
      prefs: []
    };

    const prefs = modalForm.querySelectorAll('input[name="modal-prefs"]:checked');
    prefs.forEach((pref) => {
      formData.prefs.push(pref.value);
    });

    // Блокируем кнопку на время отправки
    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = 'Отправка...';

    // Отправляем в Telegram
    const telegramResult = await sendToTelegram(formData);

    // Сохраняем в localStorage
    localStorage.setItem('rsvp', JSON.stringify(formData));

    // Синхронизируем с основной формой
    if (mainForm) {
      const mainName = mainForm.querySelector('input[name="name"]');
      if (mainName) mainName.value = formData.name;

      const mainAttendance = mainForm.querySelector(`input[name="attendance"][value="${formData.attendance}"]`);
      if (mainAttendance) mainAttendance.checked = true;

      // Сбрасываем все prefs и устанавливаем выбранные
      mainForm.querySelectorAll('input[name="prefs"]').forEach((cb) => {
        cb.checked = formData.prefs.includes(cb.value);
      });
    }

    // Показываем статус
    if (status) {
      if (telegramResult.success) {
        status.textContent = 'Спасибо! Ваш ответ отправлен.';
      } else {
        status.textContent = 'Ответ сохранён. Проверьте соединение.';
        console.warn('Telegram error:', telegramResult.error);
      }
    }

    if (submitBtn) submitBtn.disabled = false;

    // Закрываем модал через 1.5 секунды
    setTimeout(() => {
      closeModal();
      // Очищаем статус
      if (status) status.textContent = '';
    }, 1500);
  });
}

/**
 * Обработка disabled состояния для preferences в модальной форме
 */
function setupModalPrefsDisabling() {
  const modalForm = document.getElementById('rsvp-form-modal');
  if (!modalForm) return;

  const attendanceInputs = modalForm.querySelectorAll('input[name="modal-attendance"]');
  const prefsFieldset = document.getElementById('modal-prefs-fieldset');

  if (!prefsFieldset) return;

  attendanceInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const isNo = input.value === 'no' && input.checked;
      prefsFieldset.classList.toggle('is-disabled', isNo);

      // Отключаем/включаем чекбоксы
      const checkboxes = prefsFieldset.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        cb.disabled = isNo;
        if (isNo) cb.checked = false;
      });
    });
  });
}

/**
 * Загрузка сохранённых данных в модальную форму
 */
function loadSavedDataToModal() {
  const saved = localStorage.getItem('rsvp');
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    const modalForm = document.getElementById('rsvp-form-modal');
    if (!modalForm) return;

    // Имя
    const nameInput = modalForm.querySelector('input[name="name"]');
    if (nameInput && data.name) {
      nameInput.value = data.name;
    }

    // Attendance
    if (data.attendance) {
      const attendanceInput = modalForm.querySelector(`input[name="modal-attendance"][value="${data.attendance}"]`);
      if (attendanceInput) {
        attendanceInput.checked = true;
        // Триггерим событие для обработки disabled состояния prefs
        attendanceInput.dispatchEvent(new Event('change'));
      }
    }

    // Prefs
    if (data.prefs && Array.isArray(data.prefs)) {
      data.prefs.forEach((pref) => {
        const checkbox = modalForm.querySelector(`input[name="modal-prefs"][value="${pref}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
  } catch (e) {
    console.warn('Не удалось загрузить сохранённые данные:', e);
  }
}

/**
 * Скрытие sticky кнопки когда форма в viewport
 */
function setupStickyCtaVisibility() {
  const stickyCta = document.getElementById('sticky-cta');
  const guestFormSection = document.getElementById('guest-form');
  const finaleSection = document.getElementById('finale');

  if (!stickyCta || !guestFormSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === 'guest-form' || entry.target.id === 'finale') {
          // Скрываем sticky кнопку когда видна секция формы или финал
          stickyCta.style.opacity = entry.isIntersecting ? '0' : '1';
          stickyCta.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(guestFormSection);
  if (finaleSection) {
    observer.observe(finaleSection);
  }
}

/**
 * Главная функция инициализации мобильного функционала
 */
export function initMobile() {
  setupScrollButton();
  setupStickyCta();
  setupGuestCta();
  setupModal();
  setupModalFormSubmit();
  setupModalPrefsDisabling();
  loadSavedDataToModal();
  setupStickyCtaVisibility();
}
