import fs from 'node:fs';
import path from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  throw new Error('Usage: node tools/build-trinity-components.mjs <input.cad> <output.js>');
}

const source = fs.readFileSync(input, 'utf8');
const start = source.indexOf('$COMPONENTS');
const end = source.indexOf('$ENDCOMPONENTS');
if (start < 0 || end < 0 || end <= start) throw new Error('GENCAD component section not found');

const section = source.slice(start + '$COMPONENTS'.length, end);
const blocks = section.split(/\r?\n(?=COMPONENT )/).map(s => s.trim()).filter(Boolean);
function field(block, name) {
  return block.match(new RegExp(`^${name}\\s+(.+)$`, 'm'))?.[1]?.trim() || '';
}

function classify(ref, deviceType) {
  if (/^(TP|FT)/.test(ref)) return 'test-point';
  if (/^R/.test(ref)) return 'resistor';
  if (/^C/.test(ref)) return 'capacitor';
  if (/^(L|FB)/.test(ref)) return 'inductor';
  if (/^Q/.test(ref)) return 'transistor';
  if (/^D/.test(ref)) return 'diode';
  if (/^U/.test(ref)) return 'integrated-circuit';
  if (/^J/.test(ref)) return 'connector';
  if (/^Y|^X/.test(ref) || /CRYSTAL|XTAL/.test(deviceType)) return 'clock';
  return 'other';
}

const components = blocks.map(block => {
  const ref = field(block, 'COMPONENT');
  const place = field(block, 'PLACE').split(/\s+/).map(Number);
  const attrs = Object.fromEntries([...block.matchAll(/^ATTRIBUTE\s+\S+\s+"([^"]+)"\s+"([^"]*)"/gm)].map(m => [m[1], m[2]]));
  const device = field(block, 'DEVICE');
  const value = attrs.VALUE || '';
  const type = classify(ref, attrs.COMP_DEVICE_TYPE || '');
  return {
    ref,
    x: place[0],
    y: place[1],
    side: field(block, 'LAYER').toLowerCase(),
    rotation: Number(field(block, 'ROTATION')) || 0,
    type,
    value,
    device,
    partNumber: attrs.PARTNUMBER || '',
    package: attrs.COMP_PACKAGE || '',
    function: attrs.COMP_DEVICE_TYPE || type,
    positionConfidence: 'cross-checked',
    valueStatus: value ? 'source-recorded' : 'unknown'
  };
}).filter(c => c.ref && Number.isFinite(c.x) && Number.isFinite(c.y));

const xs = components.map(c => c.x);
const ys = components.map(c => c.y);
const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
const summary = components.reduce((acc, c) => {
  acc.total++;
  acc[c.side] = (acc[c.side] || 0) + 1;
  acc.crossChecked++;
  if (c.value) acc.withValue++;
  else acc.unknownValue++;
  return acc;
}, { total: 0, top: 0, bottom: 0, crossChecked: 0, withValue: 0, unknownValue: 0 });

const data = {
  schemaVersion: 1,
  board: 'xbox-360-s',
  revision: 'trinity-retail-rev-1.01',
  label: 'Trinity Retail · Rev 1.01',
  sourceFormat: ['GENCAD 1.4', 'Allegro 15.5.2 cross-check'],
  bounds,
  summary,
  components
};

const js = `window.MODI_COMPONENT_DB = ${JSON.stringify(data)};\n`;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, js);
console.log(JSON.stringify({ output, bounds, summary }, null, 2));
