import assert from 'node:assert/strict';
import { REQUIRED_REFS, validatePlacement } from './validate-jasper-placement.mjs';

const rows = REQUIRED_REFS.map((ref, i) => `${ref},${100 + i * 17},${200 + i * 11},FALSE`);
const report = ['REFDES,SYM_X,SYM_Y,SYM_MIRROR', ...rows].join('\n');
const options = { units: 'mil', sourceBoard: 'Xbox_360_Jasper.brd' };
const accepted = validatePlacement(report, options);
assert.equal(accepted.count, REQUIRED_REFS.length);
assert.equal(accepted.components[0].side, 'top');
assert.match(accepted.status, /unverified/);

const rejects = (input, opts, message) => assert.throws(() => validatePlacement(input, opts), message);
rejects(report, { ...options, sourceBoard: 'Xbox_360_Jasper_Tonasket.brd' }, /Tonasket/);
rejects(report, { ...options, units: undefined }, /units/);
rejects(report.replace(rows[0], ''), options, /Missing required/);
assert.equal(validatePlacement(report.replace('FALSE', 'TRUE'), options).components[0].side, 'bottom');
rejects(report.replace('100,200', 'bad,200'), options, /invalid coordinates/);
rejects(`${report}\n${rows[0]}`, options, /duplicate/);
rejects(report.replace('SYM_MIRROR', 'SIDE'), options, /Missing column/);
assert.equal(validatePlacement(report.replaceAll(',', '\t'), options).count, REQUIRED_REFS.length);
assert.equal(validatePlacement(report.replaceAll(',', ';').replace('100;200', '100,5;200,5'), options).components[0].x, 100.5);

console.log('PASS Jasper placement intake: source revision, columns, units, coordinates, sides and anchor completeness.');
