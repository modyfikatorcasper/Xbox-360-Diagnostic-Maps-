import assert from 'node:assert/strict';
import { extractJasperPlacement } from './extract-jasper-placement.mjs';
import { REQUIRED_REFS } from './validate-jasper-placement.mjs';

// Synthetic records exercise the pointer join and side/coordinate decoding;
// this is not a substitute for the hash-locked extraction of the actual BRD.
const data = Buffer.alloc(0x3100);
data.writeUInt32LE(0x0012050a, 0);
data.writeUInt32LE(10000, 0x26c);
for (const [index, ref] of REQUIRED_REFS.entries()) {
  const key = 0x123000 + index;
  const instance = 0x1200 + index * 64;
  data.writeUInt32LE(0x1c00, instance);
  data.writeUInt32LE(key, instance + 4);
  data.write(ref, instance + 8, 'ascii');
  const placed = 0x2000 + index * 60;
  data[placed + 1] = 0xb4;
  data[placed + 2] = index % 2;
  data.writeInt32LE(index % 4 * 90000, placed + 12);
  data.writeInt32LE(-430000 + index * 1_000_000, placed + 16);
  data.writeInt32LE(120000 + index * 500_000, placed + 20);
  data.writeUInt32LE(key, placed + 28);
}
const parsed = extractJasperPlacement(data, { requireKnownSource: false });
assert.equal(parsed.count, REQUIRED_REFS.length);
assert.equal(parsed.summary.top, 6);
assert.equal(parsed.summary.bottom, 5);
assert.deepEqual(parsed.components.find(c => c.ref === REQUIRED_REFS[0]), {
  ref: REQUIRED_REFS[0], x: -43, y: 12, side: 'top', rotation: 0,
});
assert.equal(parsed.components.find(c => c.ref === REQUIRED_REFS[1]).rotation, 90);
assert.throws(() => extractJasperPlacement(data), /SHA-256/);
const wrongDivisor = Buffer.from(data);
wrongDivisor.writeUInt32LE(1000, 0x26c);
assert.throws(() => extractJasperPlacement(wrongDivisor, { requireKnownSource: false }), /divisor/);
const duplicate = Buffer.from(data);
duplicate.copy(duplicate, 0x2b00, 0x2000, 0x2000 + 60);
assert.throws(() => extractJasperPlacement(duplicate, { requireKnownSource: false }), /Duplicate placed component/);
console.log('PASS Jasper binary extraction: pointers, signed mil coordinates, sides, rotation and source guards.');
