// section2.js
import { getMonthMatrix } from './utils.js';

/* eslint-env browser */

function renderCalendar(tbodyEl, { year, month, selectedDay }) {
  if (!tbodyEl) return;

  const weeks = getMonthMatrix({ year, month, weekStartsOn: 1 });
  const rowsHtml = weeks
    .map((week) => {
      const tds = week
        .map((cell) => {
          const isSelected = cell.inMonth && cell.day === selectedDay;
          const classes = [
            cell.inMonth ? "" : "is-outside",
            isSelected ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return `<td class="${classes}" ${isSelected ? 'aria-label="Выбранная дата"' : ""}>${cell.day}</td>`;
        })
        .join("");

      return `<tr>${tds}</tr>`;
    })
    .join("");

  tbodyEl.innerHTML = rowsHtml;
}

function parseSectionConfig(sectionEl) {
  const year = Number(sectionEl.dataset.year);
  const month = Number(sectionEl.dataset.month);
  const day = Number(sectionEl.dataset.day);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error("Missing or invalid data-year/data-month/data-day on section");
  }

  return { year, month, day };
}

export function initInviteDateSection() {
  const sectionEl = document.querySelector("#invite-date");
  if (!sectionEl) return;

  const { year, month, day } = parseSectionConfig(sectionEl);

  const tbody = sectionEl.querySelector("#calendar-body");
  renderCalendar(tbody, { year, month, selectedDay: day });
}