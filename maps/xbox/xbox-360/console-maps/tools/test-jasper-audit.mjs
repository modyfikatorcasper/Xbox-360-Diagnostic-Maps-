import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'dist', 'assets', 'app.js'), 'utf8');
const sandbox = {
  console,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/assets/jasper-components.js'), 'utf8'), sandbox);
vm.runInContext(`${source}\n;globalThis.__jasper={B,RAIL_META,ERROR_SERVICE,SEQUENCE_JASPER,SYMPTOMS,state,jasperDiagSteps,PHOTO_CALIBRATION,JASPER_BOTTOM_VIEWS,JASPER_BOTTOM_VERIFIED,JASPER_TOP_VERIFIED,JASPER_CIRCUIT_GROUPS,jasperPhotoVerified,jasperPlacementState,isUnpopulatedInPhoto,componentStatus,componentMatchesType,jasperNeighborhood,jasperSearchTerms,regionViews,contextValue,railContext,errorContext,sequenceContext,jasperPhotoNotes,photoPosition,I18N};`, sandbox);

const { B, RAIL_META, ERROR_SERVICE, SEQUENCE_JASPER, SYMPTOMS, state, jasperDiagSteps, PHOTO_CALIBRATION, JASPER_BOTTOM_VIEWS, JASPER_BOTTOM_VERIFIED, JASPER_TOP_VERIFIED, JASPER_CIRCUIT_GROUPS, jasperPhotoVerified, jasperPlacementState, isUnpopulatedInPhoto, componentStatus, componentMatchesType, jasperNeighborhood, jasperSearchTerms, regionViews, contextValue, railContext, errorContext, sequenceContext, jasperPhotoNotes, photoPosition, I18N } = sandbox.__jasper;
const board = B.jasper;
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = value => typeof value === 'object' ? `${value.pl ?? ''} ${value.en ?? ''}` : String(value ?? '');
const regionIds = new Set(board.regions.map(region => region.id));

check(board.regions.length === 9, `expected 9 Jasper regions, found ${board.regions.length}`);
const expectedRefs = { cpu: 'U7D1', gpu: 'U4D1', southbridge: 'U2C1', hana: 'U4C2', nand: 'U2E1' };
for (const [id, ref] of Object.entries(expectedRefs)) {
  check(board.regions.find(region => region.id === id)?.ref === ref, `${id}: expected ${ref}`);
}
for (const region of board.regions) {
  check(region.views.length >= 1 && region.views.length <= 3, `${region.id}: expected 1–3 close-ups`);
  check(region.views.every(view => view.notes.every(note => note.length >= 5)), `${region.id}: malformed PCB note`);
}
check(board.regions.find(region => region.id === 'hana')?.markerX === 36, 'HANA overview marker must remain separate from standby');
check(board.regions.find(region => region.id === 'cpu')?.views.length === 3, 'CPU chip, CPUCORE and CPUVCS need separate readable close-ups');
check(board.regions.find(region => region.id === 'gpu')?.views.length === 2, 'GPU and GPUCORE need separate readable close-ups');
check(board.regions.find(region => region.id === 'southbridge')?.views.length === 3, 'SMC, RF input and PSU enable need separate readable close-ups');

check(board.rails.length === 11, `expected 11 Jasper rails, found ${board.rails.length}`);
for (const rail of board.rails) {
  const [, name, expected, sourceName, point, region] = rail;
  const meta = RAIL_META.jasper[name];
  check(Boolean(expected && sourceName && point), `${name}: incomplete measurement card`);
  check(regionIds.has(region), `${name}: invalid target region ${region}`);
  check(Boolean(meta?.condition && meta?.loads && meta?.missing), `${name}: incomplete metadata`);
  check(meta?.path?.every(id => regionIds.has(id)), `${name}: route references an unknown region`);
}
const railText = JSON.stringify(board.rails);
for (const token of ['FT8N1', 'FT5N1', 'FT5N2', 'L8E1 / L8F1', 'L6C1 / L7C1', 'L3F1 / FT2U1', 'L8F2 / FT7U3']) {
  check(railText.includes(token), `missing Jasper measurement point ${token}`);
}
const main3v3 = board.rails.find(rail => rail[1] === 'V_3P3');
check(main3v3?.[3].includes('U1F1') && main3v3?.[4] === 'FT1U1',
  'Jasper V_3P3 must originate at U1F1 and be checked at FT1U1 (schematic sheet 56)');
check(!JSON.stringify([board.rails, RAIL_META.jasper, SEQUENCE_JASPER]).includes('U6T2'),
  'Empty U6T2 2.9 V variant must not be presented as the V_3P3 regulator');
check(![board.rails, RAIL_META.jasper, ERROR_SERVICE.jasper, SEQUENCE_JASPER, board.regions.map(r => r.views)]
  .some(section => JSON.stringify(section).includes('L8D1')),
  'Unpopulated L8D1 must not be offered as a measurement point or photo marker');
const vcs = board.rails.find(rail => rail[1] === 'V_CPUVCS');
state.board = 'jasper';
state.lang = 'pl';
check(contextValue(vcs[2]) === 'zależne od CPU_SRVID', 'V_CPUVCS must render a Polish, non-object value');
check(contextValue(railContext(vcs, RAIL_META.jasper.V_CPUVCS).title).includes('zależne od CPU_SRVID'), 'V_CPUVCS context title must be localized');
check(contextValue('Power input') === 'Wejście zasilania', 'Jasper area names must be localized');
for (const [name, view] of [['V_CPUCORE', 1], ['V_CPUVCS', 2], ['V_GPUCORE', 1]]) {
  const rail = board.rails.find(item => item[1] === name);
  check(railContext(rail, RAIL_META.jasper[name]).view === view, `${name}: wrong rail close-up`);
}
check(errorContext('0031').view === 2, '0031 must open the 5 V regulator close-up');
check(sequenceContext(SEQUENCE_JASPER[4]).view === 2, 'boot stage 05 must open the auxiliary VRM close-up');
state.lang = 'en';
check(contextValue(vcs[2]) === 'CPU_SRVID-dependent', 'V_CPUVCS must render an English value');

const services = ERROR_SERVICE.jasper;
for (const code of ['0001', '0002', '0031', '0032', '0033']) {
  const service = services[code];
  check(Boolean(service), `${code}: missing Jasper service profile`);
  check(regionIds.has(service?.primary), `${code}: invalid primary region`);
  check(service?.secondary?.every(id => regionIds.has(id)), `${code}: invalid secondary region`);
  check(service?.steps?.length >= 2, `${code}: expected at least two checks`);
  check(service?.steps?.every(step => regionIds.has(step.area) && step.label && step.point && step.expected && step.condition), `${code}: incomplete service step`);
  const stepRefs=service?.steps.flatMap(step =>
    (text(step.point).match(/[A-Z]{1,3}\d+[A-Z]?\d*/g)||[])
      .map(ref => sandbox.window.MODI_JASPER_COMPONENT_DB.components.find(c => c.ref === ref))
      .filter(Boolean))||[];
  check(stepRefs.length > 0 && stepRefs.every(jasperPhotoVerified),
    `${code}: referenced physical component areas must be reviewed on their correct photo side (not pin-level certified)`);
}
check(!services['0010'], '0010 must stay generic until a Jasper service profile is verified');

check(SEQUENCE_JASPER.length === 10, `expected 10 Jasper sequence stages, found ${SEQUENCE_JASPER.length}`);
SEQUENCE_JASPER.forEach((stage, index) => {
  check(stage.n === String(index + 1).padStart(2, '0'), `sequence ${index + 1}: unexpected number`);
  check(regionIds.has(stage.region), `sequence ${stage.n}: invalid region ${stage.region}`);
  for (const field of ['title', 'rail', 'point', 'expected', 'condition', 'components', 'next']) {
    check(Boolean(text(stage[field]).trim()), `sequence ${stage.n}: missing ${field}`);
  }
});
check(SEQUENCE_JASPER[9].outcome === true, 'dashboard must be an outcome');
for (const stageNumber of [3, 4, 7, 8, 9]) {
  check(text(SEQUENCE_JASPER[stageNumber - 1].expected).includes('UNKNOWN'), `signal stage ${stageNumber} must preserve UNKNOWN`);
}

const minimum = { dead: 6, pulse: 6, off: 6, red: 3 };
for (const symptom of SYMPTOMS) {
  state.symptom = symptom.id;
  const steps = jasperDiagSteps();
  check(steps.length >= minimum[symptom.id], `${symptom.id}: path is too short`);
  steps.forEach((step, index) => {
    check(regionIds.has(step.region), `${symptom.id} step ${index + 1}: invalid region`);
    check(!text(step.where).includes('L8D1'), `${symptom.id} step ${index + 1}: empty L8D1 footprint offered as a measurement`);
    for (const field of ['q', 'help', 'meter', 'expect', 'where', 'condition', 'sourceNode', 'loads', 'no']) {
      check(Boolean(text(step[field]).trim()), `${symptom.id} step ${index + 1}: missing ${field}`);
    }
  });
}

check(fs.existsSync(path.join(root, 'dist', board.images.top)), `missing Jasper board asset ${board.images.top}`);
const db = sandbox.window.MODI_JASPER_COMPONENT_DB;
check(db.summary.total === 1952 && db.summary.top === 799 && db.summary.bottom === 1153, 'Jasper placement totals must match the source BRD');
check(db.sourceSha256 === '241869E262481208027F5FE8952D6D1AAEBCBEAD9E1E392EF5C144EA94977C7E', 'Jasper BRD hash mismatch');
check(db.schematicSourceSha256 === '11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E',
  'Jasper schematic PDF hash mismatch');
check(db.components.every(c => c.schematicGroup && c.schematicPage && c.schematicPages?.includes(c.schematicPage)),
  'All Jasper placements need a source-backed schematic group and page');
const railSheetRefs = [
  ['V_5P0STBY','J9A1',49,'FT8N1',49],
  ['V_3P3STBY','U5B1',56,'FT5N1',56],
  ['V_1P8STBY','U5B2',56,'FT5N2',56],
  ['V_12P0','J9A1',49,'FT9N1',49],
  ['V_5P0','U4V1',55,'FT6V1',55],
  ['V_3P3','U1F1',56,'FT1U1',56],
  ['V_CPUCORE','U8U1',51,'L8E1',52],
  ['V_GPUCORE','U8N1',53,'L6C1',54],
  ['V_CPUVCS','U7U2',57,'FT7U3',57],
  ['V_MEM','U4V1',55,'FT2U1',55],
  ['V_1P8','U2T1',54,'FT2R8',54],
];
for (const [name,sourceRef,sourceSheet,pointRef,pointSheet] of railSheetRefs) {
  const rail=board.rails.find(row=>row[1]===name);
  check(rail && text(rail[3]).includes(sourceRef) && text(rail[4]).includes(pointRef),
    `${name}: service rail source/point must match the reviewed schematic references`);
  check(db.components.find(c=>c.ref===sourceRef)?.schematicPages.includes(sourceSheet) &&
    db.components.find(c=>c.ref===pointRef)?.schematicPages.includes(pointSheet),
    `${name}: source/point sheet numbers must match the PDF component index`);
}
check(Object.keys(JASPER_CIRCUIT_GROUPS).length === 15 && db.components.every(c =>
  JASPER_CIRCUIT_GROUPS[c.schematicGroup]?.pl && JASPER_CIRCUIT_GROUPS[c.schematicGroup]?.en),
  'All fifteen schematic circuit groups need bilingual labels');
check(db.components.filter(c => c.valueStatus === 'schematic-unit-text').length === 1145,
  'Only unambiguous unit-bearing passive values may be imported from the schematic text');
for (const [ref, value] of [['C7T33','4.7UF'],['C5B7','100UF'],['L6C1','0.6UH'],['R7B2','2.2K']]) {
  check(db.components.find(c => c.ref === ref)?.value === value, `${ref}: schematic value mismatch`);
}
check(!db.components.find(c => c.ref === 'R8N1')?.value,
  'Bare resistor number R8N1 must remain UNKNOWN without independent validation');
check(db.components.find(c => c.ref === 'U8N1')?.schematicGroup === 'gpu_vrm' &&
  db.components.find(c => c.ref === 'U8N1')?.package === 'NCP5331_LQFP32',
  'GPU controller must have PDF-indexed part and circuit group');
check(db.components.find(c => c.ref === 'U4D1')?.package === 'NBY2_BGA' &&
  !JSON.stringify([board.regions.find(r => r.id === 'gpu'), board.ics.find(ic => ic[0] === 'U4D1')]).includes('Zeus'),
  'Jasper GPU identity must use the supplied schematic, not an unsupported codename');
for (const [ref, sheet] of [['R2T7',54],['R2T8',54],['U5C1',56],['U6T2',56]]) {
  const component = db.components.find(c => c.ref === ref);
  check(component?.schematicPage === sheet && component?.schematicPopulation === 'schematic-empty',
    `${ref}: rendered schematic sheet ${sheet} marks this option EMPTY`);
  check(component && (ref.startsWith('R') || ref === 'U5C1' ? jasperPhotoVerified(component) && isUnpopulatedInPhoto(component) : jasperPhotoVerified(component) && !isUnpopulatedInPhoto(component)),
    `${ref}: schematic population and photographic review must remain independent`);
}
check(I18N.pl.jasperSchematicEmpty.includes('UNVERIFIED') && I18N.en.jasperSchematicEmpty.includes('UNVERIFIED'),
  'The bilingual EMPTY label must keep physical/photo population unverified');
check(componentStatus(db.components.find(c => c.ref === 'U6T2')) === I18N[state.lang].jasperPopulationConflict,
  'U6T2 must be flagged as a schematic/photo variant conflict, not an empty installed location');
check(componentStatus(db.components.find(c => c.ref === 'U5C1')) === I18N[state.lang].footprintUnpopulated,
  'U5C1 must be labelled empty in the reviewed TOP photograph');
check(db.components.find(c => c.ref === 'FT2R8')?.schematicGroup === 'aux_power' &&
  db.components.find(c => c.ref === 'FT2R8')?.schematicPage === 54,
  'V_1P8 point on mixed GPU output sheet must not be misclassified as GPUCORE');
check(['SW1G1','SW2G2','SW2G4','SW2G5','SW5G1'].every(ref =>
  db.components.find(c => c.ref === ref)?.schematicPage === 43),
  'Five switches omitted from the PDF index must be resolved from sheet 43');
check(PHOTO_CALIBRATION.jasper.top?.landmarks === 8, 'Jasper TOP photo must use eight observed IC landmarks');
check(PHOTO_CALIBRATION.jasper.top?.rmsPx <= 6 && PHOTO_CALIBRATION.jasper.top?.maxPx <= 11, 'Jasper landmark fit exceeds guard');
check(PHOTO_CALIBRATION.jasper.bottom?.landmarks === 8, 'Jasper BOTTOM photo must use eight independently observed IC landmarks');
check(PHOTO_CALIBRATION.jasper.bottom?.rmsPx <= 9 && PHOTO_CALIBRATION.jasper.bottom?.maxPx <= 16, 'Jasper BOTTOM fit exceeds guard');
const outsidePhoto = db.components.filter(c => {
  const point = photoPosition(c, c.side);
  return point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100;
});
check(outsidePhoto.length === 0, `Jasper photo registration puts ${outsidePhoto.length} placements outside the photographs`);
check(outsidePhoto.every(c => !jasperPhotoVerified(c)), 'Out-of-photo Jasper placements must never receive a verified marker');
check(JASPER_TOP_VERIFIED.size === 22 && JASPER_BOTTOM_VERIFIED.size === 21,
  'Jasper photo-reviewed allowlists should contain 22 TOP and 21 BOTTOM references');
const placementStates = db.components.map(jasperPlacementState);
check(placementStates.filter(state => state === 'unverified').length === 1908,
  'All 1908 unreviewed Jasper BRD locations must be available as provisional, not verified, photo neighborhoods');
check(db.components.filter(c => c.side === 'top' && jasperPlacementState(c) === 'unverified').length === 776 &&
  db.components.filter(c => c.side === 'bottom' && jasperPlacementState(c) === 'unverified').length === 1132,
  'Provisional Jasper locations must retain their correct TOP/BOTTOM photo side');
check(placementStates.filter(state => state === 'unpopulated').length === 5,
  'Four empty footprints and alternative U1B1 must have no occupied-part marker');
check(placementStates.filter(state => state === 'verified').length === 39,
  'Only 39 photo-reviewed occupied locations should receive a solid component marker');
check(jasperPlacementState(db.components.find(c => c.ref === 'U1B1')) === 'unpopulated' &&
  jasperPlacementState(db.components.find(c => c.ref === 'U1B2')) === 'verified',
  'Ethernet PHY variant must reflect photographed ICS1893BF U1B2, not alternative BCM5241 U1B1');
check(db.components.find(c => c.ref === 'U6T2')?.schematicPopulation === 'schematic-empty' &&
  jasperPlacementState(db.components.find(c => c.ref === 'U6T2')) === 'verified',
  'Photographed U6T2 must retain the schematic/photo variant conflict instead of being hidden');
check(['U5B2','L6F1','L6C1','L7C1','L8F2','L3F1'].every(ref =>
  jasperPhotoVerified(db.components.find(c => c.ref === ref))),
  'Major TOP standby/memory/GPU/CPUVCS power parts must match their photo silkscreen');
check(jasperPhotoVerified(db.components.find(c => c.ref === 'J9A1')) &&
  jasperPhotoVerified(db.components.find(c => c.ref === 'U1F1')),
  'Silkscreen/footprint-checked TOP power connector and V_3P3 regulator must be photo targets');
for (const region of board.regions) {
  const marks = region.views.flatMap((view, index) => jasperPhotoNotes(region, view, index));
  check(marks.length > 0, `${region.id}: no reviewed TOP-side marks`);
  check(marks.every(mark => JASPER_TOP_VERIFIED.has(mark[0])), `${region.id}: unreviewed TOP placement labelled on photo`);
  check(marks.every(mark => db.components.find(c => c.ref === mark[0])?.side === 'top'), `${region.id}: bottom or unknown component marked on TOP`);
}
check(jasperPhotoNotes(board.regions.find(r => r.id === 'powerin'), board.regions.find(r => r.id === 'powerin').views[0], 0).some(mark => mark[0] === 'J9A1'),
  'Power-input close-up must label the photo-reviewed J9A1 connector without inventing a pin marker');
check(['U2T1','FT2R8','R2T7','R2T8'].every(ref => jasperPhotoVerified(db.components.find(c => c.ref === ref))),
  'V_1P8 regulator, point and empty option footprints must match the reviewed BOTTOM photograph');
check(componentStatus(db.components.find(c => c.ref === 'FT2R8')) === I18N[state.lang].jasperReviewed,
  'Photo-reviewed FT2R8 must no longer show UNVERIFIED');
check(['R2T7','R2T8'].every(ref => componentStatus(db.components.find(c => c.ref === ref)) === I18N[state.lang].footprintUnpopulated),
  'The two empty BOTTOM footprints must not be offered as populated components');
check(componentStatus(db.components.find(c => c.ref === 'U7D1')) === I18N[state.lang].jasperReviewed,
  'Reviewed Jasper component must show a distinct photo-checked status');
check(db.components.every(c => Boolean(jasperNeighborhood(c, db))),
  'Every Jasper placement must have a spatial neighborhood on its own PCB side');
check(jasperNeighborhood(db.components.find(c => c.ref === 'U7D1'), db) === 'cpu',
  'CPU reference should map to its own physical neighborhood');
check(jasperSearchTerms(db.components.find(c => c.ref === 'U8N1')).includes('ncp5331'),
  'Known Jasper IC part names must be searchable');
check(jasperSearchTerms(db.components.find(c => c.ref === 'U7D1')).includes('loki'),
  'Known Jasper chip names must be searchable');
const firstDiode = db.components.find(c => c.ref.startsWith('D'));
check(firstDiode && componentMatchesType(firstDiode, 'diode'),
  'Jasper diode references must be included by the diode type filter');
check(jasperPhotoNotes(board.regions.find(r => r.id === 'mainvrm'), board.regions.find(r => r.id === 'mainvrm').views[0], 0).every(mark => !['U8U1','FT7U3'].includes(mark[0])), 'Bottom controller or test point shown in main VRM crop');
state.side = 'bottom';
check(Object.keys(JASPER_BOTTOM_VIEWS).length === 6, 'Only six visually checked underside regions should be offered');
for (const region of board.regions) {
  const views = regionViews(region);
  if (!JASPER_BOTTOM_VIEWS[region.id]) { check(views.length === 0, `${region.id}: TOP-only area exposed on BOTTOM`); continue; }
  check(views.length > 0 && views.length <= 3, `${region.id}: underside closeup count invalid`);
  for (const [index, view] of views.entries()) {
    const marks = jasperPhotoNotes(region, view, index);
    check(marks.length > 0, `${region.id}/${index}: empty BOTTOM closeup`);
    for (const mark of marks) {
      const component = db.components.find(c => c.ref === mark[0]);
      check(component?.side === 'bottom' && JASPER_BOTTOM_VERIFIED.has(mark[0]), `${region.id}/${index}: unverified or TOP mark ${mark[0]}`);
      check(mark[2] >= 0 && mark[2] <= 100 && mark[3] >= 0 && mark[3] <= 100, `${region.id}/${index}: out-of-photo mark ${mark[0]}`);
    }
  }
}
check(I18N.pl.jasperPhotoCaution && I18N.en.jasperPhotoCaution && I18N.pl.jasperBottomCaution && I18N.en.jasperBottomCaution, 'Jasper photo-side cautions must be bilingual');
check(I18N.pl.jasperUnpopulated.includes('L8D1') && I18N.en.jasperUnpopulated.includes('L8D1'),
  'Unpopulated footprint caution must be bilingual');
check(source.includes('id="regionSelect"'), 'Board Map must offer a section selector independent of photo markers');
vm.runInContext(`{
  const elements = new Map();
  document.querySelector = selector => {
    if (!elements.has(selector)) elements.set(selector, { value: '', innerHTML: '', textContent: '', hidden: false, addEventListener() {}, querySelectorAll: () => [] });
    return elements.get(selector);
  };
  document.querySelectorAll = () => [];
  renderComponentProfile = () => {};
  state.board = 'jasper'; state.lang = 'pl'; state.componentPage = 0;
  elements.set('#componentSide', { value: 'all', hidden: true });
  elements.set('#componentArea', { value: '', hidden: true, innerHTML: '' });
  renderComponents();
  const all = { stats: elements.get('#componentStats').innerHTML, rows: (elements.get('#componentList').innerHTML.match(/class="component-row/g) || []).length, pager: elements.get('#componentPager').innerHTML };
  elements.get('#componentSearch').value = 'NCP5331'; state.componentPage = 0;
  renderComponents();
  const named = elements.get('#componentList').innerHTML;
  elements.get('#componentSearch').value = 'C7T33'; renderComponents();
  const passive = elements.get('#componentList').innerHTML;
  elements.get('#componentSearch').value = ''; elements.get('#componentSide').value = 'bottom';
  renderComponents();
  const bottom = elements.get('#componentStats').innerHTML;
  elements.get('#componentSide').value = 'all'; elements.get('#componentGroup').value = 'gpu_vrm';
  state.componentPage = 0; renderComponents();
  const gpuGroup = elements.get('#componentNote').textContent;
  elements.get('#componentGroup').value = ''; elements.get('#componentSearch').value = 'U6T2';
  renderComponents();
  const variant = elements.get('#componentList').innerHTML;
  globalThis.__searchAudit = { all, named, passive, bottom, gpuGroup, variant };
}`, sandbox);
const searchAudit = sandbox.__searchAudit;
check(searchAudit.all.stats.includes('1952/1952') && searchAudit.all.rows === 120 && searchAudit.all.pager.includes('17'),
  'Jasper search must expose all 1952 placements with working pagination');
check(searchAudit.named.includes('U8N1') && searchAudit.named.includes('BOTTOM'),
  'Known IC names must find their correct PCB side');
check(searchAudit.passive.includes('C7T33') && searchAudit.passive.includes('4.7UF'),
  'PDF-derived passive value must appear in the Jasper search result');
check(searchAudit.bottom.includes('1153/1952'),
  'BOTTOM search filter must expose all 1153 underside placements');
check(searchAudit.gpuGroup.includes('/ 68 '),
  'GPU VRM group filter must use the PDF-indexed circuit group, not nearest-photo coordinates');
check(searchAudit.variant.includes('U6T2') && searchAudit.variant.includes('value-badge conflict') &&
  searchAudit.variant.includes(I18N.pl.jasperPopulationConflict),
  'Search must display the populated U6T2/schematic EMPTY conflict as a warning');
vm.runInContext(`{
  updateSideUi = renderRegionMarkers = renderFocusedComponentDetail = renderDiagnosticContext =
    renderComponents = layoutPhoto = () => {};
  selectRegion = id => { state.region = id; state.componentFocus = null; state.fullBoardView = false; };
  document.querySelectorAll = () => [];
  state.board = 'jasper'; state.lang = 'pl';
  focusComponent('C1A2', null, false);
  const provisional = { ref: state.componentFocus?.ref, full: state.fullBoardView, title: document.querySelector('#closeupTitle').textContent, reason: state.diagnosticContext?.reason };
  focusComponent('R2T7', null, false);
  globalThis.__focusAudit = { provisional, empty: { ref: state.componentFocus?.ref, full: state.fullBoardView } };
}`, sandbox);
check(sandbox.__focusAudit.provisional.ref === 'C1A2' && !sandbox.__focusAudit.provisional.full &&
  sandbox.__focusAudit.provisional.title.includes('UNVERIFIED'),
  'Selecting an unreviewed Jasper part must open an individual provisional close-up');
check(sandbox.__focusAudit.empty.ref == null && sandbox.__focusAudit.empty.full,
  'Selecting a visibly empty Jasper footprint must never add a populated-part marker');

if (failures.length) {
  console.error(`FAIL Jasper audit (${failures.length})`);
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('PASS Jasper audit: 9 regions, 11 rails, 1952 BRD placements, separate TOP/BOTTOM registration, reviewed underside overlay, service profiles and symptom routes.');
