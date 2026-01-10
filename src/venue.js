// section3.js
/* eslint-env browser */

function buildGoogleMapsUrl(address) {
  if (typeof address !== "string" || address.trim() === "") {
    throw new Error("Address is required");
  }
  const q = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function setupVenueRouteButton(sectionEl, buttonEl) {
  if (!sectionEl || !buttonEl) return { destroy: () => {} };

  const address = sectionEl.dataset.address || "";
  const url = buildGoogleMapsUrl(address);

  const onClick = () => {
    // noopener — безопасность
    window.open(url, "_blank", "noopener,noreferrer");
  };

  buttonEl.addEventListener("click", onClick);

  return {
    destroy: () => buttonEl.removeEventListener("click", onClick),
  };
}

export function initVenueSection() {
  const sectionEl = document.querySelector("#venue");
  if (!sectionEl) return;

  const btn = sectionEl.querySelector("#venue-route-btn");
  setupVenueRouteButton(sectionEl, btn);
}