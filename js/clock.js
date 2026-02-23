// ============================================================
// clock.js — 时钟显示
// ============================================================

function updateClock() {
  const now = new Date();
  const use24Hour = localStorage.getItem('timeFormat') !== '12';

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  if (use24Hour) {
    hours = String(hours).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}`;
  } else {
    hours = hours % 12 || 12;
    timeEl.textContent = `${hours}:${minutes}`;
  }
}
