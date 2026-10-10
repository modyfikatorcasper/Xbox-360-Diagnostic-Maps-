import fs from 'node:fs';
import vm from 'node:vm';

const profilesSource = fs.readFileSync(new URL('../dist/assets/component-profiles.js', import.meta.url), 'utf8');
const componentsSource = fs.readFileSync(new URL('../dist/assets/trinity-components.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(componentsSource, sandbox);
vm.runInNewContext(profilesSource, sandbox);

const profiles = sandbox.window.MODI_COMPONENT_PROFILES?.trinity ?? [];
const components = sandbox.window.MODI_COMPONENT_DB?.components ?? [];
const fail = message => { throw new Error(message); };
const localized = value => value && typeof value === 'object' && String(value.pl ?? '').trim() && String(value.en ?? '').trim();

if (profiles.length !== 10) fail(`Expected 10 Trinity component profiles, got ${profiles.length}`);
if (new Set(profiles.map(profile => profile.ref)).size !== profiles.length) fail('Profile refs must be unique');

const knownRefs = new Set(components.map(component => component.ref));
for (const profile of profiles) {
  if (!knownRefs.has(profile.ref)) fail(`${profile.ref} is missing from the cross-checked component database`);
  if (!localized(profile.name) || !localized(profile.role) || !localized(profile.symptoms)) fail(`${profile.ref} lacks PL/EN content`);
  for (const field of ['region', 'mode', 'confidence', 'pinoutStatus', 'primaryRail']) {
    if (!String(profile[field] ?? '').trim()) fail(`${profile.ref} lacks ${field}`);
  }
  for (const field of ['rails', 'related', 'flow', 'signals', 'checks']) {
    if (!Array.isArray(profile[field]) || !profile[field].length) fail(`${profile.ref} lacks ${field}`);
  }
  if (!profile.rails.includes(profile.primaryRail)) fail(`${profile.ref} primary rail is not listed in rails`);
  profile.signals.forEach((signal, index) => {
    if (!signal.pin || !signal.signal || !localized(signal.fn) || !signal.expected) fail(`${profile.ref} signal ${index + 1} is incomplete`);
  });
  profile.checks.forEach((check, index) => {
    if (!check.point || !check.expected || !localized(check.condition) || !check.region) fail(`${profile.ref} check ${index + 1} is incomplete`);
  });
}

const nand = profiles.find(profile => profile.ref === 'U1E2');
if (!nand?.signals.some(signal => signal.pin === '18 / 19' && signal.expected.includes('3.315 V'))) fail('NAND VCC pin group is missing');
if (!nand?.signals.some(signal => signal.pin === '43' && signal.signal === 'CE#')) fail('NAND CE# pin is missing');

const cpucore = profiles.find(profile => profile.ref === 'U7C1');
if (!cpucore?.signals.some(signal => signal.pin === '26' && signal.signal === 'EN/VTT')) fail('NCP4201 EN/VTT pin is missing');
if (!cpucore?.checks.some(check => check.point === 'L6C2' && check.expected === '0.9–1.2 V')) fail('CPUCORE verified measurement is missing');

const xcgpu = profiles.find(profile => profile.ref === 'U5E1');
if (!xcgpu?.signals.some(signal => signal.signal === 'Exact BGA pinout' && signal.expected === 'UNKNOWN')) fail('XCGPU full BGA pinout must remain UNKNOWN');

const unknownSafeguards = JSON.stringify(profiles).match(/UNKNOWN/g)?.length ?? 0;
if (unknownSafeguards < 20) fail(`Expected explicit UNKNOWN safeguards, found ${unknownSafeguards}`);

console.log(`PASS component profiles: ${profiles.length} curated Trinity profiles; all refs exist; PL/EN, checks, pin subsets and ${unknownSafeguards} UNKNOWN safeguards verified.`);
