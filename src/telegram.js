// telegram.js - Модуль для отправки данных формы в Telegram

/**
 * Конфигурация Telegram бота.
 * ВАЖНО: Замените значения на свои!
 *
 * BOT_TOKEN - получите от @BotFather в Telegram
 * CHAT_ID - ваш ID или ID группы (узнать через @userinfobot или @getmyid_bot)
 */
const TELEGRAM_CONFIG = {
  BOT_TOKEN: "8140189097:AAEF3YEFl8vnnS2yMiyANvkTKh3Ff7iE1LY", // Замените на токен вашего бота
  // BOT_TOKEN: "7629682299:AAEjlZKu7_DbPhmwLTWFhBF3Wmuzq-VgNi0", // Замените на токен вашего бота
  CHAT_IDS: ["1257871143", "531240569", "904088378"], // Замените на ваши Chat ID
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
  const { BOT_TOKEN, CHAT_IDS } = TELEGRAM_CONFIG;

  // Проверка конфигурации
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || 
      !Array.isArray(CHAT_IDS) || 
      CHAT_IDS.some(id => id === 'YOUR_CHAT_ID_HERE')) {
    console.warn('Telegram: Не настроены BOT_TOKEN или CHAT_IDS в telegram.js');
    return { success: false, error: 'Telegram не настроен' };
  }

  const message = formatMessage(data);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  // Отправляем сообщение во все чаты по очереди
  let successCount = 0;
  let errorMessages = [];

  for (const chatId of CHAT_IDS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        console.error(`Telegram API error for chat ${chatId}:`, result);
        errorMessages.push(`${chatId}: ${result.description || 'Ошибка отправки'}`);
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`Telegram fetch error for chat ${chatId}:`, error);
      errorMessages.push(`${chatId}: ${error.message || 'Ошибка сети'}`);
    }
  }

  if (successCount === 0) {
    return { success: false, error: errorMessages.join('; ') };
  }

  console.log(`Сообщение успешно отправлено в ${successCount} из ${CHAT_IDS.length} чатов`);
  return { success: true };
}

/**
 * Проверяет, настроен ли Telegram.
 * @returns {boolean}
 */
export function isTelegramConfigured() {
  const { BOT_TOKEN, CHAT_IDS } = TELEGRAM_CONFIG;
  return BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' && 
         Array.isArray(CHAT_IDS) && 
         CHAT_IDS.length > 0 && 
         !CHAT_IDS.some(id => id === 'YOUR_CHAT_ID_HERE');
}