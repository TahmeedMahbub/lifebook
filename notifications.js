// ═══════════════════════════════════════════════════
// LIFEBOOK - NATIVE PUSH NOTIFICATION SYSTEM
// Uses Median.co JavaScript bridge for real Android notifications
// Tap "Alerts" → instant native push → repeats every 2 min
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
  let notifCounter = 0;

  function getRandomMessage() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
  }

  // ─── Send a NATIVE push notification via Median.co bridge ───
  function sendNativeNotification(delaySec) {
    delaySec = delaySec || 0;
    notifCounter++;
    const msg = getRandomMessage();
    const notifId = 1000 + notifCounter;

    // Method 1: Median.co oneSignalSendSelfNotification (preferred)
    if (window.median && median.onesignal && median.onesignal.sendSelfNotification) {
      median.onesignal.sendSelfNotification({
        title: msg.title,
        message: msg.body,
        buttons: [
          { id: 'done', text: 'Done' },
          { id: 'snooze', text: '1 min snooze' }
        ]
      });
      console.log('[LifeBook] Native notification sent via OneSignal bridge');
      return;
    }

    // Method 2: Median.co local notifications API
    if (window.median && median.localNotifications) {
      median.localNotifications.schedule({
        id: notifId,
        title: msg.title,
        body: msg.body,
        delay: delaySec,
        sound: true,
        buttons: [
          { id: 'done', text: 'Done' },
          { id: 'snooze', text: '1 min snooze' }
        ]
      });
      console.log('[LifeBook] Native notification scheduled via localNotifications');
      return;
    }

    // Method 3: GoNative legacy bridge (older Median.co versions)
    if (window.gonative && gonative.localNotifications) {
      gonative.localNotifications.schedule({
        id: notifId,
        title: msg.title,
        body: msg.body,
        delay: delaySec,
        sound: true
      });
      console.log('[LifeBook] Native notification sent via GoNative bridge');
      return;
    }

    // Method 4: Median URL scheme approach
    if (window.median) {
      try {
        var url = 'median://localNotification/schedule?' +
          'id=' + notifId +
          '&title=' + encodeURIComponent(msg.title) +
          '&body=' + encodeURIComponent(msg.body) +
          '&delay=' + delaySec;
        window.location.href = url;
        console.log('[LifeBook] Native notification via URL scheme');
        return;
      } catch(e) {}
    }

    // Method 5: Web Notification API fallback (for browser testing only)
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(msg.title, { body: msg.body, icon: '/icon-192.png', tag: 'lifebook-' + notifId });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(function(p) {
          if (p === 'granted') new Notification(msg.title, { body: msg.body, icon: '/icon-192.png' });
        });
      }
    }

    console.log('[LifeBook] Fallback web notification used');
  }

  // ─── Schedule repeating notifications using native scheduling ───
  function scheduleRepeating() {
    // Try to use native repeat scheduling
    if (window.median && median.localNotifications && median.localNotifications.scheduleRepeating) {
      for (var i = 1; i <= 30; i++) { // schedule next 30 (1 hour worth)
        var msg = getRandomMessage();
        median.localNotifications.schedule({
          id: 2000 + i,
          title: msg.title,
          body: msg.body,
          delay: i * 120, // every 2 min (120 sec)
          sound: true
        });
      }
      console.log('[LifeBook] Scheduled 30 native notifications (every 2 min)');
      return true;
    }
    return false;
  }

  // ─── Start JS-based interval (backup for when native repeat isn't available) ───
  function startInterval() {
    if (intervalId) return;

    // Try native repeating first
    var nativeScheduled = scheduleRepeating();

    // Also run JS interval as backup (works while app is in foreground)
    intervalId = setInterval(function() {
      sendNativeNotification(0);
    }, NOTIF_INTERVAL);

    console.log('[LifeBook] Notification interval started (every 2 min)');
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    // Cancel any scheduled native notifications
    if (window.median && median.localNotifications && median.localNotifications.cancel) {
      for (var i = 1; i <= 30; i++) {
        median.localNotifications.cancel({ id: 2000 + i });
      }
    }
  }

  // ─── Handle notification action callbacks from Median.co ───
  function setupMedianCallbacks() {
    // Median.co fires these when user taps notification buttons
    if (window.median) {
      // OneSignal notification action handler
      if (median.onesignal) {
        median.onesignal.onNotificationAction = function(data) {
          var action = data.actionId || data.action || data.id || '';
          if (action === 'snooze') {
            sendNativeNotification(60); // 1 min later
            showToast('⏰ Snoozed — reminding in 1 min');
          } else {
            showToast('✅ Done!');
          }
        };
        median.onesignal.onNotificationOpened = function() {
          showToast('✅ Notification opened');
        };
      }

      // Local notification action handler
      if (median.localNotifications) {
        median.localNotifications.onAction = function(data) {
          var action = data.actionId || data.action || data.id || '';
          if (action === 'snooze') {
            sendNativeNotification(60);
            showToast('⏰ Snoozed — reminding in 1 min');
          } else {
            showToast('✅ Done!');
          }
        };
      }
    }
  }

  // ─── Toast helper ───
  function showToast(message) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ─── Intercept Alerts nav tap ───
  function init() {
    setupMedianCallbacks();

    document.addEventListener('click', function (e) {
      var navItem = e.target.closest('[data-page="notifications"]');
      if (navItem) {
        e.preventDefault();
        // Send native notification IMMEDIATELY
        sendNativeNotification(0);
        showToast('🔔 Notifications activated!');
        // Start repeating every 2 minutes
        startInterval();
      }
    });
  }

  // Expose for debugging
  window.LifeBookNotif = {
    send: function() { sendNativeNotification(0); },
    start: startInterval,
    stop: stopInterval
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
