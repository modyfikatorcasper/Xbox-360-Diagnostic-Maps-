import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const appPath = path.join(root, 'dist', 'assets', 'app.js');
const app = fs.readFileSync(appPath, 'utf8');
const css = fs.readFileSync(path.join(root, 'dist', 'assets', 'styles.css'), 'utf8');

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
check(duplicates.length === 0, `duplicate HTML ids: ${[...new Set(duplicates)].join(', ')}`);
const idSet = new Set(ids);

for (const match of html.matchAll(/(?:href="#|data-jump=")([^"]+)"/g)) {
  check(idSet.has(match[1]), `navigation target #${match[1]} does not exist`);
}

for (const controlId of ['componentSearch', 'componentSide', 'componentGroup', 'componentArea', 'errorFilter']) {
  check(new RegExp(`<label[^>]+for="${controlId}"`).test(html), `${controlId} has no explicit label`);
}

const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
  console
};
vm.createContext(sandbox);
vm.runInContext(`${app}\n;globalThis.__uiContract={I18N,B};`, sandbox, { filename: appPath });
const { I18N, B } = sandbox.__uiContract;
const plKeys = Object.keys(I18N.pl).sort();
const enKeys = Object.keys(I18N.en).sort();
check(JSON.stringify(plKeys) === JSON.stringify(enKeys), 'PL and EN dictionaries do not contain the same keys');

const markupKeys = [...html.matchAll(/data-i18n(?:-placeholder|-aria)?="([^"]+)"/g)].map(match => match[1]);
for (const key of new Set(markupKeys)) {
  check(Boolean(I18N.pl[key]), `missing PL translation: ${key}`);
  check(Boolean(I18N.en[key]), `missing EN translation: ${key}`);
}

check(B.trinity.regions.length > 0 && B.jasper.regions.length > 0, 'both board revisions must expose regions');
check(!/function\s+localizedNote\b/.test(app), 'ad-hoc localizedNote translator is still present');
check(/function\s+resetBoardState\b/.test(app), 'board-specific state reset is missing');
check(/vp\.addEventListener\('keydown'/.test(app), 'PCB viewport keyboard controls are missing');
check(/aria-pressed/.test(app) && /aria-selected/.test(app), 'dynamic selection semantics are missing');
check(/:focus-visible/.test(css), 'global focus-visible styling is missing');
check(css.includes(':root{--blue:#137a4b;--cyan:#67e49f;--green:#50d68c}') &&
  css.includes('.photo-pin-focus{--pin:#67e49f}'),
  'active controls and focused PCB points must use the green review accent');
check(/prefers-reduced-motion/.test(css), 'reduced-motion support is missing');
check(/\.sr-only/.test(css), 'screen-reader-only utility is missing');
for (const photo of ['Trinity_Top', 'Trinity_Bottom', 'Jasper_V1_Top', 'Jasper_V1_Bottom']) {
  check(app.includes(`File:Xbox_360_${photo}.png`), `legal dialog missing ${photo} photo source`);
}
check(app.includes('https://creativecommons.org/licenses/by/4.0/') &&
  app.includes('https://creativecommons.org/licenses/by-sa/4.0/'),
  'legal dialog must disclose both conflicting licence notices');
check(html.includes('id="openSources"'), 'Sources and licences control is missing');
check(html.includes('id="componentPager"') && css.includes('.component-pager'), 'Jasper component results need accessible pagination');
check(css.includes('.photo-pin.provisional:before') && css.includes('border:2px dashed') &&
  css.includes('.photo-pin.provisional:after') && app.includes("--vicinity-size"),
  'Unreviewed Jasper parts need a zoom-scaled square vicinity and a center dot');
check(app.includes("['#componentSide','change']") && app.includes("['#componentGroup','change']") && app.includes("['#componentArea','change']"), 'Jasper search filters are not wired to events');

vm.runInContext(`{
  const elements = new Map();
  document.querySelector = selector => {
    if (!elements.has(selector)) elements.set(selector, { textContent: '', innerHTML: '', addEventListener() {} });
    return elements.get(selector);
  };
  document.querySelectorAll = () => [];
  updateSideUi = renderRegionMarkers = renderComponents = renderRails = renderIcs =
    renderSequence = renderErrors = renderDiagnosis = layoutPhoto = () => {};
  selectRegion = id => { state.region = id; state.componentFocus = null; state.fullBoardView = false; state.userZoom = 1; state.panX = state.panY = 0; };
  const calls = [];
  focusComponent = (ref, context, scroll) => { calls.push({ ref, context, scroll }); state.componentFocus = { ref }; };
  showFullBoard = () => { calls.push({ fullBoard: true }); state.fullBoardView = true; };
  state.board = 'trinity'; state.side = 'bottom'; state.region = 'standby';
  state.componentFocus = { ref: 'U7T1' }; state.diagnosticContext = { kindKey: 'componentContext' };
  state.userZoom = 1.4; state.panX = 22; state.panY = -15;
  renderBoard();
  const focused = { calls: calls.slice(), ref: state.componentFocus?.ref, zoom: state.userZoom, panX: state.panX, panY: state.panY };
  state.componentFocus = null; state.fullBoardView = true; state.userZoom = 1.2;
  renderBoard();
  const full = { calls: calls.slice(), fullBoard: state.fullBoardView, zoom: state.userZoom };
  state.lang = 'pl';
  renderFocusedComponentDetail({ ref: 'U7T1', side: 'bottom', value: null });
  const detailPl = elements.get('#regionDetail').innerHTML;
  state.lang = 'en';
  renderFocusedComponentDetail({ ref: 'U7T1', side: 'bottom', value: null });
  globalThis.__boardViewState = { focused, full, detailPl, detailEn: elements.get('#regionDetail').innerHTML };
}`, sandbox);
const viewState = sandbox.__boardViewState;
check(viewState.focused.ref === 'U7T1' && viewState.focused.calls[0]?.ref === 'U7T1' && viewState.focused.calls[0]?.scroll === false,
  're-render must retain the selected component without scrolling');
check(viewState.focused.zoom === 1.4 && viewState.focused.panX === 22 && viewState.focused.panY === -15,
  're-render must retain component photo zoom and pan');
check(viewState.full.fullBoard && viewState.full.calls.at(-1)?.fullBoard && viewState.full.zoom === 1.2,
  're-render must retain full-board view and zoom');
check(viewState.detailPl.includes('Wybrany element') && viewState.detailEn.includes('Selected component') &&
  viewState.detailPl.includes('value="" selected') && viewState.detailEn.includes('value="" selected'),
  'focused component must not leave a stale selected board area in PL or EN');

vm.runInContext(`{
  state.board = 'trinity'; state.side = 'top'; state.lang = 'pl';
  renderCalibration();
  globalThis.__plainPhotoCopy = {
    badge: document.querySelector('#calibrationBadge').textContent,
    note: document.querySelector('#calibrationNote').textContent,
    jasperStatus: I18N.pl.jasperPositionStatus,
    jasperCaution: I18N.pl.jasperPhotoCaution,
    profileIntro: I18N.pl.profileIntro,
  };
}`, sandbox);
const photoCopy = sandbox.__plainPhotoCopy;
check(!/RMS|MAX|BRD|XDK|punktów montażowych/i.test(`${photoCopy.badge} ${photoCopy.note} ${photoCopy.jasperStatus} ${photoCopy.jasperCaution} ${photoCopy.profileIntro}`),
  'main PCB guidance still exposes calibration or source-file jargon');
check(/sondy/.test(photoCopy.note) && /nadruk/.test(photoCopy.note),
  'plain PCB guidance must retain the probe-location and silkscreen cautions');

for (const script of [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1])) {
  check(fs.existsSync(path.join(root, 'dist', script)), `missing script asset: ${script}`);
}

if (failures.length) {
  console.error(`FAIL UI contract (${failures.length})`);
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`PASS UI contract: ${ids.length} unique ids; ${new Set(markupKeys).size} translated markup keys; PL/EN parity, navigation, labels, focus, reduced motion and PCB keyboard controls verified.`);
