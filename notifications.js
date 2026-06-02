// ═══════════════════════════════════════════════════
// LIFEBOOK - NOTIFICATION SYSTEM
// Tap "Alerts" → instant notification → repeats every 2 min
// ═══════════════════════════════════════════════════

(function () {
  const NOTIF_INTERVAL = 2 * 60 * 1000; // 2 minutes
  const SNOOZE_DELAY = 1 * 60 * 1000;   // 1 minute

  const NOTIF_MESSAGES = [
    { title: '📖 LifeBook Reminder', body: 'Time to check your progress!' },
    { title: '🎯 Stay on Track', body: 'Have you completed your task?' },
    { title: '💪 Keep Going!', body: 'Your goals are waiting for you.' },
    { title: '🔥 Don\'t Break the Streak!', body: 'Open LifeBook and stay consistent.' },
    { title: '⏰ Quick Check-in', body: 'Take a moment to review your queue.' },
  ];

  let intervalId = null;
  let bannerEl = null;

  function getRandomMessage() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
  }

  // ─── Create the notification banner element (once) ───
  function ensureBanner() {
    if (bannerEl) return;
    bannerEl = document.createElement('div');
    bannerEl.id = 'notif-banner';
    bannerEl.innerHTML = `
      <div class="notif-banner-content">
        <div class="notif-banner-icon">🔔</div>
        <div class="notif-banner-text">
          <div class="notif-banner-title"></div>
          <div class="notif-banner-body"></div>
        </div>
        <button class="notif-banner-close" aria-label="Close">&times;</button>
      </div>
      <div class="notif-banner-actions">
        <button class="notif-btn notif-btn-done">✅ Done</button>
        <button class="notif-btn notif-btn-snooze">⏰ 1 min snooze</button>
      </div>
    `;
    document.body.appendChild(bannerEl);

    // Event listeners
    bannerEl.querySelector('.notif-banner-close').addEventListener('click', hideBanner);
    bannerEl.querySelector('.notif-btn-done').addEventListener('click', function () {
      hideBanner();
      showToast('✅ Marked as done!');
    });
    bannerEl.querySelector('.notif-btn-snooze').addEventListener('click', function () {
      hideBanner();
      showToast('⏰ Snoozed — reminding in 1 min');
      setTimeout(showNotification, SNOOZE_DELAY);
    });
  }

  // ─── Show in-app notification banner ───
  function showNotification() {
    ensureBanner();
    const msg = getRandomMessage();
    bannerEl.querySelector('.notif-banner-title').textContent = msg.title;
    bannerEl.querySelector('.notif-banner-body').textContent = msg.body;
    bannerEl.classList.add('visible');

    // Also vibrate if supported (mobile)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // Auto-hide after 30 seconds if no action
    clearTimeout(bannerEl._autoHide);
    bannerEl._autoHide = setTimeout(hideBanner, 30000);
  }

  function hideBanner() {
    if (bannerEl) {
      bannerEl.classList.remove('visible');
      clearTimeout(bannerEl._autoHide);
    }
  }

  // ─── Start repeating every 2 minutes ───
  function startInterval() {
    if (intervalId) return;
    intervalId = setInterval(showNotification, NOTIF_INTERVAL);
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // ─── Toast helper ───
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ─── Intercept Alerts nav tap ───
  function init() {
    document.addEventListener('click', function (e) {
      const navItem = e.target.closest('[data-page="notifications"]');
      if (navItem) {
        e.preventDefault();
        // Show notification instantly
        showNotification();
        // Start the 2-minute repeating cycle
        startInterval();
      }
    });
  }

  // Expose for debugging
  window.LifeBookNotif = {
    show: showNotification,
    start: startInterval,
    stop: stopInterval
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
