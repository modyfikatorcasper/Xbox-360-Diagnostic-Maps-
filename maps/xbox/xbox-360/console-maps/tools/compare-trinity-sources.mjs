import fs from 'node:fs';

const [componentDbPath, brdPartsPath] = process.argv.slice(2);
if (!componentDbPath || !brdPartsPath) {
  throw new Error('Usage: node tools/compare-trinity-sources.mjs <component-db.js> <brd-parts.json>');
}

const js = fs.readFileSync(componentDbPath, 'utf8');
const cad = JSON.parse(js.replace(/^window\.MODI_COMPONENT_DB\s*=\s*/, '').replace(/;\s*$/, '')).components;
const brd = JSON.parse(fs.readFileSync(brdPartsPath, 'utf8')).filter((p) => /^[A-Z]+\d+/i.test(p.name));
const cadByRef = new Map(cad.map((p) => [p.ref, p]));
const brdByRef = new Map(brd.map((p) => [p.name, p]));
const onlyCad = cad.filter((p) => !brdByRef.has(p.ref)).map((p) => p.ref);
const onlyBrd = brd.filter((p) => !cadByRef.has(p.name)).map((p) => p.name);
const shared = cad.filter((p) => brdByRef.has(p.ref));
const coordinateDiffs = shared.map((p) => {
  const q = brdByRef.get(p.ref);
  return { ref: p.ref, dx: q.x - p.x, dy: q.y - p.y, distance: Math.hypot(q.x - p.x, q.y - p.y), cadSide: p.side, brdSide: q.side };
});
const sideMismatches = coordinateDiffs.filter((x) => x.cadSide !== x.brdSide);
const displaced = coordinateDiffs.filter((x) => x.distance > 0.01);
const maxDistance = Math.max(...coordinateDiffs.map((x) => x.distance));
console.log(JSON.stringify({
  cadTotal: cad.length,
  brdValidRefdes: brd.length,
  cadUnique: cadByRef.size,
  brdUnique: brdByRef.size,
  shared: shared.length,
  onlyCad,
  onlyBrd,
  sideMismatchCount: sideMismatches.length,
  sideMismatchSample: sideMismatches.slice(0, 30),
  displacedCount: displaced.length,
  maxDistance,
  displacedSample: displaced.sort((a, b) => b.distance - a.distance).slice(0, 30),
}, null, 2));
