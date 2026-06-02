// ═══════════════════════════════════════════════════
// LIFEBOOK - NOTIFICATION SYSTEM (OneSignal via Median.co)
// ═══════════════════════════════════════════════════

(function () {
  const NOTIF_INTERVAL = 2 * 60 * 1000; // 2 minutes
  const SNOOZE_DELAY = 1 * 60 * 1000;   // 1 minute snooze

  const NOTIF_MESSAGES = [
    { title: '📖 LifeBook Reminder', body: 'Time to check your progress!' },
    { title: '🎯 Stay on Track', body: 'Have you completed your task?' },
    { title: '💪 Keep Going!', body: 'Your goals are waiting for you.' },
    { title: '🔥 Don\'t Break the Streak!', body: 'Open LifeBook and stay consistent.' },
    { title: '⏰ Quick Check-in', body: 'Take a moment to review your queue.' },
  ];

  let intervalId = null;

  // ─── Get a random notification message ───
  function getRandomMessage() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
  }

  // ─── Send notification via Median.co OneSignal bridge ───
  function sendNotification() {
    const msg = getRandomMessage();

    // Median.co native bridge for OneSignal local notifications
    if (window.median && median.onesignal) {
      // Use median's JS bridge to post a notification
      median.onesignal.postNotification({
        title: msg.title,
        body: msg.body,
        buttons: [
          { id: 'done', text: 'Done' },
          { id: 'snooze', text: '1 min snooze' }
        ]
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Fallback: Web Notification API (for browser testing)
      showWebNotification(msg);
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(function (perm) {
        if (perm === 'granted') showWebNotification(msg);
      });
    }
  }

  // ─── Web Notification fallback (for browser testing) ───
  function showWebNotification(msg) {
    const notif = new Notification(msg.title, {
      body: msg.body,
      icon: '/icon-192.png',
      actions: [
        { action: 'done', title: 'Done' },
        { action: 'snooze', title: '1 min snooze' }
      ],
      requireInteraction: true,
      tag: 'lifebook-reminder'
    });

    notif.onclick = function () {
      handleAction('done');
      notif.close();
    };
  }

  // ─── Handle notification button actions ───
  function handleAction(actionId) {
    if (actionId === 'done') {
      console.log('[LifeBook Notif] User tapped Done — dismissed.');
      showToast('✅ Marked as done!');
    } else if (actionId === 'snooze') {
      console.log('[LifeBook Notif] User tapped Snooze — will remind in 1 min.');
      showToast('⏰ Snoozed for 1 minute');
      setTimeout(sendNotification, SNOOZE_DELAY);
    }
  }

  // ─── Listen for Median.co OneSignal action events ───
  function setupMedianListeners() {
    // Median fires this event when a notification action button is tapped
    if (window.median && median.onesignal) {
      median.onesignal.onNotificationAction = function (data) {
        handleAction(data.actionId || data.action);
      };

      // Also listen for notification opened (tap on body)
      median.onesignal.onNotificationOpened = function () {
        handleAction('done');
      };
    }

    // Service Worker message listener (for web fallback)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'notif-action') {
          handleAction(event.data.action);
        }
      });
    }
  }

  // ─── Start the recurring notification timer ───
  function startNotifications() {
    if (intervalId) return;
    intervalId = setInterval(sendNotification, NOTIF_INTERVAL);
    console.log('[LifeBook Notif] Started — will fire every 2 minutes.');
  }

  // ─── Stop the recurring notifications ───
  function stopNotifications() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('[LifeBook Notif] Stopped.');
    }
  }

  // ─── Toast helper (reuses existing toast container) ───
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ─── Initialize ───
  function init() {
    setupMedianListeners();

    // Request permission if using web notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Auto-start notifications for testing
    startNotifications();

    // Send one immediately so you don't have to wait 2 min
    setTimeout(sendNotification, 3000);
  }

  // Expose controls globally for debugging
  window.LifeBookNotif = {
    start: startNotifications,
    stop: stopNotifications,
    sendNow: sendNotification
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
