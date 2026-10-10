import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This is an intake gate, not a .brd decoder or a photograph calibration.
// Export the Jasper V1 component report to CSV/TSV with the columns below.
export const REQUIRED_REFS = [
  'J9A1', 'U2C1', 'U2E1', 'U4C2', 'U4D1', 'U4V1',
  'U5B1', 'U5B2', 'U7D1', 'U8N1', 'U8U1',
];

function splitRow(line, delimiter) {
  const cells = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(value.trim());
      value = '';
    } else value += char;
  }
  if (quoted) throw new Error('Unclosed quoted field');
  cells.push(value.trim());
  return cells;
}

export function validatePlacement(input, { units, sourceBoard } = {}) {
  if (!['mil', 'mm'].includes(units)) throw new Error('Specify --units mil or --units mm; coordinates must not be interpreted implicitly.');
  if (sourceBoard !== 'Xbox_360_Jasper.brd') throw new Error('Specify --source-board Xbox_360_Jasper.brd; Tonasket and other revisions must not be merged.');
  const lines = input.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  if (lines.length < 2) throw new Error('The placement report contains no component rows.');
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const header = splitRow(lines.shift(), delimiter).map(cell => cell.toUpperCase());
  const requiredColumns = ['REFDES', 'SYM_X', 'SYM_Y', 'SYM_MIRROR'];
  for (const column of requiredColumns) if (!header.includes(column)) throw new Error(`Missing column ${column}.`);
  const index = Object.fromEntries(requiredColumns.map(column => [column, header.indexOf(column)]));
  const components = [];
  const seen = new Set();
  for (const [lineNumber, line] of lines.entries()) {
    const row = splitRow(line, delimiter);
    const ref = row[index.REFDES]?.toUpperCase();
    if (!/^[A-Z]{1,3}\d+[A-Z]?\d*$/.test(ref || '')) throw new Error(`Row ${lineNumber + 2}: invalid REFDES.`);
    if (seen.has(ref)) throw new Error(`Row ${lineNumber + 2}: duplicate ${ref}.`);
    seen.add(ref);
    const numeric = value => Number(delimiter === ',' ? value : value?.replace(',', '.'));
    const x = numeric(row[index.SYM_X]);
    const y = numeric(row[index.SYM_Y]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || row[index.SYM_X] === '' || row[index.SYM_Y] === '') throw new Error(`Row ${lineNumber + 2}: invalid coordinates for ${ref}.`);
    const mirror = row[index.SYM_MIRROR]?.toUpperCase();
    if (!['TRUE', 'FALSE'].includes(mirror)) throw new Error(`Row ${lineNumber + 2}: SYM_MIRROR must be TRUE or FALSE for ${ref}.`);
    components.push({ ref, x, y, side: mirror === 'TRUE' ? 'bottom' : 'top' });
  }
  const byRef = new Map(components.map(component => [component.ref, component]));
  const missing = REQUIRED_REFS.filter(ref => !byRef.has(ref));
  if (missing.length) throw new Error(`Missing required Jasper V1 anchors: ${missing.join(', ')}.`);
  const distinctX = new Set(components.map(component => component.x));
  const distinctY = new Set(components.map(component => component.y));
  if (distinctX.size < 3 || distinctY.size < 3) throw new Error('Placement coordinates have insufficient spread.');
  return {
    schema: 1,
    board: 'jasper-v1',
    sourceBoard,
    units,
    status: 'placement-only; photo transform unverified',
    count: components.length,
    components,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  try {
    const args = process.argv.slice(2);
    const option = name => args[args.indexOf(name) + 1];
    const report = args.find(arg => !arg.startsWith('--') && !['mil', 'mm', 'Xbox_360_Jasper.brd'].includes(arg));
    if (!report) throw new Error('Usage: node tools/validate-jasper-placement.mjs report.csv --units mil|mm --source-board Xbox_360_Jasper.brd');
    const result = validatePlacement(fs.readFileSync(report, 'utf8'), {
      units: option('--units'), sourceBoard: option('--source-board'),
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Placement report rejected: ${error.message}`);
    process.exitCode = 1;
  }
}
