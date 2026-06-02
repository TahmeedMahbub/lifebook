// ═══════════════════════════════════════════════════
// LIFEBOOK - SEARCH PAGE
// ═══════════════════════════════════════════════════

$(document).ready(function() {
  if (!document.getElementById('search-page')) return;

  const LS_SEARCH_HISTORY = 'lb_search_history';
  let activeFilters = [];
  let history = JSON.parse(localStorage.getItem(LS_SEARCH_HISTORY)) || [];

  const $input = $('#search-input');
  const $clear = $('#search-clear');
  const $historySection = $('#search-history-section');
  const $historyList = $('#search-history-list');
  const $results = $('#search-results');
  const $empty = $('#search-empty');
  const $tags = $('.search-tag');

  // ─── RENDER HISTORY ───
  function renderHistory() {
    if (!history.length) {
      $historySection.hide();
      return;
    }
    $historySection.show();
    $historyList.empty();
    history.forEach((term, idx) => {
      $historyList.append(`
        <div class="search-history-item" data-idx="${idx}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="history-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="history-text">${term}</span>
          <button class="history-remove" data-idx="${idx}">✕</button>
        </div>
      `);
    });
  }

  function saveHistory() {
    localStorage.setItem(LS_SEARCH_HISTORY, JSON.stringify(history));
  }

  function addToHistory(term) {
    term = term.trim();
    if (!term) return;
    history = history.filter(h => h !== term);
    history.unshift(term);
    if (history.length > 15) history = history.slice(0, 15);
    saveHistory();
    renderHistory();
  }

  // ─── SEARCH LOGIC ───
  function doSearch(query) {
    query = (query || '').trim().toLowerCase();
    if (!query) {
      $results.hide().empty();
      $empty.hide();
      $historySection.show();
      renderHistory();
      return;
    }

    $historySection.hide();
    $results.show();
    $results.empty();

    const results = [];
    const seenMentors = new Set();

    ACTIVITIES.forEach(act => {
      const coach = COACHES[act.coach];
      const matchCategory = coach.label.toLowerCase().includes(query);
      const matchMentor = coach.name.toLowerCase().includes(query);
      const matchPost = act.title.toLowerCase().includes(query) || act.advice.toLowerCase().includes(query);

      let matchTypes = [];
      if (matchCategory) matchTypes.push('category');
      if (matchMentor) matchTypes.push('mentor');
      if (matchPost) matchTypes.push('post');

      if (!matchTypes.length) return;

      // When filters are active, only show results that genuinely match the selected filter
      if (activeFilters.length) {
        // For "post" filter: only show if title/advice actually contains the query
        if (activeFilters.includes('post') && !activeFilters.includes('category') && !activeFilters.includes('mentor')) {
          if (!matchPost) return;
        }
        // For "category" filter: only show if category matches
        if (activeFilters.includes('category') && !activeFilters.includes('post') && !activeFilters.includes('mentor')) {
          if (!matchCategory) return;
        }
        // For "mentor" filter: only show if mentor matches
        if (activeFilters.includes('mentor') && !activeFilters.includes('post') && !activeFilters.includes('category')) {
          if (!matchMentor) return;
        }
        // General: must match at least one active filter type
        if (!activeFilters.some(f => matchTypes.includes(f))) return;
      }

      // Determine display type
      let primaryMatch;
      if (activeFilters.length) {
        primaryMatch = activeFilters.find(f => matchTypes.includes(f));
      } else {
        primaryMatch = matchTypes[0];
      }

      // For category/mentor, only show once per coach
      if (primaryMatch === 'category' || primaryMatch === 'mentor') {
        if (seenMentors.has(act.coach)) return;
        seenMentors.add(act.coach);
      }

      results.push({ act, coach, matchType: primaryMatch });
    });

    if (!results.length) {
      $empty.show();
      return;
    }
    $empty.hide();

    results.slice(0, 30).forEach(({ act, coach, matchType }) => {
      if (matchType === 'category' || matchType === 'mentor') {
        // Mentor/Category result: show profile, highlighted name, category
        $results.append(`
          <a href="index.html" class="search-result-item search-result-mentor" data-id="${act.id}">
            <div class="search-result-emoji" style="background:${coach.bg}">${coach.emoji}</div>
            <div class="search-result-info">
              <div class="search-result-title" style="font-weight:700">${coach.name}</div>
              <div class="search-result-meta"><span class="search-result-badge" style="background:${coach.badge};color:${coach.badgeTxt}">${coach.label}</span></div>
            </div>
          </a>
        `);
      } else {
        // Post result: show full post info
        $results.append(`
          <a href="index.html" class="search-result-item" data-id="${act.id}">
            <div class="search-result-emoji" style="background:${coach.bg}">${coach.emoji}</div>
            <div class="search-result-info">
              <div class="search-result-title">${act.title}</div>
              <div class="search-result-meta">${coach.name} · ${coach.label} · ${act.xp} XP</div>
            </div>
            <span class="search-result-type">Post</span>
          </a>
        `);
      }
    });
  }

  // ─── EVENTS ───
  $input.on('input', function() {
    const val = $(this).val();
    $clear.toggle(val.length > 0);
    doSearch(val);
  });

  $input.on('keydown', function(e) {
    if (e.key === 'Enter') {
      const val = $(this).val().trim();
      if (val) addToHistory(val);
    }
  });

  $clear.on('click', function() {
    $input.val('').focus();
    $clear.hide();
    doSearch('');
  });

  // Filter tags - multi-select toggle
  $tags.on('click', function() {
    $(this).toggleClass('active');
    activeFilters = [];
    $tags.filter('.active').each(function() {
      activeFilters.push($(this).data('filter'));
    });
    doSearch($input.val());
  });

  // History item click → search again
  $(document).on('click', '.search-history-item .history-text', function() {
    const term = $(this).text();
    $input.val(term);
    $clear.show();
    addToHistory(term);
    doSearch(term);
  });

  // History remove
  $(document).on('click', '.history-remove', function(e) {
    e.stopPropagation();
    const idx = $(this).data('idx');
    history.splice(idx, 1);
    saveHistory();
    renderHistory();
  });

  // ─── INIT ───
  renderHistory();
  setTimeout(() => $input.focus(), 100);
});
