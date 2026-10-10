import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const appPath = path.join(root, 'dist', 'assets', 'app.js');
const app = fs.readFileSync(appPath, 'utf8');
const profiles = fs.readFileSync(path.join(root, 'dist', 'assets', 'component-profiles.js'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
  console
};
vm.createContext(sandbox);
vm.runInContext(profiles, sandbox, { filename: 'component-profiles.js' });
vm.runInContext(`${app}\n;globalThis.__matrix={B,RAIL_META,ERRORS,ERROR_SERVICE,SEQUENCE_TRINITY,SYMPTOMS,PSU_STATES,state,trinityDiagSteps,psuMeasurement};`, sandbox, { filename: appPath });

const { B, RAIL_META, ERRORS, ERROR_SERVICE, SEQUENCE_TRINITY, SYMPTOMS, PSU_STATES, state, trinityDiagSteps, psuMeasurement } = sandbox.__matrix;
const board = B.trinity;
const regionIds = new Set(board.regions.map(region => region.id));
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));

check(board.regions.length === 8, `expected 8 Trinity regions, found ${board.regions.length}`);
for (const region of board.regions) {
  check(region.views.length >= 1 && region.views.length <= 3, `${region.id}: expected 1–3 close-ups`);
  for (const view of region.views) {
    check(view.notes.every(note => note.length >= 5), `${region.id}/${view.name}: malformed PCB note`);
    check(view.notes.every(note => note[2] >= 0 && note[2] <= 100 && note[3] >= 0 && note[3] <= 100), `${region.id}/${view.name}: note outside PCB coordinate range`);
  }
}

check(board.rails.length === 10, `expected 10 Trinity rails, found ${board.rails.length}`);
for (const rail of board.rails) {
  const [mode, name, expected, source, point, region] = rail;
  const meta = RAIL_META.trinity[name];
  check(['standby', 'poweron', 'run'].includes(mode), `${name}: invalid mode ${mode}`);
  check(Boolean(expected && source && point), `${name}: incomplete measurement card`);
  check(regionIds.has(region), `${name}: missing target region ${region}`);
  check(Boolean(meta), `${name}: missing rail metadata`);
  check(meta?.path?.length > 0, `${name}: empty diagnostic route`);
  check(meta?.path?.every(id => regionIds.has(id)), `${name}: diagnostic route references an unknown region`);
  check(Boolean(meta?.condition && meta?.loads && meta?.missing), `${name}: incomplete diagnostic guidance`);
}

const trinityErrors = ERRORS.filter(error => error.boards.includes('trinity'));
check(trinityErrors.length === 15, `expected 15 curated Trinity errors, found ${trinityErrors.length}`);
for (const error of trinityErrors) {
  const service = ERROR_SERVICE.trinity[error.code];
  check(Boolean(service), `${error.code}: missing service profile`);
  check(regionIds.has(service?.primary), `${error.code}: invalid primary region`);
  check(service?.secondary?.every(id => regionIds.has(id)), `${error.code}: invalid secondary region`);
  check(service?.steps?.length >= 2, `${error.code}: expected at least two checks`);
  check(service?.steps?.every(step => regionIds.has(step.area)), `${error.code}: a check references an unknown region`);
  check(service?.steps?.every(step => step.label && step.point && step.expected && step.condition), `${error.code}: incomplete check`);
}

check(SEQUENCE_TRINITY.length === 10, `expected 10 Trinity sequence stages, found ${SEQUENCE_TRINITY.length}`);
SEQUENCE_TRINITY.forEach((stage, index) => {
  check(stage.n === String(index + 1).padStart(2, '0'), `sequence index ${index}: unexpected number ${stage.n}`);
  check(regionIds.has(stage.region), `sequence ${stage.n}: invalid region ${stage.region}`);
  check(Boolean(stage.title && stage.rail && stage.condition && stage.point && stage.expected && stage.components && stage.next), `sequence ${stage.n}: incomplete stage`);
});

for (const symptom of SYMPTOMS) {
  state.symptom = symptom.id;
  const steps = trinityDiagSteps();
  check(steps.length >= 3, `${symptom.id}: path is too short`);
  check(steps.every(step => regionIds.has(step.region)), `${symptom.id}: step references an unknown region`);
  check(steps.every(step => step.q && step.help && step.meter && step.expect && step.where && step.condition && step.sourceNode && step.loads && step.no), `${symptom.id}: incomplete diagnostic step`);
}

check(PSU_STATES.length === 4, `expected four PSU states, found ${PSU_STATES.length}`);
for (const psu of PSU_STATES) {
  state.psuLed = psu.id;
  const measurement = psuMeasurement(psu);
  check(Boolean(measurement && psu.expected && psu.meaning && psu.action), `${psu.id}: incomplete PSU path`);
  check(regionIds.has('powerin'), `${psu.id}: power-input region is missing`);
}

const profileList = sandbox.window.MODI_COMPONENT_PROFILES?.trinity || [];
for (const profile of profileList) {
  check(regionIds.has(profile.region), `${profile.ref}: invalid profile region ${profile.region}`);
  check(profile.checks.every(checkItem => !checkItem.region || regionIds.has(checkItem.region)), `${profile.ref}: invalid check region`);
}

for (const match of app.matchAll(/returnTarget:'([^']+)'/g)) {
  check(htmlIds.has(match[1]), `missing return target #${match[1]}`);
}

for (const asset of [board.images.top, board.images.bottom]) {
  check(fs.existsSync(path.join(root, 'dist', asset)), `missing Trinity board asset ${asset}`);
}

if (failures.length) {
  console.error(`FAIL navigation matrix (${failures.length})`);
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

const symptomCounts = SYMPTOMS.map(symptom => {
  state.symptom = symptom.id;
  return `${symptom.id}:${trinityDiagSteps().length}`;
}).join(', ');
console.log(`PASS navigation matrix: ${board.regions.length} regions, ${board.rails.length} rails, ${trinityErrors.length} error codes, ${SEQUENCE_TRINITY.length} boot stages, ${PSU_STATES.length} PSU states and symptom paths ${symptomCounts}.`);
