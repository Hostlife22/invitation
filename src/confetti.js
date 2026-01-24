// confetti.js - Лёгкий эффект конфетти для праздничных моментов

/**
 * Настройки конфетти
 */
const CONFIG = {
  particleCount: 50,
  spread: 70,
  startVelocity: 30,
  decay: 0.94,
  gravity: 1,
  ticks: 200,
  colors: ['#f4efe6', '#39412f', '#5a7247', '#8b9a7d', '#d4c9b8'],
  shapes: ['square', 'circle'], // Элегантные формы для свадьбы
};

/**
 * Создаёт частицу конфетти
 */
function createParticle(origin) {
  const angle = (Math.random() * CONFIG.spread - CONFIG.spread / 2) * (Math.PI / 180);
  const velocity = CONFIG.startVelocity * (0.5 + Math.random() * 0.5);

  return {
    x: origin.x,
    y: origin.y,
    vx: Math.sin(angle) * velocity,
    vy: -Math.cos(angle) * velocity,
    color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
    shape: CONFIG.shapes[Math.floor(Math.random() * CONFIG.shapes.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    tick: 0,
  };
}

/**
 * Рисует частицу на canvas
 */
function drawParticle(ctx, particle) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate((particle.rotation * Math.PI) / 180);
  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = particle.color;

  if (particle.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
  }

  ctx.restore();
}

/**
 * Обновляет позицию частицы
 */
function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vy += CONFIG.gravity;
  particle.vx *= CONFIG.decay;
  particle.vy *= CONFIG.decay;
  particle.rotation += particle.rotationSpeed;
  particle.tick++;

  // Плавное затухание
  const progress = particle.tick / CONFIG.ticks;
  particle.opacity = 1 - progress;

  return particle.tick < CONFIG.ticks;
}

/**
 * Запускает анимацию конфетти
 * @param {HTMLElement} [container] - Контейнер для canvas (по умолчанию body)
 * @param {Object} [origin] - Точка запуска { x, y } (по умолчанию центр экрана)
 */
export function launchConfetti(container = document.body, origin = null) {
  // Проверяем prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Создаём canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Точка запуска
  const launchOrigin = origin || {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  // Создаём частицы
  const particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(createParticle(launchOrigin));
  }

  // Анимация
  let animationId;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фильтруем живые частицы и обновляем/рисуем их
    const aliveParticles = [];
    for (const particle of particles) {
      if (updateParticle(particle)) {
        drawParticle(ctx, particle);
        aliveParticles.push(particle);
      }
    }

    particles.length = 0;
    particles.push(...aliveParticles);

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Удаляем canvas когда анимация завершена
      canvas.remove();
    }
  }

  animate();

  // Возвращаем функцию для принудительной остановки
  return () => {
    cancelAnimationFrame(animationId);
    canvas.remove();
  };
}

/**
 * Запускает конфетти из центра элемента
 * @param {HTMLElement} element - Элемент, из которого запускать конфетти
 */
export function launchConfettiFromElement(element) {
  const rect = element.getBoundingClientRect();
  const origin = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  return launchConfetti(document.body, origin);
}
