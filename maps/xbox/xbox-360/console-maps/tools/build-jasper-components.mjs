import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJasperPlacement } from './extract-jasper-placement.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) {
  console.error('Usage: node tools/build-jasper-components.mjs Xbox_360_Jasper.brd');
  process.exit(1);
}

const placement = extractJasperPlacement(fs.readFileSync(source));
const schematic=JSON.parse(fs.readFileSync(path.join(root,'tools/data/jasper-schematic-index.json'),'utf8'));
if(schematic.sourceSha256!=='11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E'||Object.keys(schematic.components).length!==1952){
  throw new Error('Jasper V1 schematic index is missing or does not match the reviewed PDF.');
}
const byRef = new Map(placement.components.map(c => [c.ref, c]));
// Hand-picked package centers on the 1390 × 1200 inspection copy of the
// existing 2373 × 2048 photo. These are approximate pixel observations, not
// pin-level measurements or a proof of retail/BRD identity for every part.
const previewSize = { width: 1390, height: 1200 };
const photoSize = { width: 2373, height: 2048 };
const landmarks = [
  ['U4D1', 577, 625], ['U7D1', 909, 625], ['U2C1', 250, 410],
  ['U2E1', 211, 652], ['U3D1', 371, 568], ['U3E1', 371, 684],
  ['U4C2', 533, 345], ['U5B1', 681, 266],
].map(([ref, x, y]) => {
  const component = byRef.get(ref);
  if (!component || component.side !== 'top') throw new Error(`Missing TOP landmark ${ref}.`);
  return { ref, board: [component.x, component.y, 1], photo: [x, y] };
});

function solve(matrix, vector) {
  for (let i = 0; i < 3; i++) {
    let pivot = i;
    for (let j = i + 1; j < 3; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivot][i])) pivot = j;
    }
    [matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]];
    [vector[i], vector[pivot]] = [vector[pivot], vector[i]];
    const scale = matrix[i][i];
    if (Math.abs(scale) < 1e-9) throw new Error('Degenerate photo landmarks.');
    for (let k = i; k < 3; k++) matrix[i][k] /= scale;
    vector[i] /= scale;
    for (let j = 0; j < 3; j++) {
      if (j === i) continue;
      const factor = matrix[j][i];
      for (let k = i; k < 3; k++) matrix[j][k] -= factor * matrix[i][k];
      vector[j] -= factor * vector[i];
    }
  }
  return vector;
}

function calibratePhoto(points, imageSize, observationSize, limit) {
  const normal = [0, 1, 2].map(i => [0, 1, 2].map(j =>
    points.reduce((sum, p) => sum + p.board[i] * p.board[j], 0)));
  const fit = [0, 1].map(axis => solve(normal.map(row => row.slice()),
    [0, 1, 2].map(i => points.reduce((sum, p) => sum + p.board[i] * p.photo[axis], 0))));
  const errors = points.map(p => Math.hypot(...p.photo.map((target, axis) =>
    fit[axis].reduce((sum, coefficient, index) => sum + coefficient * p.board[index], 0) - target)));
  const rmsPx = Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length) * imageSize.width / observationSize.width;
  const maxPx = Math.max(...errors) * imageSize.width / observationSize.width;
  if (rmsPx > limit.rms || maxPx > limit.max) throw new Error('Photo fit exceeds the landmark residual guard.');
  return {
    width: imageSize.width,
    height: imageSize.height,
    landmarks: points.length,
    landmarkRefs: points.map(p => p.ref),
    rmsPx: Math.round(rmsPx * 10) / 10,
    maxPx: Math.round(maxPx * 10) / 10,
    x: fit[0].map(value => value * 100 / observationSize.width),
    y: fit[1].map(value => value * 100 / observationSize.height),
    method: 'manual-IC-centers',
  };
}
const photoCalibration = calibratePhoto(landmarks, photoSize, previewSize, { rms: 12, max: 21 });
// Independent IC centers observed on the 2494 x 2048 Jasper V1 underside photo.
// Only independently reviewed underside refs are exposed in side-specific UI
// closeups; this fit does not certify the remaining BRD placements or pins.
const bottomPhotoSize = { width: 2494, height: 2048 };
const bottomLandmarks = [
  ['U8N1', 391, 566], ['U8U1', 439, 1608], ['U7U2', 597, 1633],
  ['U4V1', 1610, 1707], ['U3R1', 1851, 1001], ['U3T1', 1851, 1231],
  ['U4U1', 1570, 1515], ['U5U1', 1340, 1515],
].map(([ref, x, y]) => {
  const component = byRef.get(ref);
  if (!component || component.side !== 'bottom') throw new Error(`Missing BOTTOM landmark ${ref}.`);
  return { ref, board: [component.x, component.y, 1], photo: [x, y] };
});
const bottomPhotoCalibration = calibratePhoto(bottomLandmarks, bottomPhotoSize, bottomPhotoSize, { rms: 9, max: 16 });

function componentType(ref) {
  const prefix = ref.match(/^[A-Z]+/)[0];
  return ({ U: 'integrated-circuit', R: 'resistor', C: 'capacitor',
    L: 'inductor', FB: 'inductor', Q: 'transistor', D: 'diode',
    J: 'connector', FT: 'test-point', TP: 'test-point' })[prefix] || 'other';
}
const db = {
  schemaVersion: 1,
  board: 'xbox-360-fat',
  revision: 'jasper-v1',
  label: 'Jasper V1',
  sourceFormat: 'Allegro 15 binary placement records',
  sourceSha256: placement.sha256,
  units: 'mil',
  summary: placement.summary,
  photoCalibration,
  bottomPhotoCalibration,
  schematicSourceSha256: schematic.sourceSha256,
  components: placement.components.map(c => {
    const record=schematic.components[c.ref];
    if(!record)throw new Error(`Missing Jasper schematic index record ${c.ref}`);
    return {...c,type:componentType(c.ref),value:record.value||'',device:c.ref.startsWith('U')?record.package.replace(/_[^_]+$/,''):'',
      package:record.package,function:'',schematicGroup:record.group,schematicPage:record.primaryPage,
      schematicPages:record.pages,schematicTitle:record.sheetTitle||'',
      schematicIndexStatus:record.indexStatus||'pdf-component-index',
      schematicPopulation:record.populationStatus||'unknown',
      positionConfidence:'BRD placement; photo registration approximate',valueStatus:record.valueStatus||'unknown'};
  }),
};
const out = path.join(root, 'dist/assets/jasper-components.js');
fs.writeFileSync(out, `window.MODI_JASPER_COMPONENT_DB = ${JSON.stringify(db)};\n`);
console.log(JSON.stringify({ file: out, summary: db.summary, photoCalibration, bottomPhotoCalibration }, null, 2));
