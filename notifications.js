// ═══════════════════════════════════════════════════
// LIFEBOOK - PUSH NOTIFICATION SYSTEM
// Uses OneSignal REST API to send real push notifications
// Tap "Alerts" → sends push to THIS device → repeats every 2 min
// ═══════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── CONFIGURATION (Replace with your actual keys) ───
  // Find these in OneSignal Dashboard → Settings → Keys & IDs
  var ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';       // ← Replace this
  var ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY';      // ← Replace this

  var NOTIF_INTERVAL = 2 * 60 * 1000; // 2 minutes
  var SNOOZE_DELAY = 1 * 60 * 1000;   // 1 minute

  var NOTIF_MESSAGES = [
    { title: 'LifeBook Reminder', body: 'Time to check your progress!' },
    { title: 'Stay on Track', body: 'Have you completed your task?' },
    { title: 'Keep Going!', body: 'Your goals are waiting for you.' },
    { title: 'Don\'t Break the Streak!', body: 'Open LifeBook and stay consistent.' },
    { title: 'Quick Check-in', body: 'Take a moment to review your queue.' }
  ];

  var intervalId = null;
  var subscriptionId = null;

  function getRandomMessage() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
  }

  // ─── Get OneSignal Subscription ID from Median.co bridge ───
  function getSubscriptionId(callback) {
    if (subscriptionId) {
      callback(subscriptionId);
      return;
    }

    try {
      // Median.co JS Bridge - get OneSignal info
      if (window.median && median.onesignal && median.onesignal.onesignalInfo) {
        median.onesignal.onesignalInfo(function(info) {
          if (info && info.subscriptionId) {
            subscriptionId = info.subscriptionId;
            callback(subscriptionId);
          } else if (info && info.pushToken) {
            // Try alternative field
            subscriptionId = info.oneSignalUserId || info.userId || null;
            callback(subscriptionId);
          } else {
            callback(null);
          }
        });
        return;
      }

      // Alternative: gonative bridge (older Median.co)
      if (window.gonative && gonative.onesignal && gonative.onesignal.onesignalInfo) {
        gonative.onesignal.onesignalInfo(function(info) {
          if (info && info.subscriptionId) {
            subscriptionId = info.subscriptionId;
          }
          callback(subscriptionId);
        });
        return;
      }
    } catch(e) {
      // Silently fail - don't break the app
    }

    // If we can't get it from bridge, check if stored
    var stored = localStorage.getItem('lb_onesignal_sub_id');
    if (stored) {
      subscriptionId = stored;
      callback(stored);
      return;
    }

    callback(null);
  }

  // ─── Send push notification via OneSignal REST API ───
  function sendPushNotification() {
    var msg = getRandomMessage();

    getSubscriptionId(function(subId) {
      if (!subId) {
        showToast('⚠️ No subscription ID found. Open app fresh & allow notifications.');
        return;
      }

      // Store for future use
      localStorage.setItem('lb_onesignal_sub_id', subId);

      var payload = {
        app_id: ONESIGNAL_APP_ID,
        target_channel: 'push',
        include_subscription_ids: [subId],
        headings: { en: msg.title },
        contents: { en: msg.body },
        buttons: [
          { id: 'done', text: 'Done' },
          { id: 'snooze', text: '1 min snooze' }
        ]
      };

      fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Key ' + ONESIGNAL_REST_API_KEY
        },
        body: JSON.stringify(payload)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.id) {
          showToast('🔔 Push notification sent!');
        } else {
          showToast('⚠️ Failed: ' + (data.errors ? data.errors[0] : 'Unknown error'));
        }
      })
      .catch(function(err) {
        showToast('⚠️ Network error sending notification');
      });
    });
  }

  // ─── Start repeating every 2 minutes ───
  function startInterval() {
    if (intervalId) return;
    intervalId = setInterval(sendPushNotification, NOTIF_INTERVAL);
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
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
    setTimeout(function() { toast.remove(); }, 3000);
  }

  // ─── Handle notification tap actions (callback from Median.co) ───
  function setupCallbacks() {
    try {
      if (window.median && median.onesignal) {
        // Store subscription info when available
        if (median.onesignal.onesignalInfo) {
          median.onesignal.onesignalInfo(function(info) {
            if (info && info.subscriptionId) {
              subscriptionId = info.subscriptionId;
              localStorage.setItem('lb_onesignal_sub_id', info.subscriptionId);
            }
          });
        }
      }
    } catch(e) {
      // Silent - never break the app
    }
  }

  // ─── Intercept Alerts nav click ───
  function init() {
    setupCallbacks();

    document.addEventListener('click', function(e) {
      var navItem = e.target.closest('[data-page="notifications"]');
      if (!navItem) return;

      e.preventDefault();
      e.stopPropagation();

      // Send push immediately
      sendPushNotification();
      // Start 2-minute repeating cycle
      startInterval();
    });
  }

  // Expose for debugging
  window.LifeBookNotif = {
    send: sendPushNotification,
    start: startInterval,
    stop: stopInterval,
    setSubId: function(id) {
      subscriptionId = id;
      localStorage.setItem('lb_onesignal_sub_id', id);
      showToast('✅ Subscription ID saved');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
