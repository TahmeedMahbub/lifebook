// ═══════════════════════════════════════════════════
// LIFEBOOK - SHARED APPLICATION SCRIPT
// ═══════════════════════════════════════════════════

const VERSION = '1.0.19';
// ─── THEME ───
const THEME_KEY = 'lb_theme';
const THEME_LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

function resolveTheme(t) {
  if (t === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return t;
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', resolveTheme(t));
  const lbl = document.getElementById('settings-theme-value');
  if (lbl) lbl.textContent = THEME_LABELS[t] || 'System';
}

function setTheme(t) {
  localStorage.setItem(THEME_KEY, t);
  applyTheme(t);
}

// Apply ASAP to avoid flash
applyTheme(getStoredTheme());

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyTheme('system');
  });
}

// ─── COACHES ───
const COACHES = {
  health:   { name: 'Health Partner',  emoji: '🏃', bg: '#D1FAE5', color: '#065F46', badge: '#10B981', badgeTxt: '#fff', label: 'Health' },
  deen:     { name: 'Deen Coach',      emoji: '🕌', bg: '#EDE9FE', color: '#4C1D95', badge: '#7C3AED', badgeTxt: '#fff', label: 'Deen' },
  learning: { name: 'Learning Mentor', emoji: '📚', bg: '#DBEAFE', color: '#1E3A8A', badge: '#2563EB', badgeTxt: '#fff', label: 'Learning' },
  tech:     { name: 'Tech Guy',        emoji: '💻', bg: '#E0E7FF', color: '#312E81', badge: '#4F46E5', badgeTxt: '#fff', label: 'Tech' },
  family:   { name: 'Family Hero',     emoji: '👨‍👩‍👧', bg: '#FEF3C7', color: '#78350F', badge: '#D97706', badgeTxt: '#fff', label: 'Family' },
  career:   { name: 'Career Coach',    emoji: '💼', bg: '#E0E7FF', color: '#1E1B4B', badge: '#4F46E5', badgeTxt: '#fff', label: 'Career' },
  money:    { name: 'Money Advisor',   emoji: '💰', bg: '#ECFDF5', color: '#064E3B', badge: '#059669', badgeTxt: '#fff', label: 'Finance' },
  future:   { name: 'Future You',      emoji: '🚀', bg: '#FDF4FF', color: '#581C87', badge: '#9333EA', badgeTxt: '#fff', label: 'Future' },
  mental:   { name: 'Mind Guide',      emoji: '🧘', bg: '#F0F9FF', color: '#0C4A6E', badge: '#0284C7', badgeTxt: '#fff', label: 'Mental' },
  skill:    { name: 'Skill Builder',   emoji: '🎯', bg: '#FFF7ED', color: '#7C2D12', badge: '#EA580C', badgeTxt: '#fff', label: 'Soft Skill' },
  biz:      { name: 'Biz Mentor',      emoji: '📊', bg: '#F8FAFC', color: '#1E293B', badge: '#334155', badgeTxt: '#fff', label: 'Business' },
};

// ─── LEVEL SYSTEM ───
const LEVELS = [
  { min:0,    max:100,  name:'Starter ✦',       num:1 },
  { min:100,  max:250,  name:'Awakened 🌱',      num:2 },
  { min:250,  max:500,  name:'Determined 💪',    num:3 },
  { min:500,  max:800,  name:'Consistent ⚡',    num:4 },
  { min:800,  max:1200, name:'Focused 🎯',       num:5 },
  { min:1200, max:1800, name:'Disciplined 🔥',   num:6 },
  { min:1800, max:2500, name:'Leader 🏆',        num:7 },
  { min:2500, max:3500, name:'Champion 🦁',      num:8 },
  { min:3500, max:5000, name:'Sage 🌟',          num:9 },
  { min:5000, max:9999, name:'Enlightened ✨',   num:10 },
];

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length-1];
}



// ─── LOCALSTORAGE KEYS ───
const LS = {
  xp: 'lb_xp', catXp: 'lb_catXp', history: 'lb_history', stats: 'lb_stats',
  streaks: 'lb_streaks', reminders: 'lb_reminders', snooze: 'lb_snooze', lastFeed: 'lb_lastFeed',
  pinned: 'lb_pinned', name: 'lb_name', blocked: 'lb_blocked', favourites: 'lb_favourites',
};

// ─── STATE ───
let state = {
  xp: 0,
  catXp: { health:0, deen:0, learning:0, family:0, career:0, money:0, future:0, mental:0, skill:0, biz:0 },
  history: {}, streaks: [], reminders: {}, snooze: [], feedIds: [], pinned: [],
  blocked: [], favourites: [],
};

function save() {
  try {
    localStorage.setItem(LS.xp,        JSON.stringify(state.xp));
    localStorage.setItem(LS.catXp,     JSON.stringify(state.catXp));
    localStorage.setItem(LS.history,   JSON.stringify(state.history));
    localStorage.setItem(LS.streaks,   JSON.stringify(state.streaks));
    localStorage.setItem(LS.reminders, JSON.stringify(state.reminders));
    localStorage.setItem(LS.snooze,    JSON.stringify(state.snooze));
    localStorage.setItem(LS.lastFeed,  JSON.stringify(state.feedIds));
    localStorage.setItem(LS.pinned,    JSON.stringify(state.pinned));
    localStorage.setItem(LS.blocked,   JSON.stringify(state.blocked));
    localStorage.setItem(LS.favourites,JSON.stringify(state.favourites));
  } catch(e) { console.warn('LS save error', e); }
}

function load() {
  try {
    state.xp        = JSON.parse(localStorage.getItem(LS.xp))        || 0;
    state.catXp     = JSON.parse(localStorage.getItem(LS.catXp))     || state.catXp;
    state.history   = JSON.parse(localStorage.getItem(LS.history))   || {};
    state.streaks   = JSON.parse(localStorage.getItem(LS.streaks))   || [];
    state.reminders = JSON.parse(localStorage.getItem(LS.reminders)) || {};
    state.snooze    = JSON.parse(localStorage.getItem(LS.snooze))    || [];
    state.feedIds   = JSON.parse(localStorage.getItem(LS.lastFeed))  || [];
    state.pinned    = JSON.parse(localStorage.getItem(LS.pinned))    || [];
    state.blocked   = JSON.parse(localStorage.getItem(LS.blocked))   || [];
    state.favourites= JSON.parse(localStorage.getItem(LS.favourites))|| [];
  } catch(e) { state = { xp:0, catXp:{health:0,deen:0,learning:0,family:0,career:0,money:0,future:0,mental:0,skill:0,biz:0}, history:{}, streaks:[], reminders:{}, snooze:[], feedIds:[] }; }
}

// ─── HELPERS ───
function today() { return new Date().toISOString().split('T')[0]; }
function getHour() { return new Date().getHours(); }
function getTimeSlot() {
  const h = getHour();
  if (h >= 4  && h < 9)  return 'morning';
  if (h >= 9  && h < 13) return 'office';
  if (h >= 13 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function initHistory(id) {
  if (!state.history[id]) {
    state.history[id] = { shown:0, completed:0, missed:0, xpEarned:0, lastAction:null, snoozeCount:0, completedToday:false, completedDate:null };
  }
}
function isCompletedToday(id) {
  const h = state.history[id];
  if (!h) return false;
  return h.completedDate === today();
}
function catForCoach(coach) { return coach; }

// ─── RECOMMENDATION ENGINE ───
function scorActivity(act) {
  const slot = getTimeSlot();
  const h = state.history[act.id] || { shown:0, completed:0, snoozeCount:0, completedDate:null };
  let score = 100;
  if (act.tags.includes(slot) || act.tags.includes('anytime')) score += 60;
  if (h.completedDate === today()) score -= 500;
  if (state.blocked.includes(act.id)) score -= 9999;
  if (state.favourites.includes(act.id)) score += 80;
  score -= Math.min(h.shown * 3, 30);
  if (h.shown > 2 && h.completed === 0) score += 20;
  score -= h.snoozeCount * 8;
  const lastFew = state.feedIds.slice(-4);
  if (lastFew.length && ACTIVITIES.filter(a => lastFew.includes(a.id) && a.coach === act.coach).length > 1) score -= 20;
  score += (Math.random() * 30 - 15);
  return score;
}

function buildFeed() {
  const now = Date.now();
  Object.entries(state.reminders).forEach(([id, ts]) => {
    if (ts <= now) { state.snooze.push(id); delete state.reminders[id]; }
  });
  const available = ACTIVITIES.filter(a => !state.blocked.includes(a.id));
  const scored = available.map(a => ({ act: a, score: scorActivity(a) }));
  scored.sort((a,b) => b.score - a.score);
  const snoozed = available.filter(a => state.snooze.includes(a.id) && !isCompletedToday(a.id));
  const rest = scored.filter(s => !state.snooze.includes(s.act.id)).map(s => s.act).slice(0, 12);
  const feed = [...snoozed, ...rest].slice(0, 14);
  state.feedIds = feed.map(a => a.id);
  feed.forEach(a => { initHistory(a.id); state.history[a.id].shown++; });
  save();
  return feed;
}

// ─── XP & LEVEL ───
function addXP(amount, coachKey) {
  state.xp += amount;
  const cat = catForCoach(coachKey);
  if (!state.catXp[cat]) state.catXp[cat] = 0;
  state.catXp[cat] += amount;
  recordStreak();
  save();
  updateLevelUI();
}
function recordStreak() {
  const t = today();
  if (!state.streaks.includes(t)) { state.streaks.push(t); save(); }
}
function getStreak() {
  const sorted = [...state.streaks].sort().reverse();
  if (!sorted.length) return 0;
  let streak = 0, check = today();
  for (let i = 0; i < 365; i++) {
    if (sorted.includes(check)) streak++;
    else if (i > 0) break;
    const d = new Date(check); d.setDate(d.getDate()-1);
    check = d.toISOString().split('T')[0];
  }
  return streak;
}

function renderLevelBanner() {
  const slot = document.getElementById('level-banner-slot');
  if (!slot) return;
  const name = localStorage.getItem(LS.name) || 'Learner';
  const lv = getLevel(state.xp);
  const lvIdx = LEVELS.indexOf(lv);
  const nextLv = LEVELS[lvIdx + 1] || lv;
  const pct = Math.min(100, Math.round(((state.xp - lv.min) / (lv.max - lv.min)) * 100));
  const nextText = nextLv === lv ? '✨ Max Level' : nextLv.name;
  slot.innerHTML = `
    <div class="level-banner">
      <div class="level-label">${name}'s Progress</div>
      <div class="level-name-row">
        <div class="level-name">${lv.name}</div>
        <div class="level-next"><b>Next: </b>${nextText}</div>
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="xp-info">
        <span>${state.xp} XP</span>
        <span>Target: ${lv.max} XP</span>
      </div>
    </div>`;
}

function updateLevelUI() {
  const lv = getLevel(state.xp);
  const lvIdx = LEVELS.indexOf(lv);
  const nextLv = LEVELS[lvIdx + 1] || lv;
  const pct = Math.min(100, Math.round(((state.xp - lv.min) / (lv.max - lv.min)) * 100));
  const streak = getStreak();

  renderLevelBanner();
  $('#topbar-xp').text(state.xp + ' XP');
  $('#topbar-streak').text(streak);
  $('#prog-level-num').text('Level ' + lv.num);
  $('#stat-done').text(Object.values(state.history).reduce((a,h)=>a+(h.completed||0),0));
  $('#stat-streak').text(streak);
  $('#stat-level').text(lv.num);
  $('#stat-missed').text(Object.values(state.history).reduce((a,h)=>a+(h.missed||0),0));

  updateCatBars();
  updateStreakCalendar();
}

function updateCatBars() {
  const cats = [
    { key:'health',   emoji:'🏃', name:'Health' },
    { key:'deen',     emoji:'🕌', name:'Deen' },
    { key:'learning', emoji:'📚', name:'Learning' },
    { key:'career',   emoji:'💼', name:'Career' },
    { key:'family',   emoji:'👨‍👩‍👧', name:'Family' },
    { key:'money',    emoji:'💰', name:'Finance' },
    { key:'mental',   emoji:'🧘', name:'Mental' },
    { key:'skill',    emoji:'🎯', name:'Soft Skill' },
    { key:'biz',      emoji:'📊', name:'Business' },
    { key:'future',   emoji:'🚀', name:'Future' },
  ];
  const maxXp = Math.max(...cats.map(c => state.catXp[c.key]||0), 1);
  const colors = { health:'#10B981', deen:'#7C3AED', learning:'#2563EB', career:'#4F46E5', family:'#D97706', money:'#059669', mental:'#0284C7', skill:'#EA580C', biz:'#334155', future:'#9333EA' };
  const html = cats.map(c => {
    const xp = state.catXp[c.key] || 0;
    const pct = Math.round((xp / maxXp) * 100);
    return `<div class="cat-progress-row">
      <span class="cat-emoji">${c.emoji}</span>
      <span class="cat-name">${c.name}</span>
      <div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${pct}%;background:${colors[c.key]}"></div></div>
      <span class="cat-xp">${xp} XP</span>
    </div>`;
  }).join('');
  $('#cat-bars').html(html);
  $('#prog-cat-bars').html(html);
}

function updateStreakCalendar() {
  if (!$('#streak-calendar').length) return;
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = d.toISOString().split('T')[0];
    const isToday = str === today();
    const done = state.streaks.includes(str);
    const label = d.getDate();
    let cls = 'streak-day';
    if (done) cls += ' done';
    if (isToday) cls += ' today';
    days.push(`<div class="${cls}">${label}</div>`);
  }
  $('#streak-calendar').html(days.join(''));
}

// ─── RENDER FEED ───
function renderFeed(activities) {
  const $feed = $('#feed-posts');
  if (!$feed.length) return;
  $feed.empty();
  // Exclude pinned items from main feed (they're in the queue)
  const filtered = activities.filter(a => !state.pinned.includes(a.id) && !state.blocked.includes(a.id));
  filtered.forEach((act, idx) => {
    const coach = COACHES[act.coach];
    const h = state.history[act.id] || { shown:0, completed:0, missed:0, xpEarned:0, snoozeCount:0 };
    const done = isCompletedToday(act.id);
    const snoozed = state.snooze.includes(act.id);
    const slotMeta = getTimeSlot() === 'morning' ? '🌅 Morning pick' : getTimeSlot() === 'office' ? '💻 Work hours' : getTimeSlot() === 'evening' ? '🌆 Evening boost' : getTimeSlot() === 'night' ? '🌙 Night wind-down' : '☀️ Afternoon energy';

    const isFav = state.favourites.includes(act.id);

    const cardHtml = `
    <div class="post-card ${done?'completed':''} ${snoozed&&!done?'snoozed':''} ${isFav?'is-favourite':''}" data-id="${act.id}" style="animation-delay:${idx*0.07}s">
      <div class="post-header">
        <div class="coach-avatar" style="background:${coach.bg}">
          <span style="font-size:20px">${coach.emoji}</span>
          ${!done ? '<div class="online-dot"></div>' : ''}
        </div>
        <div class="coach-info">
          <div class="coach-name">${coach.name}</div>
          <div class="coach-meta">${slotMeta} · Just now</div>
        </div>
        <span class="category-badge" style="background:${coach.badge};color:${coach.badgeTxt}">${coach.label}</span>
        <button class="post-menu-btn" data-id="${act.id}" aria-label="More options">⋮</button>
      </div>
      <div class="post-body">
        <div class="activity-title">${act.title}</div>
        <div class="activity-advice">${act.advice}</div>
        <div class="post-meta-row">
          <span class="meta-chip xp">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            +${act.xp} XP
          </span>
          <span class="meta-chip duration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${act.dur}
          </span>
          ${snoozed ? '<span class="meta-chip" style="background:#FEF3C7;color:#92400E">⏰ Snoozed</span>' : ''}
          ${h.snoozeCount > 2 ? '<span class="meta-chip" style="background:#FEE2E2;color:#991B1B">-' + Math.min(h.snoozeCount-2, 5) + ' XP penalty</span>' : ''}
        </div>
        ${done ? `<div class="completed-stamp">✅ Completed today · +${h.xpEarned} XP earned</div>` : `
        <div class="post-actions">
          <button class="action-btn" data-action="start" data-id="${act.id}" data-xp="${act.xp}" data-coach="${act.coach}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
            <span>Start</span>
          </button>
          <button class="action-btn ${snoozed?'active':''}" data-action="soon" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg></span>
            <span>Soon</span>
          </button>
          <button class="action-btn ${state.reminders[act.id]?'active':''}" data-action="remind" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></svg></span>
            <span>Remind</span>
          </button>
        </div>`}
      </div>
      <div class="post-stats">
        <span class="stat-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          ${h.shown} shown
        </span>
        <span class="stat-item" style="color:var(--success)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
          ${h.completed} done
        </span>
        <span class="stat-item" style="color:var(--danger)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ${h.missed} missed
        </span>
        <span class="stat-item" style="color:var(--gold)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B" style="width:11px;height:11px"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          ${h.xpEarned} XP
        </span>
        ${isFav ? '<span class="stat-item fav-badge">⭐ Favourite</span>' : ''}
      </div>
    </div>`;
    $feed.append(cardHtml);
  });
}

// ─── TOAST ───
function showToast(msg, type = 'info', dur = 2500) {
  let $container = $('#toast-container');
  if (!$container.length) {
    $container = $('<div class="toast-container" id="toast-container"></div>').appendTo('body');
  }
  const $t = $(`<div class="toast-msg ${type}">${msg}</div>`);
  $container.append($t);
  setTimeout(() => $t.fadeOut(300, () => $t.remove()), dur);
}

// ─── XP BURST ───
function xpBurst(el, xp) {
  const rect = el.getBoundingClientRect();
  const $b = $(`<div class="xp-burst">+${xp} XP ⭐</div>`).css({ left: rect.left + rect.width/2 - 40, top: rect.top });
  $('body').append($b);
  setTimeout(() => $b.remove(), 1300);
}

// ─── EVENT HANDLERS (delegated, safe on any page) ───
let remindTargetId = null;

// ─── START → pin card to queue ───
$(document).on('click', '.action-btn[data-action="start"]', function() {
  const id = $(this).data('id');
  if (!state.pinned.includes(id)) {
    state.pinned.push(id);
    save();
  }
  // Remove card from main feed
  $(this).closest('.post-card').slideUp(200, function() { $(this).remove(); });
  renderQueue();
  showToast('📌 Added to your queue!', 'info', 2000);
});

$(document).on('click', '.action-btn[data-action="done"]', function() {
  const id    = $(this).data('id');
  const xp    = parseInt($(this).data('xp'));
  const coach = $(this).data('coach');
  const $card = $(this).closest('.post-card');

  // Remove from pinned
  state.pinned = state.pinned.filter(p => p !== id);

  initHistory(id);
  const h = state.history[id];
  const penalty = Math.max(0, (h.snoozeCount - 2) * 1);
  const earned = Math.max(5, xp - penalty);

  h.completed++;
  h.xpEarned += earned;
  h.completedDate = today();
  h.lastAction = 'done';
  state.snooze = state.snooze.filter(s => s !== id);
  delete state.reminders[id];

  addXP(earned, coach);
  xpBurst(this, earned);
  showToast(`🎉 +${earned} XP earned! Keep going!`, 'xp');

  $card.addClass('completed');
  $card.find('.post-actions').html(`<div class="completed-stamp">✅ Completed today · +${earned} XP earned</div>`);
  $card.find('.coach-avatar .online-dot').remove();
  $card.find('.stat-item:nth-child(2)').html(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:11px;height:11px"><polyline points="20 6 9 17 4 12"/></svg> ${h.completed} done`);
  $card.find('.stat-item:last').html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B" style="width:11px;height:11px"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> ${h.xpEarned} XP`);

  save();
  updateLevelUI();
  renderQueue();
});

$(document).on('click', '.action-btn[data-action="soon"]', function() {
  const id = $(this).data('id');
  const $card = $(this).closest('.post-card');
  // Remove from pinned
  state.pinned = state.pinned.filter(p => p !== id);
  initHistory(id);
  const h = state.history[id];
  h.snoozeCount++;
  h.lastAction = 'soon';
  if (!state.snooze.includes(id)) state.snooze.push(id);
  const msg = h.snoozeCount > 3
    ? `⚠️ Postponed ${h.snoozeCount}x — small XP penalty building...`
    : '⏳ Will show again next time!';
  showToast(msg, 'warn');
  $(this).addClass('active');
  $card.addClass('snoozed').css('opacity', '0.75');
  save();
  renderQueue();
});

$(document).on('click', '.action-btn[data-action="remind"]', function() {
  const id = $(this).data('id');
  // Remove from pinned
  state.pinned = state.pinned.filter(p => p !== id);
  save();
  renderQueue();
  remindTargetId = id;
  $('#remind-modal').addClass('open');
});

$(document).on('click', '#remind-modal .remind-option', function() {
  const time = $(this).data('time');
  if (time === 'cancel') { $('#remind-modal').removeClass('open'); return; }
  const id = remindTargetId;
  if (!id) return;
  initHistory(id);

  let ms = 0;
  if (time === 'eod') {
    const d = new Date(); d.setHours(21,0,0,0);
    ms = d.getTime() - Date.now();
  } else if (time === 'tomorrow') {
    const d = new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0);
    ms = d.getTime() - Date.now();
  } else {
    ms = parseInt(time) * 60 * 1000;
  }
  state.reminders[id] = Date.now() + ms;
  state.history[id].snoozeCount++;
  const labels = { 30:'30 min', 60:'1 hour', 180:'3 hours', eod:'end of day', tomorrow:'tomorrow' };
  showToast(`⏰ Reminder set for ${labels[time]}`, 'info');
  $(`.action-btn[data-action="remind"][data-id="${id}"]`).addClass('active');
  $('#remind-modal').removeClass('open');
  save();
});

$(document).on('click', '#remind-modal', function(e) {
  if ($(e.target).is('#remind-modal')) $(this).removeClass('open');
});

// ─── POST THREE-DOT MENU ───
$(document).on('click', '.post-menu-btn', function(e) {
  e.stopPropagation();
  $('.post-menu-dropdown').remove();
  const id = $(this).data('id');
  const isFav = state.favourites.includes(id);
  const $btn = $(this);
  const dropdown = `
    <div class="post-menu-dropdown" data-id="${id}">
      <div class="post-menu-item" data-action="fav">
        <span>${isFav ? '💔 Remove from Favourites' : '⭐ Add to Favourites'}</span>
      </div>
      <div class="post-menu-item post-menu-item-danger" data-action="block">
        <span>🚫 Don't show again</span>
      </div>
    </div>`;
  $btn.closest('.post-header').append(dropdown);
});

$(document).on('click', '.post-menu-item[data-action="fav"]', function(e) {
  e.stopPropagation();
  const id = $(this).closest('.post-menu-dropdown').data('id');
  if (state.favourites.includes(id)) {
    state.favourites = state.favourites.filter(f => f !== id);
    showToast('💔 Removed from favourites', 'info');
  } else {
    state.favourites.push(id);
    showToast('⭐ Added to favourites!', 'info');
  }
  save();
  $('.post-menu-dropdown').remove();
  refreshFeed();
});

$(document).on('click', '.post-menu-item[data-action="block"]', function(e) {
  e.stopPropagation();
  const id = $(this).closest('.post-menu-dropdown').data('id');
  if (!state.blocked.includes(id)) state.blocked.push(id);
  state.favourites = state.favourites.filter(f => f !== id);
  state.pinned = state.pinned.filter(p => p !== id);
  save();
  $('.post-menu-dropdown').remove();
  showToast('🚫 Post hidden. Undo in Settings.', 'warn');
  $(`.post-card[data-id="${id}"]`).slideUp(200, function() { $(this).remove(); });
  renderQueue();
});

// Close dropdown on click elsewhere
$(document).on('click', function() {
  $('.post-menu-dropdown').remove();
});

// ─── THEME PICKER ───
function refreshThemeOptions() {
  const cur = getStoredTheme();
  $('.theme-option').each(function() {
    $(this).toggleClass('active', $(this).data('theme') === cur);
  });
  const lbl = document.getElementById('settings-theme-value');
  if (lbl) lbl.textContent = THEME_LABELS[cur] || 'System';
}

// ─── DISPLAY NAME ───
function loadDisplayName() {
  const n = localStorage.getItem(LS.name) || 'Learner';
  const el = document.getElementById('settings-name');
  if (el) el.textContent = n;
  return n;
}
loadDisplayName();

$(document).on('click', '#btn-name', function() {
  const current = localStorage.getItem(LS.name) || 'Learner';
  $('#name-input').val(current);
  $('#name-modal').addClass('open');
  setTimeout(() => $('#name-input').focus(), 300);
});

$(document).on('click', '#name-save-btn', function() {
  const name = $('#name-input').val().trim();
  if (name) {
    localStorage.setItem(LS.name, name);
    $('#settings-name').text(name);
    renderLevelBanner();
    showToast('👤 Name updated!', 'info');
  }
  $('#name-modal').removeClass('open');
});

$(document).on('click', '[data-name-cancel]', function() {
  $('#name-modal').removeClass('open');
});

$(document).on('click', '#name-modal', function(e) {
  if ($(e.target).is('#name-modal')) $('#name-modal').removeClass('open');
});

$(document).on('keydown', '#name-input', function(e) {
  if (e.key === 'Enter') $('#name-save-btn').click();
});

$(document).on('click', '#btn-theme', function() {
  refreshThemeOptions();
  $('#theme-modal').addClass('open');
});

$(document).on('click', '.theme-option', function() {
  const t = $(this).data('theme');
  if (!t) return;
  setTheme(t);
  refreshThemeOptions();
  $('#theme-modal').removeClass('open');
  showToast('🎨 Theme: ' + THEME_LABELS[t], 'info');
});

$(document).on('click', '#theme-modal', function(e) {
  if ($(e.target).is('#theme-modal') || $(e.target).closest('[data-theme-cancel]').length) {
    $(this).removeClass('open');
  }
});

// ─── NAV: cross-page Home tap → scroll-to-top + refresh ───
$(document).on('click', '.nav-item[data-page="feed"]', function(e) {
  // If already on home page, intercept and refresh in place
  if ($('#feed-container').length) {
    e.preventDefault();
    scrollToTopAndRefresh(true);
  }
});

$(document).on('click', '.nav-item[data-page="search"]', function(e) {
  e.preventDefault();
  showToast('🔍 Search coming soon!', 'info');
});

$(document).on('click', '.nav-item[data-page="add"]', function(e) {
  e.preventDefault();
  showToast('✏️ Custom activities coming soon!', 'info');
});

// ─── QUEUE (Pinned Posts) ───
function renderQueue() {
  const $section = $('#queue-section');
  const $posts = $('#queue-posts');
  if (!$section.length) return;

  // Filter out completed-today items from pinned
  state.pinned = state.pinned.filter(id => !isCompletedToday(id));
  save();

  if (!state.pinned.length) {
    $section.hide();
    return;
  }

  $section.show();
  $posts.empty();

  state.pinned.forEach(id => {
    const act = ACTIVITIES.find(a => a.id === id);
    if (!act) return;
    const coach = COACHES[act.coach];
    const h = state.history[id] || { shown:0, completed:0, missed:0, xpEarned:0, snoozeCount:0 };
    const slotMeta = getTimeSlot() === 'morning' ? '🌅 Morning pick' : getTimeSlot() === 'office' ? '💻 Work hours' : getTimeSlot() === 'evening' ? '🌆 Evening boost' : getTimeSlot() === 'night' ? '🌙 Night wind-down' : '☀️ Afternoon energy';

    const cardHtml = `
    <div class="post-card" data-id="${act.id}">
      <div class="post-header">
        <div class="coach-avatar" style="background:${coach.bg}">
          <span style="font-size:20px">${coach.emoji}</span>
          <div class="online-dot"></div>
        </div>
        <div class="coach-info">
          <div class="coach-name">${coach.name}</div>
          <div class="coach-meta">${slotMeta} · Queued</div>
        </div>
        <span class="category-badge" style="background:${coach.badge};color:${coach.badgeTxt}">${coach.label}</span>
        <button class="post-menu-btn" data-id="${act.id}" aria-label="More options">⋮</button>
      </div>
      <div class="post-body">
        <div class="activity-title">${act.title}</div>
        <div class="activity-advice">${act.advice}</div>
        <div class="post-meta-row">
          <span class="meta-chip xp">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            +${act.xp} XP
          </span>
          <span class="meta-chip duration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${act.dur}
          </span>
        </div>
        <div class="post-actions">
          <button class="action-btn" data-action="done" data-id="${act.id}" data-xp="${act.xp}" data-coach="${act.coach}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
            <span>Done</span>
          </button>
          <button class="action-btn" data-action="soon" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg></span>
            <span>Soon</span>
          </button>
          <button class="action-btn" data-action="remind" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></svg></span>
            <span>Remind</span>
          </button>
        </div>
      </div>
      <div class="post-stats">
        <span class="stat-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          ${h.shown} shown
        </span>
        <span class="stat-item" style="color:var(--success)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
          ${h.completed} done
        </span>
        <span class="stat-item" style="color:var(--danger)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ${h.missed} missed
        </span>
        <span class="stat-item" style="color:var(--gold)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B" style="width:11px;height:11px"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          ${h.xpEarned} XP
        </span>
      </div>
    </div>`;
    $posts.append(cardHtml);
  });

  // Re-collapse if multiple items
  const $wrapper = $('#queue-wrapper');
  if (state.pinned.length <= 1) {
    $wrapper.removeClass('collapsed');
  } else {
    $wrapper.addClass('collapsed');
  }
  $wrapper.data('user-expanded', false);
  $('#queue-show-more').text('Show more');
}

// Show more / collapse toggle
$(document).on('click', '#queue-show-more', function() {
  const $wrapper = $('#queue-wrapper');
  $wrapper.removeClass('collapsed').data('user-expanded', true);
  $(this).text('Show less');
});

$(document).on('click', '.queue-show-more:contains("Show less")', function() {
  const $wrapper = $('#queue-wrapper');
  $wrapper.addClass('collapsed').data('user-expanded', false);
  $(this).text('Show more');
});

// ─── FEED REFRESH ───
function refreshFeed() {
  const feed = buildFeed();
  renderFeed(feed);
  renderQueue();
  updateLevelUI();
}

function scrollToTopAndRefresh(showSpinner) {
  const $fc = $('#feed-container');
  if (!$fc.length) return;
  $fc.stop().animate({ scrollTop: 0 }, 220, function() {
    if (showSpinner) {
      const $ind = $('#ptr-indicator');
      $ind.addClass('refreshing').css('height', '44px').find('.ptr-label').text('Refreshing…');
      setTimeout(() => {
        refreshFeed();
        $ind.removeClass('refreshing').css('height', '0');
      }, 500);
    } else {
      refreshFeed();
    }
  });
}

// ─── PULL-TO-REFRESH (touch + wheel) ───
function setupPullToRefresh() {
  const fc = document.getElementById('feed-container');
  const ind = document.getElementById('ptr-indicator');
  if (!fc || !ind) return;
  const label = ind.querySelector('.ptr-label');
  const THRESHOLD = 70, MAX = 110;
  let startY = 0, pulling = false, dist = 0, refreshing = false;

  function setPull(d) {
    dist = Math.max(0, Math.min(MAX, d));
    ind.style.height = dist + 'px';
    label.textContent = dist >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
  }
  function reset(snap) {
    pulling = false; dist = 0;
    if (snap) {
      ind.style.transition = 'height 0.25s ease';
      ind.style.height = '0px';
      setTimeout(() => { ind.style.transition = ''; }, 260);
    } else { ind.style.height = '0px'; }
  }
  function doRefresh() {
    if (refreshing) return;
    refreshing = true;
    ind.classList.add('refreshing');
    ind.style.transition = 'height 0.2s ease';
    ind.style.height = '44px';
    label.textContent = 'Refreshing…';
    setTimeout(() => {
      refreshFeed();
      ind.classList.remove('refreshing');
      ind.style.height = '0px';
      setTimeout(() => { ind.style.transition = ''; }, 250);
      refreshing = false;
    }, 650);
  }

  fc.addEventListener('touchstart', (e) => {
    if (refreshing) return;
    if (fc.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    pulling = true;
  }, { passive: true });
  fc.addEventListener('touchmove', (e) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { setPull(0); return; }
    setPull(dy * 0.55);
  }, { passive: true });
  fc.addEventListener('touchend', () => {
    if (!pulling || refreshing) return;
    if (dist >= THRESHOLD) { doRefresh(); pulling = false; }
    else reset(true);
  });
  fc.addEventListener('touchcancel', () => reset(true));

  let wheelAccum = 0, wheelTimer = null;
  fc.addEventListener('wheel', (e) => {
    if (refreshing) return;
    if (fc.scrollTop > 0) { wheelAccum = 0; return; }
    if (e.deltaY < 0) {
      wheelAccum += -e.deltaY;
      setPull(wheelAccum * 0.6);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (dist >= THRESHOLD) doRefresh();
        else reset(true);
        wheelAccum = 0;
      }, 180);
    } else if (dist > 0) {
      wheelAccum = 0;
      reset(true);
    }
  }, { passive: true });
}

// ─── RESET ───
$(document).on('click', '#btn-reset', function() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.clear();
    location.reload();
  }
});

// ─── FAVOURITES & BLOCKED CONTENT PAGE ───
function renderContentPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (!type) return;

  const $title = $('#content-page-title');
  const $container = $('#content-items');
  const $empty = $('#content-empty');
  if (!$container.length) return;

  const titles = { fav: '⭐ Favourite Posts', blocked: '🚫 Blocked Posts', done: '✅ Today\'s Done', soon: '⏳ Soon', remind: '🔔 Remind Me Later' };
  const emptyTexts = { fav: 'No favourite posts yet', blocked: 'No blocked posts', done: 'No completed posts today', soon: 'No snoozed posts', remind: 'No reminders set' };
  $title.text(titles[type] || 'Posts');
  $empty.text(emptyTexts[type] || 'No posts here yet');

  let list = [];
  if (type === 'fav') list = state.favourites;
  else if (type === 'blocked') list = state.blocked;
  else if (type === 'done') list = Object.keys(state.history).filter(id => isCompletedToday(id));
  else if (type === 'soon') list = [...state.snooze];
  else if (type === 'remind') list = Object.keys(state.reminders);

  $container.empty();

  if (!list.length) {
    $empty.show();
    return;
  }
  $empty.hide();

  list.forEach(id => {
    const act = ACTIVITIES.find(a => a.id === id);
    if (!act) return;
    const coach = COACHES[act.coach];
    const h = state.history[id] || { shown:0, completed:0, missed:0, xpEarned:0 };
    let actionLabel = '';
    if (type === 'fav') actionLabel = '💔 Remove';
    else if (type === 'blocked') actionLabel = '✅ Unblock';
    else if (type === 'done') actionLabel = '';
    else if (type === 'soon') actionLabel = '❌ Remove';
    else if (type === 'remind') actionLabel = '❌ Cancel';
    $container.append(`
      <div class="settings-list-item" data-id="${id}" data-type="${type}">
        <div class="settings-list-item-info">
          <span class="settings-list-item-emoji">${coach.emoji}</span>
          <div>
            <div class="settings-list-item-title">${act.title}</div>
            <div class="settings-list-item-meta">${coach.label} · ${h.completed} done · ${h.missed} missed · ${h.xpEarned} XP</div>
          </div>
        </div>
        ${actionLabel ? `<button class="settings-list-item-btn" data-id="${id}" data-type="${type}">${actionLabel}</button>` : ''}
      </div>
    `);
  });
}

$(document).on('click', '.settings-list-item-btn', function() {
  const id = $(this).data('id');
  const type = $(this).data('type');
  if (type === 'fav') {
    state.favourites = state.favourites.filter(f => f !== id);
    showToast('💔 Removed from favourites', 'info');
  } else if (type === 'blocked') {
    state.blocked = state.blocked.filter(b => b !== id);
    showToast('✅ Post unblocked! It will appear in your feed again.', 'info');
  } else if (type === 'soon') {
    state.snooze = state.snooze.filter(s => s !== id);
    showToast('❌ Removed from soon list', 'info');
  } else if (type === 'remind') {
    delete state.reminders[id];
    showToast('❌ Reminder cancelled', 'info');
  }
  save();
  $(this).closest('.settings-list-item').slideUp(200, function() {
    $(this).remove();
    if (!$('#content-items').children().length) {
      $('#content-empty').show();
    }
  });
});

// ─── BACK-TO-REFRESH / DOUBLE-BACK-TO-EXIT (Home page only) ───
// First back press: refresh feed + show toast. Second back press within 3s: exit app.
function setupBackToRefreshExit() {
  let armed = false;
  let armedTimer = null;

  // Seed a sentinel state so the first back press fires popstate without leaving the page
  try { history.pushState({ lbHome: true }, '', location.href); } catch (e) {}

  window.addEventListener('popstate', function() {
    if (armed) {
      // Second back press within window — let the app exit/navigate away
      armed = false;
      if (armedTimer) { clearTimeout(armedTimer); armedTimer = null; }
      // Try to close (works for windows opened by script / installed PWAs)
      try { window.close(); } catch (e) {}
      // Otherwise actually go back one more step in history
      setTimeout(() => { try { history.back(); } catch (e) {} }, 50);
      return;
    }

    // First back press: refresh and re-arm the sentinel
    armed = true;
    try { history.pushState({ lbHome: true }, '', location.href); } catch (e) {}
    scrollToTopAndRefresh(true);
    showToast('Press back again to exit', 'info', 2500);

    armedTimer = setTimeout(() => {
      armed = false;
      armedTimer = null;
    }, 3000);
  });
}

// ─── INFINITE SCROLL ───
function setupInfiniteScroll() {
  const fc = document.getElementById('feed-container');
  if (!fc) return;
  let loading = false;

  fc.addEventListener('scroll', function() {
    if (loading) return;
    if (fc.scrollTop + fc.clientHeight >= fc.scrollHeight - 200) {
      loading = true;
      loadMorePosts();
      setTimeout(() => { loading = false; }, 300);
    }
  });
}

function loadMorePosts() {
  const $feed = $('#feed-posts');
  if (!$feed.length) return;

  // Pick random activities for infinite feed
  const pool = ACTIVITIES.filter(a => !state.pinned.includes(a.id) && !state.blocked.includes(a.id));
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
  const offset = $feed.children().length;

  shuffled.forEach((act, idx) => {
    const coach = COACHES[act.coach];
    initHistory(act.id);
    const h = state.history[act.id];
    const done = isCompletedToday(act.id);
    const snoozed = state.snooze.includes(act.id);
    const isFav = state.favourites.includes(act.id);
    const slotMeta = getTimeSlot() === 'morning' ? '🌅 Morning pick' : getTimeSlot() === 'office' ? '💻 Work hours' : getTimeSlot() === 'evening' ? '🌆 Evening boost' : getTimeSlot() === 'night' ? '🌙 Night wind-down' : '☀️ Afternoon energy';

    const cardHtml = `
    <div class="post-card ${done?'completed':''} ${snoozed&&!done?'snoozed':''} ${isFav?'is-favourite':''}" data-id="${act.id}" style="animation-delay:${(offset+idx)*0.07}s">
      <div class="post-header">
        <div class="coach-avatar" style="background:${coach.bg}">
          <span style="font-size:20px">${coach.emoji}</span>
          ${!done ? '<div class="online-dot"></div>' : ''}
        </div>
        <div class="coach-info">
          <div class="coach-name">${coach.name}</div>
          <div class="coach-meta">${slotMeta} · Just now</div>
        </div>
        <span class="category-badge" style="background:${coach.badge};color:${coach.badgeTxt}">${coach.label}</span>
        <button class="post-menu-btn" data-id="${act.id}" aria-label="More options">⋮</button>
      </div>
      <div class="post-body">
        <div class="activity-title">${act.title}</div>
        <div class="activity-advice">${act.advice}</div>
        <div class="post-meta-row">
          <span class="meta-chip xp">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            +${act.xp} XP
          </span>
          <span class="meta-chip duration">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${act.dur}
          </span>
          ${snoozed ? '<span class="meta-chip" style="background:#FEF3C7;color:#92400E">⏰ Snoozed</span>' : ''}
        </div>
        ${done ? `<div class="completed-stamp">✅ Completed today · +${h.xpEarned} XP earned</div>` : `
        <div class="post-actions">
          <button class="action-btn" data-action="start" data-id="${act.id}" data-xp="${act.xp}" data-coach="${act.coach}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
            <span>Start</span>
          </button>
          <button class="action-btn ${snoozed?'active':''}" data-action="soon" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg></span>
            <span>Soon</span>
          </button>
          <button class="action-btn ${state.reminders[act.id]?'active':''}" data-action="remind" data-id="${act.id}">
            <span class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></svg></span>
            <span>Remind</span>
          </button>
        </div>`}
      </div>
      <div class="post-stats">
        <span class="stat-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          ${h.shown} shown
        </span>
        <span class="stat-item" style="color:var(--success)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
          ${h.completed} done
        </span>
        <span class="stat-item" style="color:var(--danger)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ${h.missed} missed
        </span>
        <span class="stat-item" style="color:var(--gold)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B" style="width:11px;height:11px"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          ${h.xpEarned} XP
        </span>
        ${isFav ? '<span class="stat-item fav-badge">⭐ Favourite</span>' : ''}
      </div>
    </div>`;
    $feed.append(cardHtml);
  });
}

// ─── INIT ───
$(document).ready(function() {
  load();
  refreshThemeOptions();
  updateLevelUI();

  // Home page only
  if ($('#feed-container').length) {
    const feed = buildFeed();
    renderFeed(feed);
    renderQueue();
    setupPullToRefresh();
    setupInfiniteScroll();
    setupBackToRefreshExit();

    const slot = getTimeSlot();
      const name = localStorage.getItem(LS.name) || 'Learner';
      const greetings = {
        morning:   `🌅 Good morning, ${name}. A fresh chapter begins today.`,
        office:    `💼 Welcome back, ${name}. Small actions create big results.`,
        afternoon: `☀️ Energetic afternoon, ${name}. You're doing great.`,
        evening:   `🌆 Evening, ${name}. Time to reflect on today's wins.`,
        night:     `🌙 Rest well, ${name}. Tomorrow brings new opportunities.`,
      };
    setTimeout(() => showToast(greetings[slot] || '✨ Welcome back!', 'info', 3000), 600);
  }

  // Settings page only
  if (document.getElementById('settings-activities-count')) {
    document.getElementById('settings-activities-count').textContent = ACTIVITIES.length + ' activities';
  }
  if (document.getElementById('settings-version')) {
    document.getElementById('settings-version').textContent = 'v' + VERSION;
  }
  if (document.getElementById('settings-fav-count')) {
    document.getElementById('settings-fav-count').textContent = state.favourites.length + ' ›';
  }
  if (document.getElementById('settings-blocked-count')) {
    document.getElementById('settings-blocked-count').textContent = state.blocked.length + ' ›';
  }
  if (document.getElementById('settings-done-count')) {
    document.getElementById('settings-done-count').textContent = Object.keys(state.history).filter(id => isCompletedToday(id)).length + ' ›';
  }
  if (document.getElementById('settings-soon-count')) {
    document.getElementById('settings-soon-count').textContent = state.snooze.length + ' ›';
  }
  if (document.getElementById('settings-remind-count')) {
    document.getElementById('settings-remind-count').textContent = Object.keys(state.reminders).length + ' ›';
  }

  // Content page (favourites/blocked)
  if ($('#content-page').length) {
    renderContentPage();
  }

  // Reminders watcher (runs on every page so reminders stay in sync)
  setInterval(() => {
    const now = Date.now();
    let changed = false;
    Object.entries(state.reminders).forEach(([id, ts]) => {
      if (ts <= now) {
        if (!state.snooze.includes(id)) state.snooze.push(id);
        delete state.reminders[id];
        changed = true;
      }
    });
    if (changed) {
      save();
      showToast('🔔 A reminder activity is ready!', 'info');
    }
  }, 60000);
});
