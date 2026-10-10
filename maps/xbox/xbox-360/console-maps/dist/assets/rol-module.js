(() => {
  'use strict';

  const SEGMENTS = [
    { id: 'G1', number: 1, start: 188, end: 262, labelX: 56, labelY: 65 },
    { id: 'G2', number: 2, start: 278, end: 352, labelX: 364, labelY: 65 },
    { id: 'G3', number: 3, start: 98, end: 172, labelX: 56, labelY: 346 },
    { id: 'G4', number: 4, start: 8, end: 82, labelX: 364, labelY: 346 }
  ];

  const COPY = {
    pl: {
      selectedPattern: 'WYBRANY UKŁAD', clear: 'Wyczyść', activeCount: 'Aktywne segmenty', activeNames: 'Nazwy segmentów',
      description: 'Opis', diagnosis: 'Diagnoza', possibleCauses: 'Możliwe przyczyny', recommendations: 'Zalecenia',
      noSegments: 'Brak aktywnych segmentów', noSelection: 'Nie wybrano wzoru',
      noSelectionText: 'Kliknij jeden lub więcej łuków na głównym pierścieniu.', unknown: 'UNKNOWN',
      unknownText: 'Tego układu nie ma jeszcze w bazie. Nie przypisujemy diagnozy bez potwierdzenia.',
      unknownCause: 'Brak zweryfikowanego przypisania dla tej kombinacji.', unknownRecommendation: 'Odczytaj kod dodatkowy i sprawdź go w zweryfikowanej bazie.',
      one: 'segment', few: 'segmenty', many: 'segmentów', setPattern: 'Ustaw wzór', active: 'aktywny', inactive: 'nieaktywny',
      exampleOnly: 'Wzór demonstracyjny', exampleDiagnosis: 'To podgląd układu, a nie samodzielna diagnoza usterki.',
      readSecondary: 'Wykonaj cztery odczyty kodu dodatkowego poniżej.', confirmCode: 'Dopiero zweryfikowany kod może wskazać właściwy obszar PCB.'
    },
    en: {
      selectedPattern: 'SELECTED PATTERN', clear: 'Clear', activeCount: 'Active segments', activeNames: 'Segment names',
      description: 'Description', diagnosis: 'Diagnosis', possibleCauses: 'Possible causes', recommendations: 'Recommendations',
      noSegments: 'No active segments', noSelection: 'No pattern selected',
      noSelectionText: 'Select one or more arcs on the main ring.', unknown: 'UNKNOWN',
      unknownText: 'This pattern is not yet in the database. No diagnosis is assigned without verification.',
      unknownCause: 'No verified mapping exists for this combination.', unknownRecommendation: 'Read the secondary code and check it against a verified database.',
      one: 'segment', few: 'segments', many: 'segments', setPattern: 'Set pattern', active: 'active', inactive: 'inactive',
      exampleOnly: 'Demonstration pattern', exampleDiagnosis: 'This is a pattern preview, not a standalone fault diagnosis.',
      readSecondary: 'Take the four secondary-code readings below.', confirmCode: 'Only a verified code can identify the correct PCB area.'
    }
  };

  // Replace or extend these records when a pattern has a verified service meaning.
  // Any combination absent from this map is deliberately rendered as UNKNOWN.
  const PATTERN_DATABASE = {
    G1: pattern('G1'),
    'G1,G2': pattern('G1 + G2'),
    'G1,G2,G4': pattern('G1 + G2 + G4'),
    'G1,G2,G3,G4': pattern('G1 + G2 + G3 + G4')
  };

  let active = [true, false, false, false];
  let currentLanguage = 'pl';

  function pattern(name) {
    return {
      title: { pl: `${COPY.pl.exampleOnly}: ${name}`, en: `${COPY.en.exampleOnly}: ${name}` },
      description: {
        pl: `Aktywne łuki: ${name}. Układ segmentów zapisano zgodnie z pozycją poziomą konsoli.`,
        en: `Active arcs: ${name}. Segment positions follow the horizontal console orientation.`
      },
      diagnosis: { pl: COPY.pl.exampleDiagnosis, en: COPY.en.exampleDiagnosis },
      causes: [{ pl: COPY.pl.readSecondary, en: COPY.en.readSecondary }],
      recommendations: [{ pl: COPY.pl.confirmCode, en: COPY.en.confirmCode }]
    };
  }

  function point(radius, angle) {
    const radians = angle * Math.PI / 180;
    return { x: 210 + radius * Math.cos(radians), y: 210 + radius * Math.sin(radians) };
  }

  function arcPath(start, end, radius = 136) {
    const a = point(radius, start);
    const b = point(radius, end);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function ringMarkup(patternState, options = {}) {
    const compact = Boolean(options.compact);
    const interactive = Boolean(options.interactive);
    const tone = options.tone === 'red' ? 'red' : 'green';
    const c = COPY[currentLanguage];
    const segments = SEGMENTS.map((segment, index) => {
      const isOn = Boolean(patternState[index]);
      return `<path class="rol-segment${isOn ? ' active' : ''}" d="${arcPath(segment.start, segment.end)}" data-rol-segment="${index}"${interactive ? ` role="switch" tabindex="0" aria-checked="${isOn}" aria-label="${segment.number} (${segment.id}): ${isOn ? c.active : c.inactive}"` : ''}/>`;
    }).join('');
    const labels = compact ? '' : SEGMENTS.map(segment => `<g class="rol-svg-label" transform="translate(${segment.labelX} ${segment.labelY})"><text class="rol-label-number" text-anchor="middle">${segment.number}</text><text class="rol-label-id" y="22" text-anchor="middle">(${segment.id})</text></g>`).join('');
    return `<svg class="rol-ring-svg rol-ring-${tone}${compact ? ' is-compact' : ''}" viewBox="0 0 420 420" aria-hidden="${interactive ? 'false' : 'true'}">
      <circle class="rol-guide" cx="210" cy="210" r="170"/>
      <circle class="rol-track" cx="210" cy="210" r="136"/>
      ${segments}
      <circle class="rol-center" cx="210" cy="210" r="69"/>
      <circle class="rol-center-inner" cx="210" cy="210" r="27"/>
      <circle class="rol-center-dot" cx="210" cy="210" r="6"/>
      <path class="rol-center-mark" d="M210 165v20M210 235v20M165 210h20M235 210h20"/>
      ${labels}
    </svg>`;
  }

  function activeIds() {
    return SEGMENTS.filter((_, index) => active[index]).map(segment => segment.id);
  }

  function countLabel(count) {
    const c = COPY[currentLanguage];
    if (currentLanguage === 'en') return `${count} ${count === 1 ? c.one : c.few}`;
    if (count === 1) return `${count} ${c.one}`;
    if (count >= 2 && count <= 4) return `${count} ${c.few}`;
    return `${count} ${c.many}`;
  }

  function localized(value) {
    return value?.[currentLanguage] ?? value?.en ?? '';
  }

  function listMarkup(items) {
    return `<ul>${items.map(item => `<li>${escapeHtml(localized(item))}</li>`).join('')}</ul>`;
  }

  function panelMarkup() {
    const c = COPY[currentLanguage];
    const ids = activeIds();
    const key = ids.join(',');
    const record = PATTERN_DATABASE[key];
    const empty = ids.length === 0;
    const title = empty ? c.noSelection : record ? localized(record.title) : c.unknown;
    const description = empty ? c.noSelectionText : record ? localized(record.description) : c.unknownText;
    const diagnosis = empty ? '—' : record ? localized(record.diagnosis) : c.unknown;
    const causes = empty ? [] : record ? record.causes : [{ pl: COPY.pl.unknownCause, en: COPY.en.unknownCause }];
    const recommendations = empty ? [] : record ? record.recommendations : [{ pl: COPY.pl.unknownRecommendation, en: COPY.en.unknownRecommendation }];
    return `<div class="rol-result-head"><span class="eyebrow">${c.selectedPattern}</span><button type="button" class="rol-clear" data-rol-clear>${c.clear}</button></div>
      <div class="rol-result-ring">${ringMarkup(active, { tone: ids.length ? 'red' : 'green', compact: true })}</div>
      <div class="rol-pattern-code">${ids.length ? ids.join(' · ') : '—'}</div>
      <dl class="rol-stats">
        <div><dt>${c.activeCount}</dt><dd>${countLabel(ids.length)}</dd></div>
        <div><dt>${c.activeNames}</dt><dd>${ids.length ? ids.join(', ') : '—'}</dd></div>
      </dl>
      <div class="rol-diagnosis">
        <span class="eyebrow">${c.description}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>
        <span class="rol-field-label">${c.diagnosis}</span><p class="rol-field-value">${escapeHtml(diagnosis)}</p>
        ${causes.length ? `<span class="rol-field-label">${c.possibleCauses}</span>${listMarkup(causes)}` : ''}
        ${recommendations.length ? `<span class="rol-field-label">${c.recommendations}</span>${listMarkup(recommendations)}` : ''}
      </div>`;
  }

  function attachMainEvents(container) {
    container.querySelectorAll('[data-rol-segment]').forEach(element => {
      const toggle = () => {
        const index = Number(element.dataset.rolSegment);
        active[index] = !active[index];
        render(currentLanguage);
      };
      element.addEventListener('click', toggle);
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  function render(language = currentLanguage) {
    currentLanguage = language === 'en' ? 'en' : 'pl';
    const main = document.getElementById('rolMainRing');
    const panel = document.getElementById('rolResultPanel');
    const examples = document.getElementById('rolExamples');
    if (!main || !panel || !examples) return;

    main.setAttribute('aria-label', currentLanguage === 'pl' ? 'Interaktywny schemat Ring of Light' : 'Interactive Ring of Light diagram');
    main.innerHTML = ringMarkup(active, { interactive: true, tone: 'green' });
    attachMainEvents(main);
    const ids = activeIds();
    panel.className = `rol-result-panel${ids.length ? ' has-selection' : ''}${ids.length && !PATTERN_DATABASE[ids.join(',')] ? ' is-unknown' : ''}`;
    panel.innerHTML = panelMarkup();
    panel.querySelector('[data-rol-clear]').addEventListener('click', () => {
      active = [false, false, false, false];
      render(currentLanguage);
    });

    const examplesData = [
      [true, false, false, false],
      [true, true, false, false],
      [true, true, false, true],
      [true, true, true, true]
    ];
    const c = COPY[currentLanguage];
    examples.innerHTML = examplesData.map((example, index) => `<button type="button" class="rol-example" data-rol-example="${index}" aria-label="${c.setPattern}: ${countLabel(index + 1)}">
      <span class="rol-example-ring">${ringMarkup(example, { tone: 'red', compact: true })}</span>
      <strong>${countLabel(index + 1)}</strong><small>${SEGMENTS.filter((_, segmentIndex) => example[segmentIndex]).map(segment => segment.id).join(' · ')}</small>
    </button>`).join('');
    examples.querySelectorAll('[data-rol-example]').forEach(button => button.addEventListener('click', () => {
      active = [...examplesData[Number(button.dataset.rolExample)]];
      render(currentLanguage);
    }));
  }

  window.MODIRingOfLight = {
    render,
    setPattern(ids = []) {
      const selected = new Set(ids);
      active = SEGMENTS.map(segment => selected.has(segment.id));
      render(currentLanguage);
    },
    clear() {
      active = [false, false, false, false];
      render(currentLanguage);
    },
    patterns: PATTERN_DATABASE
  };
})();
