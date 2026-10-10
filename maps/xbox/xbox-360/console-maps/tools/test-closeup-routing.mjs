import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'dist/assets/app.js'), 'utf8');
const sandbox = {
  console,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/assets/jasper-components.js'), 'utf8'), sandbox);
vm.runInContext(`${source}
;globalThis.__routing={B,RAIL_META,ERROR_SERVICE,SEQUENCE_TRINITY,SEQUENCE_JASPER,JASPER_SEQUENCE_PHOTO_CHECKS,JASPER_BOTTOM_VERIFIED,state,railContext,railDirectPhotoRef,errorContext,sequenceContext,sequencePhotoChecks,closeupForContext,closeupMatches,photoFocusRef,I18N};`, sandbox);

const { B, RAIL_META, ERROR_SERVICE, SEQUENCE_TRINITY, SEQUENCE_JASPER, JASPER_SEQUENCE_PHOTO_CHECKS, JASPER_BOTTOM_VERIFIED, state, railContext, railDirectPhotoRef, errorContext, sequenceContext, sequencePhotoChecks, closeupForContext, closeupMatches, photoFocusRef, I18N } = sandbox.__routing;
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const choose = (board, region, context) => {
  state.board = board;
  state.lang = 'pl';
  return closeupForContext(region, context);
};

for (const [board, rail, region, expected] of [
  ['trinity', 'V_5P0', 'mainvrm', 1],
  ['trinity', 'V_3P3', 'mainvrm', 1],
  ['trinity', 'V_CPUEDRAM', 'xcgpu', 1],
  ['jasper', 'V_5P0', 'mainvrm', 2],
  ['jasper', 'V_CPUCORE', 'cpu', 1],
  ['jasper', 'V_CPUVCS', 'cpu', 2],
  ['jasper', 'V_GPUCORE', 'gpu', 1],
]) {
  state.board = board;
  const item = B[board].rails.find(row => row[1] === rail);
  check(Boolean(item), `${board}: missing rail ${rail}`);
  if (item) check(choose(board, region, railContext(item, RAIL_META[board][rail])) === expected,
    `${board}/${rail}: expected close-up ${expected + 1}`);
}

state.board = 'jasper';
check(choose('jasper', 'mainvrm', errorContext('0031', 'decoder', 0)) === 2,
  'Jasper code 0031 must open the 5 V regulator close-up');
check(closeupMatches('mainvrm', { title: 'U4V1 · ADP1823', measure: 'Inspect this IC' }).length === 0,
  'Bottom-side U4V1 must not be claimed as a marked TOP-photo component');
const unmarked = B.jasper.rails.find(row => row[1] === 'V_3P3');
check(railDirectPhotoRef(unmarked) === 'FT1U1',
  'Jasper V_3P3 must open the verified underside FT1U1 as a direct photo focus');
check(railDirectPhotoRef(B.jasper.rails.find(row => row[1] === 'V_1P8')) === 'FT2R8',
  'V_1P8 must open the silkscreen-checked underside FT2R8 as a direct photo focus');
check(closeupMatches('mainvrm', railContext(unmarked, RAIL_META.jasper.V_3P3)).length === 0,
  'Jasper FT1U1 must not be forced into an unrelated section close-up');
check(photoFocusRef('mainvrm', railContext(unmarked, RAIL_META.jasper.V_3P3)) === null,
  'Jasper bottom-side FT1U1 must not be highlighted on the TOP photo');
const jasperStageSix = sequenceContext(SEQUENCE_JASPER[5]);
check(jasperStageSix.focusRef === 'L8E1' && choose('jasper', 'mainvrm', jasperStageSix) === 0,
  'Jasper multi-rail stage must start at its explicit CPUCORE focus point');
check(photoFocusRef('mainvrm', jasperStageSix) === 'L8E1',
  'Jasper multi-rail stage must highlight the explicit TOP-side component');
check(choose('jasper', 'mainvrm', { measure: 'L8E1 · L6C1', focusRef: 'L6C1' }) === 1,
  'An explicit focus point must take precedence over an earlier measurement reference');
check(photoFocusRef('mainvrm', { measure: 'U4V1 · L6F1' }) === 'L6F1',
  'A BOTTOM controller must not displace its visible TOP-side measurement point');
state.side = 'bottom';
const standbyInput = B.jasper.rails.find(row => row[1] === 'V_5P0STBY');
check(closeupForContext('powerin', railContext(standbyInput, RAIL_META.jasper.V_5P0STBY)) === 0 &&
  photoFocusRef('powerin', railContext(standbyInput, RAIL_META.jasper.V_5P0STBY)) === 'FT8N1',
  'Jasper standby input must focus the reviewed underside FT8N1 point');
check(closeupForContext('mainvrm', errorContext('0031', 'decoder', 0)) === 2 &&
  photoFocusRef('mainvrm', errorContext('0031', 'decoder', 0)) === 'FT6V1',
  'Jasper code 0031 must focus FT6V1 in the BOTTOM 5 V close-up');
check(closeupForContext('memory', errorContext('0033', 'decoder', 0)) === 0 &&
  photoFocusRef('memory', errorContext('0033', 'decoder', 0)) === 'FT2U1',
  'Jasper code 0033 must focus FT2U1 beside the underside memory bank');
check(closeupMatches('mainvrm', railContext(unmarked, RAIL_META.jasper.V_3P3)).length === 0,
  'Direct-focus BOTTOM FT1U1 must not appear in an unrelated main-VRM close-up');
for (const number of ['02', '05', '06']) {
  const stage = SEQUENCE_JASPER.find(item => item.n === number);
  const checks = sequencePhotoChecks(stage);
  check(checks.length === JASPER_SEQUENCE_PHOTO_CHECKS[number].length && checks.length > 1,
    `Jasper stage ${number} must expose each rail as a separate photo destination`);
  for (const [rail, ref, region, expected] of checks) {
    const component = sandbox.window.MODI_JASPER_COMPONENT_DB.components.find(item => item.ref === ref);
    check(Boolean(component), `Jasper stage ${number}: ${ref} missing from BRD placements`);
    check(Boolean(B.jasper.rails.find(item => item[1] === rail)), `Jasper stage ${number}: ${rail} missing from rail cards`);
    check(Boolean(B.jasper.regions.find(item => item.id === region)), `Jasper stage ${number}: ${region} is not a board area`);
    check(Boolean(expected), `Jasper stage ${number}: ${ref} has no expected result`);
    if (!component) continue;
    state.side = component.side;
    if (component.side === 'bottom') check(JASPER_BOTTOM_VERIFIED.has(ref), `Jasper stage ${number}: ${ref} is not in the reviewed underside allowlist`);
    if (ref !== 'FT1U1') check(closeupMatches(region, { focusRef: ref }).length > 0,
      `Jasper stage ${number}: ${ref} has no close-up on ${component.side}`);
  }
}
state.side = 'top';
state.board = 'trinity';
const coreStage = SEQUENCE_TRINITY[5];
check(closeupMatches(coreStage.region, sequenceContext(coreStage)).length === 3,
  'Trinity core/memory stage must identify all three logical close-ups');
check(Boolean(I18N.pl.multiCloseupHint && I18N.en.multiCloseupHint && I18N.pl.photoPointUnmarked && I18N.en.photoPointUnmarked),
  'multi-close-up and unmarked-point guidance must be bilingual');
check(Boolean(I18N.pl.photoFocusHint && I18N.en.photoFocusHint && I18N.pl.photoFocusCaution && I18N.en.photoFocusCaution),
  'focused component and probe-location caution must be bilingual');

let routes = 0;
for (const board of ['trinity', 'jasper']) {
  state.board = board;
  for (const rail of B[board].rails) {
    const target = rail[5], context = railContext(rail, RAIL_META[board][rail[1]]);
    const view = choose(board, target, context);
    check(view >= 0 && view < B[board].regions.find(region => region.id === target).views.length,
      `${board}/${rail[1]}: invalid close-up index`);
    routes++;
  }
  for (const [code, service] of Object.entries(ERROR_SERVICE[board])) {
    service.steps.forEach((step, index) => {
      const view = choose(board, step.area, errorContext(code, 'decoder', index));
      check(view >= 0 && view < B[board].regions.find(region => region.id === step.area).views.length,
        `${board}/${code}/step ${index + 1}: invalid close-up index`);
      routes++;
    });
  }
  for (const stage of board === 'trinity' ? SEQUENCE_TRINITY : SEQUENCE_JASPER) {
    const view = choose(board, stage.region, sequenceContext(stage));
    check(view >= 0 && view < B[board].regions.find(region => region.id === stage.region).views.length,
      `${board}/stage ${stage.n}: invalid close-up index`);
    routes++;
  }
}

if (failures.length) {
  console.error(`FAIL close-up routing (${failures.length})`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`PASS close-up routing: ${routes} rail, error-step and boot-stage routes; targeted multi-view destinations verified.`);
