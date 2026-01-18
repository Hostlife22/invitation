// telegram.js - Модуль для отправки данных формы в Telegram

/**
 * Конфигурация Telegram бота.
 * ВАЖНО: Замените значения на свои!
 *
 * BOT_TOKEN - получите от @BotFather в Telegram
 * CHAT_ID - ваш ID или ID группы (узнать через @userinfobot или @getmyid_bot)
 */
const TELEGRAM_CONFIG = {
  BOT_TOKEN: "7629682299:AAEjlZKu7_DbPhmwLTWFhBF3Wmuzq-VgNi0", // Замените на токен вашего бота
  CHAT_ID: "1257871143", // Замените на ваш Chat ID
};

/**
 * Форматирует данные формы в читаемое сообщение для Telegram (HTML).
 * @param {Object} data - данные формы
 * @returns {string} - отформатированное сообщение
 */
function formatMessage(data) {
  const attendanceText = data.attendance === 'yes'
    ? '✅ Да, приду!'
    : '❌ Не смогу прийти';

  const prefsText = data.prefs && data.prefs.length > 0
    ? data.prefs.join(', ')
    : 'Не указаны';

  const lines = [
    '🎉 <b>Новый ответ на приглашение!</b>',
    '',
    `👤 <b>Имя:</b> ${escapeHtml(data.name)}`,
    `📋 <b>Присутствие:</b> ${attendanceText}`,
  ];

  if (data.attendance === 'yes') {
    lines.push(`🍷 <b>Предпочтения:</b> ${escapeHtml(prefsText)}`);
  }

  lines.push('', `🕐 <i>${new Date().toLocaleString('ru-RU')}</i>`);

  return lines.join('\n');
}

/**
 * Экранирует HTML символы для Telegram.
 * @param {string} text - исходный текст
 * @returns {string} - экранированный текст
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Отправляет данные формы в Telegram.
 * @param {Object} data - данные формы { name, attendance, prefs }
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendToTelegram(data) {
  const { BOT_TOKEN, CHAT_ID } = TELEGRAM_CONFIG;

  // Проверка конфигурации
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.warn('Telegram: Не настроен BOT_TOKEN или CHAT_ID в telegram.js');
    return { success: false, error: 'Telegram не настроен' };
  }

  const message = formatMessage(data);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return { success: false, error: result.description || 'Ошибка отправки' };
    }

    return { success: true };
  } catch (error) {
    console.error('Telegram fetch error:', error);
    return { success: false, error: 'Ошибка сети' };
  }
}

/**
 * Проверяет, настроен ли Telegram.
 * @returns {boolean}
 */
export function isTelegramConfigured() {
  const { BOT_TOKEN, CHAT_ID } = TELEGRAM_CONFIG;
  return BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' && CHAT_ID !== 'YOUR_CHAT_ID_HERE';
}
