import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const image = fs.readFileSync(path.join(root, 'dist/assets/pcb-jasper-bottom.png'));
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.equal(image.readUInt32BE(16), 2494);
assert.equal(image.readUInt32BE(20), 2048);
assert.equal(createHash('sha256').update(image).digest('hex').toUpperCase(),
  'CA21EEB5DD6E68692BC8AAF7ADB0FF31033783A351AFF97D27E802D5B41B93C0');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/assets/jasper-components.js'), 'utf8'), sandbox);
const db = sandbox.window.MODI_JASPER_COMPONENT_DB;
const fit = db.bottomPhotoCalibration;
assert.equal(fit.landmarks, 8);
assert.equal(fit.width, 2494);
assert.equal(fit.height, 2048);
assert.ok(fit.rmsPx <= 9 && fit.maxPx <= 16);
const observations = [
  ['U8N1', 391, 566], ['U8U1', 439, 1608], ['U7U2', 597, 1633],
  ['U4V1', 1610, 1707], ['U3R1', 1851, 1001], ['U3T1', 1851, 1231],
  ['U4U1', 1570, 1515], ['U5U1', 1340, 1515],
];
assert.deepEqual(Array.from(fit.landmarkRefs), observations.map(row => row[0]));
for (const [ref, x, y] of observations) {
  const component = db.components.find(item => item.ref === ref);
  assert.equal(component?.side, 'bottom', `${ref} must be a BOTTOM-side placement`);
  const projectedX = (fit.x[0] * component.x + fit.x[1] * component.y + fit.x[2]) * fit.width / 100;
  const projectedY = (fit.y[0] * component.x + fit.y[1] * component.y + fit.y[2]) * fit.height / 100;
  assert.ok(Math.hypot(projectedX - x, projectedY - y) <= 16, `${ref} exceeds the landmark guard`);
}
const app = fs.readFileSync(path.join(root, 'dist/assets/app.js'), 'utf8');
assert.ok(app.includes("bottom:'assets/pcb-jasper-bottom.png'"), 'Jasper BOTTOM photo must be connected');
assert.ok(app.includes('JASPER_BOTTOM_VERIFIED') && app.includes('JASPER_BOTTOM_VIEWS'),
  'The BOTTOM UI must use a reviewed-reference allowlist and separate closeups');
console.log('PASS Jasper BOTTOM intake: source hash, image dimensions, 8 underside landmarks, guarded calibration and side-specific UI.');
