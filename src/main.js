// main.js - Главный файл инициализации приложения
import { initContactsSection } from './contacts.js';
import { initCountdownSection } from './countdown.js';
import { initFinaleSection } from './finale.js';
import { initGuestFormSection } from './guest-form.js';
import { initHero } from './hero.js';
import { initInviteDateSection } from './invite-date.js';
import { initMobile } from './mobile.js';
import { initTimelineSection } from './timeline.js';
import { initVenueSection } from './venue.js';
import { initWishesSection } from './wishes.js';

// Инициализация всех секций после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initInviteDateSection();
  initVenueSection();
  initTimelineSection();
  initCountdownSection();
  initWishesSection();
  initContactsSection();
  initGuestFormSection();
  initFinaleSection();

  // Инициализация мобильного функционала
  initMobile();
});