/*
 * 非公開設計プロトタイプ専用。
 * 本番のdomain engineを置き換えるコードではありません。
 * 外部通信、Cookie、Web Storage、URLへの入力値反映は行いません。
 */

(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const number = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 });
  const integer = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });

  const normalize = (value) =>
    String(value)
      .normalize('NFKC')
      .trim()
      .replaceAll(',', '')
      .replaceAll('−', '-')
      .replaceAll('ー', '-');

  const parseInteger = (value) => {
    const normalized = normalize(value);
    if (!/^[+-]?\d+$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : null;
  };

  const parseDecimal = (value) => {
    const normalized = normalize(value);
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const signed = (value, unit = '枚') => {
    if (Math.abs(value) < 1e-9) return `0${unit}`;
    return `${value > 0 ? '+' : '−'}${number.format(Math.abs(value))}${unit}`;
  };

  const relationFor = (value) => (value > 0 ? '上回る' : value < 0 ? '下回る' : '同じ');

  const quickForm = $('#quick-form');
  let quickState = null;

  const setFieldError = (input, message) => {
    const error = $(`#${input.id}-error`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  };

  const validateQuick = () => {
    const gamesInput = $('#quick-games');
    const netInput = $('#quick-net');
    const games = parseInteger(gamesInput.value);
    const net = parseInteger(netInput.value);
    const gamesError =
      games === null || games < 1 || games > 9_999_999
        ? '総ゲーム数は1以上の整数で入力してください。'
        : '';
    let netError = net === null ? '差枚は符号を含む整数で入力してください。' : '';
    if (!netError && games && games * 3 + net < 0)
      netError = '差枚が小さすぎるため、想定OUTが0枚未満になります。';
    setFieldError(gamesInput, gamesError);
    setFieldError(netInput, netError);
    const summary = $('#quick-error-summary');
    const messages = [gamesError, netError].filter(Boolean);
    summary.hidden = messages.length === 0;
    summary.textContent = messages.length ? `入力を確認してください。${messages.join(' ')}` : '';
    return messages.length ? null : { games, net };
  };

  const renderQuick = ({ games, net }) => {
    const assumedIn = games * 3;
    const assumedOut = assumedIn + net;
    const rate = (assumedOut / assumedIn) * 100;
    const perThousand = (net / games) * 1000;
    quickState = { games, net, assumedIn, assumedOut, rate };

    $('#result-rate').textContent = `${rate.toFixed(1)}%`;
    $('#result-per-thousand').textContent = signed(perThousand);
    $('#result-flow').textContent =
      `${integer.format(assumedIn)} → ${integer.format(assumedOut)}枚`;
    $('#sensitivity-copy').textContent =
      `このゲーム数では、差枚100枚の変化が実績出玉率の約${((100 / assumedIn) * 100).toFixed(1)}ポイントに相当します。`;

    $$('.benchmark-row', $('#benchmark-list')).forEach((row) => {
      const benchmark = Number(row.dataset.rate);
      const expected = assumedIn * ((benchmark - 100) / 100);
      const difference = net - expected;
      $('[data-expected]', row).textContent = signed(expected);
      $('[data-difference]', row).textContent = signed(difference);
      const relation = $('[data-relation]', row);
      relation.textContent = relationFor(difference);
      relation.className =
        `relation ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}`.trim();
      row.classList.remove('selected');
      row.removeAttribute('aria-pressed');
    });
    $('#benchmark-summary').textContent = '基準はまだ選択されていません。';
    $('#benchmark-summary').classList.remove('visible');

    $('#before-result').hidden = true;
    $('#quick-result').hidden = false;
    $('#quick-result-title').focus({ preventScroll: true });
    $('#quick-result').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  quickForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = validateQuick();
    if (!data) {
      $('#quick-error-summary').focus();
      return;
    }
    renderQuick(data);
  });

  quickForm?.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      ['#quick-games', '#quick-net'].forEach((selector) => setFieldError($(selector), ''));
      $('#quick-error-summary').hidden = true;
      $('#quick-result').hidden = true;
      $('#before-result').hidden = false;
      quickState = null;
      $('#quick-games').focus();
    });
  });

  $('#benchmark-list')?.addEventListener('click', (event) => {
    const row = event.target.closest('.benchmark-row');
    if (!row || !quickState) return;
    $$('.benchmark-row', $('#benchmark-list')).forEach((item) => {
      const active = item === row;
      item.classList.toggle('selected', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const benchmark = Number(row.dataset.rate);
    const expected = quickState.assumedIn * ((benchmark - 100) / 100);
    const difference = quickState.net - expected;
    const relation = relationFor(difference);
    const summary = $('#benchmark-summary');
    summary.textContent = `この入力は${benchmark}%基準の差枚を${number.format(Math.abs(difference))}枚${relation === '同じ' ? 'で同じです' : relation === '上回る' ? '上回ります' : '下回ります'}。`;
    summary.classList.add('visible');
  });

  const panelButtons = $$('.feature-launcher');
  panelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.panel;
      const target = $(`#${targetId}`);
      const willOpen = target.hidden;
      panelButtons.forEach((item) => {
        const panel = $(`#${item.dataset.panel}`);
        item.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      });
      if (willOpen) {
        button.setAttribute('aria-expanded', 'true');
        target.hidden = false;
        const heading = $('h3', target);
        heading.focus({ preventScroll: true });
        target.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });
  });

  $('#target-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentGames = parseInteger($('#target-current-games').value);
    const currentNet = parseInteger($('#target-current-net').value);
    const targetGames = parseInteger($('#target-total-games').value);
    const targetRate = parseDecimal($('#target-rate').value);
    const error = $('#target-error');
    if (
      !currentGames ||
      currentNet === null ||
      !targetGames ||
      targetGames <= currentGames ||
      !targetRate ||
      currentGames * 3 + currentNet < 0
    ) {
      error.textContent = '現在値と目標値を確認してください。目標総Gは現在より大きくします。';
      $('#target-result').hidden = true;
      return;
    }
    const remainingGames = targetGames - currentGames;
    const targetTotalNet = targetGames * 3 * ((targetRate - 100) / 100);
    const requiredNet = targetTotalNet - currentNet;
    const requiredRate = ((remainingGames * 3 + requiredNet) / (remainingGames * 3)) * 100;
    if (remainingGames * 3 + requiredNet < 0) {
      error.textContent = 'この目標では残区間のOUTが0枚未満になるため成立しません。';
      $('#target-result').hidden = true;
      return;
    }
    error.textContent = '';
    $('#target-remaining').textContent = `${integer.format(remainingGames)}G`;
    $('#target-net-result').textContent = `${signed(requiredNet)}以上`;
    $('#target-rate-result').textContent = `${requiredRate.toFixed(1)}%以上`;
    $('#target-result').hidden = false;
  });

  const tabButtons = $$('.segmented-control [role="tab"]');
  const selectSegmentTab = (tab) => {
    tabButtons.forEach((button) => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      $(`#${button.getAttribute('aria-controls')}`).hidden = !selected;
      button.tabIndex = selected ? 0 : -1;
    });
  };
  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => selectSegmentTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabButtons[(index + delta + tabButtons.length) % tabButtons.length];
      selectSegmentTab(next);
      next.focus();
    });
  });

  const deriveSegments = () => {
    if ($('#direct-tab').getAttribute('aria-selected') === 'true') {
      return $$('.segment-row').map((row, index) => ({
        name: $('input', row).value.trim() || `区間${index + 1}`,
        games: parseInteger($('.segment-games', row).value),
        net: parseInteger($('.segment-net', row).value),
      }));
    }
    const games = $$('.point-games').map((input) => parseInteger(input.value));
    const nets = $$('.point-net').map((input) => parseInteger(input.value));
    if (games.some((value) => value === null) || nets.some((value) => value === null)) return null;
    const segments = [];
    for (let i = 1; i < games.length; i += 1) {
      segments.push({
        name: `地点${i - 1}→${i}`,
        games: games[i] - games[i - 1],
        net: nets[i] - nets[i - 1],
      });
    }
    return segments;
  };

  const drawdownRecovery = (segments) => {
    let cumulative = 0;
    let peak = 0;
    let trough = 0;
    let inDrawdown = false;
    let maxDrawdown = 0;
    let maxRecovery = 0;
    segments.forEach(({ net }) => {
      cumulative += net;
      if (cumulative >= peak) {
        if (inDrawdown) maxRecovery = Math.max(maxRecovery, cumulative - trough);
        peak = cumulative;
        trough = cumulative;
        inDrawdown = false;
      } else {
        if (!inDrawdown) {
          trough = cumulative;
          inDrawdown = true;
        } else {
          trough = Math.min(trough, cumulative);
        }
        maxDrawdown = Math.max(maxDrawdown, peak - cumulative);
        maxRecovery = Math.max(maxRecovery, cumulative - trough);
      }
    });
    return { maxDrawdown, maxRecovery };
  };

  $('#segment-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const segments = deriveSegments();
    const error = $('#segment-error');
    if (
      !segments ||
      segments.length < 2 ||
      segments.some(({ games, net }) => !games || games < 1 || net === null || games * 3 + net < 0)
    ) {
      error.textContent =
        '2区間以上のゲーム数と差枚を確認してください。累積Gは増加する必要があります。';
      $('#segment-result').hidden = true;
      return;
    }
    error.textContent = '';
    const benchmark = Number($('#segment-benchmark').value);
    const totalGames = segments.reduce((sum, item) => sum + item.games, 0);
    const totalNet = segments.reduce((sum, item) => sum + item.net, 0);
    const totalRate = ((totalGames * 3 + totalNet) / (totalGames * 3)) * 100;
    const totalExpected = totalGames * 3 * ((benchmark - 100) / 100);
    $('#segment-total').textContent =
      `${integer.format(totalGames)}G / ${signed(totalNet)} / ${totalRate.toFixed(1)}%`;
    $('#segment-total-diff').textContent = signed(totalNet - totalExpected);
    const breakdown = $('#segment-breakdown');
    breakdown.replaceChildren();
    const contributions = segments.map(
      (item) => item.net - item.games * 3 * ((benchmark - 100) / 100),
    );
    const maxContribution = Math.max(...contributions.map(Math.abs), 1);
    segments.forEach((item, index) => {
      const rate = ((item.games * 3 + item.net) / (item.games * 3)) * 100;
      const contribution = contributions[index];
      const row = document.createElement('article');
      row.className = 'segment-result-row';
      const label = document.createElement('p');
      const title = document.createElement('strong');
      title.textContent = item.name;
      const detail = document.createElement('small');
      detail.textContent = ` ${integer.format(item.games)}G / ${signed(item.net)} / ${rate.toFixed(1)}%`;
      label.append(title, detail);
      const result = document.createElement('p');
      result.textContent = `${signed(contribution)} ${contribution >= 0 ? '押し上げ' : '押し下げ'}`;
      const bar = document.createElement('div');
      bar.className = 'contribution-bar';
      const fill = document.createElement('span');
      if (contribution < 0) fill.className = 'negative';
      fill.style.width = `${Math.max(6, (Math.abs(contribution) / maxContribution) * 100)}%`;
      bar.append(fill);
      row.append(label, result, bar);
      breakdown.append(row);
    });
    const range = drawdownRecovery(segments);
    $('#max-drawdown').textContent = `${integer.format(range.maxDrawdown)}枚`;
    $('#max-recovery').textContent = `${integer.format(range.maxRecovery)}枚`;
    $('#segment-result').hidden = false;
  });

  $('#investment-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const cash = parseInteger($('#cash-invested').value);
    const medals = parseInteger($('#current-medals').value);
    const rate = parseDecimal($('#exchange-rate').value);
    const unit = parseInteger($('#exchange-unit').value);
    const error = $('#investment-error');
    if (
      cash === null ||
      cash < 0 ||
      medals === null ||
      medals < 0 ||
      !rate ||
      rate <= 0 ||
      !unit ||
      unit < 1
    ) {
      error.textContent = '現金、枚数、交換率、交換単位を確認してください。';
      $('#investment-result').hidden = true;
      return;
    }
    error.textContent = '';
    const applied = Math.floor(medals / unit) * unit;
    const remainder = medals - applied;
    const exchange = applied * rate;
    const balance = exchange - cash;
    $('#exchange-value').textContent = `${integer.format(exchange)}円`;
    $('#cash-balance').textContent = signed(balance, '円');
    $('#recovery-rate').textContent = cash === 0 ? '—' : `${((exchange / cash) * 100).toFixed(1)}%`;
    $('#remainder-copy').textContent =
      `交換適用 ${integer.format(applied)}枚 / 端数 ${integer.format(remainder)}枚`;
    $('#investment-result').hidden = false;
  });
})();
