import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlacement } from './validate-jasper-placement.mjs';

// Independent, narrow reader for the component-instance and placed-symbol
// records observed in the supplied Allegro 15 Jasper V1 board. This does not
// parse nets, footprints or electrical values, and must not be used on an
// arbitrary .brd without additional format validation.
export const JASPER_SHA256 = '241869E262481208027F5FE8952D6D1AAEBCBEAD9E1E392EF5C144EA94977C7E';
const MAGIC = 0x0012050a;
const REFDES = /^[A-Z]{1,3}\d+[A-Z]?\d*$/;

export function extractJasperPlacement(buffer, { requireKnownSource = true } = {}) {
  if (buffer.length < 0x1200 || buffer.readUInt32LE(0) !== MAGIC) {
    throw new Error('Not the expected Allegro 15 binary board format.');
  }
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
  if (requireKnownSource && sha256 !== JASPER_SHA256) {
    throw new Error('The BRD SHA-256 does not match the verified Jasper V1 source.');
  }
  const divisor = buffer.readUInt32LE(0x26c);
  if (divisor !== 10000) throw new Error(`Unexpected coordinate divisor ${divisor}.`);

  const instances = new Map();
  for (let offset = 0x1200; offset + 64 <= buffer.length; offset += 4) {
    if (buffer.readUInt32LE(offset) !== 0x1c00) continue;
    const end = buffer.indexOf(0, offset + 8);
    if (end < offset + 9 || end > offset + 39) continue;
    const ref = buffer.toString('ascii', offset + 8, end);
    if (!REFDES.test(ref)) continue;
    const key = buffer.readUInt32LE(offset + 4);
    if (instances.has(key) && instances.get(key) !== ref) {
      throw new Error(`Conflicting component-instance key ${key}.`);
    }
    instances.set(key, ref);
  }

  const components = [];
  const seen = new Set();
  for (let offset = 0x1200; offset + 60 <= buffer.length; offset += 4) {
    if (buffer[offset] !== 0 || buffer[offset + 1] !== 0xb4 ||
        buffer[offset + 2] > 1 || buffer[offset + 3] !== 0) continue;
    const ref = instances.get(buffer.readUInt32LE(offset + 28));
    if (!ref) continue;
    if (seen.has(ref)) throw new Error(`Duplicate placed component ${ref}.`);
    seen.add(ref);
    const rotation = buffer.readInt32LE(offset + 12) / 1000;
    const x = buffer.readInt32LE(offset + 16) / divisor;
    const y = buffer.readInt32LE(offset + 20) / divisor;
    if (Math.abs(x) > 20000 || Math.abs(y) > 20000 ||
        rotation < -360 || rotation > 360) {
      throw new Error(`Implausible placement for ${ref}.`);
    }
    components.push({ ref, x, y, side: buffer[offset + 2] ? 'bottom' : 'top', rotation });
  }
  components.sort((a, b) => a.ref.localeCompare(b.ref, 'en', { numeric: true }));
  if (requireKnownSource && components.length !== 1952) {
    throw new Error(`Expected 1952 Jasper V1 placements, found ${components.length}.`);
  }
  const csv = ['REFDES,SYM_X,SYM_Y,SYM_MIRROR',
    ...components.map(c => `${c.ref},${c.x},${c.y},${c.side === 'bottom' ? 'TRUE' : 'FALSE'}`),
  ].join('\n');
  const validated = validatePlacement(csv, { units: 'mil', sourceBoard: 'Xbox_360_Jasper.brd' });
  return {
    ...validated,
    sha256,
    coordinateDivisor: divisor,
    sourceFormat: 'Allegro 15 binary component placements',
    summary: {
      total: components.length,
      top: components.filter(c => c.side === 'top').length,
      bottom: components.filter(c => c.side === 'bottom').length,
    },
    components,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  try {
    const source = process.argv[2];
    if (!source) throw new Error('Usage: node tools/extract-jasper-placement.mjs Xbox_360_Jasper.brd [output.json]');
    const result = extractJasperPlacement(fs.readFileSync(source));
    const output = process.argv[3];
    if (output) fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify({ sha256: result.sha256, units: result.units,
      status: result.status, summary: result.summary, output: output || null }, null, 2));
  } catch (error) {
    console.error(`Jasper placement extraction failed: ${error.message}`);
    process.exitCode = 1;
  }
}
