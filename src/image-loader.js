// image-loader.js - Плавное появление изображений после загрузки

/**
 * Селекторы изображений для плавного появления
 */
const IMAGE_SELECTORS = [
  '.hero__photo',
  '.venue__photo',
  '.contacts__photo',
  '.finale__photo',
];

/**
 * Добавляет класс 'loaded' после загрузки изображения
 * @param {HTMLImageElement} img
 */
function handleImageLoad(img) {
  if (img.complete) {
    // Изображение уже загружено (из кэша)
    img.classList.add('loaded');
  } else {
    // Ждём загрузки
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    }, { once: true });

    // На случай ошибки тоже показываем (alt текст)
    img.addEventListener('error', () => {
      img.classList.add('loaded');
    }, { once: true });
  }
}

/**
 * Инициализация плавной загрузки изображений
 */
export function initImageLoader() {
  const images = document.querySelectorAll(IMAGE_SELECTORS.join(', '));

  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      handleImageLoad(img);
    }
  });

  return {
    destroy: () => {
      // Ничего не нужно очищать - обработчики одноразовые
    },
  };
}
