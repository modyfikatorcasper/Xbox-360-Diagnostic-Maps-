import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../dist/assets/app.js', import.meta.url), 'utf8');
const sandbox = {
  console,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
};

vm.runInNewContext(`${source}\n;globalThis.__powerBoot={SEQUENCE_TRINITY,trinityDiagSteps,state};`, sandbox);
const { SEQUENCE_TRINITY, trinityDiagSteps, state } = sandbox.__powerBoot;
const fail = message => { throw new Error(message); };
const text = value => typeof value === 'object' ? `${value.pl ?? ''} ${value.en ?? ''}` : String(value ?? '');

if (SEQUENCE_TRINITY.length !== 10) fail(`Expected 10 Trinity sequence stages, got ${SEQUENCE_TRINITY.length}`);
SEQUENCE_TRINITY.forEach((stage, index) => {
  for (const field of ['n', 'title', 'region', 'rail', 'point', 'expected', 'condition', 'components', 'next']) {
    if (!stage[field] || !text(stage[field]).trim()) fail(`Sequence ${index + 1} lacks ${field}`);
  }
});

const expectedVoltages = ['5.0 V', '3.315 V', '1.802 V', '5.09 V', '3.3 V', '0.9–1.2 V', '1.075 V', '1.25–1.3 V', '1.8 V'];
const sequenceText = JSON.stringify(SEQUENCE_TRINITY);
expectedVoltages.forEach(value => { if (!sequenceText.includes(value)) fail(`Missing verified voltage ${value}`); });
[3, 4, 7, 8, 9].forEach(stageNumber => {
  if (!text(SEQUENCE_TRINITY[stageNumber - 1].expected).includes('UNKNOWN')) fail(`Signal stage ${stageNumber} must preserve UNKNOWN`);
});
if (!SEQUENCE_TRINITY[9].outcome) fail('Dashboard must be marked as an outcome, not a measurement');

const minimumSteps = { dead: 6, pulse: 6, off: 6, red: 3 };
for (const [symptom, minimum] of Object.entries(minimumSteps)) {
  state.symptom = symptom;
  const steps = trinityDiagSteps();
  if (steps.length < minimum) fail(`${symptom} has ${steps.length} steps; expected at least ${minimum}`);
  steps.forEach((step, index) => {
    for (const field of ['q', 'help', 'meter', 'expect', 'region', 'where', 'condition', 'sourceNode', 'loads', 'no']) {
      if (step[field] === undefined || !text(step[field]).trim()) fail(`${symptom} step ${index + 1} lacks ${field}`);
    }
  });
}

console.log('PASS power/boot data: 10 sequence stages; dead 6, pulse 6, off 6, red 3; verified voltages and UNKNOWN safeguards present.');
