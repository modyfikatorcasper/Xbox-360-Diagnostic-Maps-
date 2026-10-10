import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = {
  console,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/assets/trinity-components.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/assets/jasper-components.js'), 'utf8'), sandbox);
vm.runInContext(`${fs.readFileSync(path.join(root, 'dist/assets/app.js'), 'utf8')}
;globalThis.__closeups={B,state,findComponent,photoPosition,regionMarkerPoint,railPoint,jasperPhotoNotes,regionViews,I18N};`, sandbox);

const { B, state, findComponent, photoPosition, regionMarkerPoint, railPoint, jasperPhotoNotes, regionViews, I18N } = sandbox.__closeups;
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const viewport = { width: 313, height: 440 }; // 390 px phone, measured Board Map photo area

function imageSize(file) {
  const png = fs.readFileSync(path.join(root, 'dist', file));
  check(png.subarray(1, 4).toString() === 'PNG', `${file}: expected PNG`);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

let checkedViews = 0;
for (const boardId of ['jasper', 'trinity']) {
  state.board = boardId;
  const board = B[boardId];
  for (const side of Object.keys(board.images)) {
    state.side = side;
    const image = imageSize(board.images[side]);
    const base = Math.max(viewport.width / image.width, viewport.height / image.height);
    for (const region of board.regions) {
      const views = regionViews(region);
      check(views.length <= 3, `${boardId}/${side}/${region.id}: too many close-ups`);
      views.forEach((view, index) => {
        const notes = boardId === 'jasper' ? jasperPhotoNotes(region, view, index) : view.notes;
        const points = notes.map(note => {
          if (boardId === 'jasper') return { name: note[0], x: note[2], y: note[3] };
          const component = findComponent(note[0]);
          const position = photoPosition(component);
          return position
            ? { name: note[0], ...position }
            : { name: note[0], x: side === 'bottom' ? 100 - note[2] : note[2], y: note[3] };
        });
        const center = points.length && (boardId === 'jasper' || side === 'bottom' && boardId === 'trinity')
          ? {
              x: (Math.min(...points.map(point => point.x)) + Math.max(...points.map(point => point.x))) / 2,
              y: (Math.min(...points.map(point => point.y)) + Math.max(...points.map(point => point.y))) / 2,
            }
          : view;
        const scaledWidth = image.width * base * view.z;
        const scaledHeight = image.height * base * view.z;
        for (const point of points) {
          const screenX = viewport.width / 2 + (point.x - center.x) / 100 * scaledWidth;
          const screenY = viewport.height / 2 + (point.y - center.y) / 100 * scaledHeight;
          check(screenX >= 0 && screenX <= viewport.width && screenY >= 0 && screenY <= viewport.height,
            `${boardId}/${side}/${region.id}/${index}: ${point.name} dot falls outside the phone close-up`);
        }
        checkedViews++;
      });
    }
  }
}
check(Boolean(I18N.pl.bottomProjection && I18N.en.bottomProjection), 'BOTTOM projection warning must be bilingual');

state.board = 'trinity';
state.side = 'top';
const trinity = B.trinity;
const db = sandbox.window.MODI_COMPONENT_DB.components;
for (const region of trinity.regions.filter(item => item.markerRef)) {
  const anchor = db.find(component => component.ref === region.markerRef);
  check(anchor?.side === 'top', `${region.id}: marker anchor must exist on TOP`);
  check(region.views[0].notes.some(note => note[0] === region.markerRef),
    `${region.id}: overview marker must point into its initial close-up`);
  const marker = regionMarkerPoint(region);
  const trace = railPoint(region.id);
  check(Math.abs(marker.x - trace.x) < 0.001 && Math.abs(marker.y - trace.y) < 0.001,
    `${region.id}: rail route and overview marker must use the same anchor`);
}
const standby = trinity.regions.find(region => region.id === 'standby');
check(['U5A1', 'U5B1'].every(ref => standby.views[0].notes.some(note => note[0] === ref)),
  'Trinity standby must label both regulators separately');
const memory = trinity.regions.find(region => region.id === 'memory');
check(memory.views.length === 2, 'Trinity RAM should use two logical close-ups');
check(['U5F1', 'U6F1', 'U7D1', 'U7E1'].every(ref =>
  db.some(component => component.ref === ref && component.side === 'top') &&
  memory.views.some(view => view.notes.some(note => note[0] === ref))),
  'Trinity RAM must label four confirmed TOP-side devices');

if (failures.length) {
  console.error(`FAIL photo close-ups (${failures.length})`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`PASS photo close-ups: ${checkedViews} Jasper/Trinity TOP/BOTTOM views; all coordinate dots inside a 390 px phone viewport.`);
