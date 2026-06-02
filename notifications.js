// ═══════════════════════════════════════════════════
// LIFEBOOK - PUSH NOTIFICATION SYSTEM
// Uses OneSignal REST API to send real push notifications
// Tap "Alerts" → sends push to THIS device → repeats every 2 min
// ═══════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── CONFIGURATION ───
  var ONESIGNAL_APP_ID = '4a46d75a-e97f-4b92-bfac-5cf8694c7685';
  var ONESIGNAL_REST_API_KEY = 'os_v2_app_jjdnowxjp5fzfp5mlt4gstdwqukcxgunp7zeoge5cvvjy5rykqzjntwlpe6eteyfeiduosruncdhop3rnx44tca67lcl2urj5v23giy';
//   var ONESIGNAL_REST_API_KEY = 'os_v2_app_jjdnowxjp5fzfp5mlt4gstdwqwm5lzcbzrwerhe276qs3g2655hqfcxgmxjdiwgwzfqbxx7byod6mogi6f6aeigv3imksyaeyt53cyy';

  var NOTIF_INTERVAL = 2 * 60 * 1000; // 2 minutes

  var NOTIF_MESSAGES = [
    { title: 'LifeBook Reminder', body: 'Time to check your progress!' },
    { title: 'Stay on Track', body: 'Have you completed your task?' },
    { title: 'Keep Going!', body: 'Your goals are waiting for you.' },
    { title: 'Don\'t Break the Streak!', body: 'Open LifeBook and stay consistent.' },
    { title: 'Quick Check-in', body: 'Take a moment to review your queue.' }
  ];

  var intervalId = null;

  function getRandomMessage() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
  }

  // ─── Send push notification via OneSignal REST API ───
  function sendPushNotification() {
    var msg = getRandomMessage();

    // var payload = {
    //   app_id: ONESIGNAL_APP_ID,
    //   target_channel: 'push',
    //   headings: { en: msg.title },
    //   contents: { en: msg.body },
    //   included_segments: ['Subscribed Users'],
    //   buttons: [
    //     { id: 'done', text: 'Done' },
    //     { id: 'snooze', text: '1 min snooze' }
    //   ]
      // };
      
        var payload = {
            app_id: ONESIGNAL_APP_ID,
            target_channel: 'push',
            headings: { en: 'Test' },
            contents: { en: 'Hello World' },
            include_subscription_ids: [
                '4663dc36-133d-4199-841b-d679e86e1f31'
            ]
        };

    fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Key ' + ONESIGNAL_REST_API_KEY
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.id) {
        showToast('🔔 Notification sent!');
      } else {
        showToast('⚠️ ' + (data.errors ? data.errors[0] : 'Failed'));
      }
    })
    .catch(function() {
      showToast('⚠️ Network error');
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

  // ─── Intercept Alerts nav click ───
  function init() {
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
    stop: stopInterval
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
