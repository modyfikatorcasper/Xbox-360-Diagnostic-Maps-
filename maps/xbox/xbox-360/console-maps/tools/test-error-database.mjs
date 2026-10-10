import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../dist/assets/app.js', import.meta.url), 'utf8');

function readConst(name, nextName) {
  const prefix = `const ${name}=`;
  const start = source.indexOf(prefix);
  const end = source.indexOf(`\n\nconst ${nextName}=`, start);
  if (start < 0 || end < 0) throw new Error(`Cannot locate ${name}`);
  const block = source.slice(start + prefix.length, end);
  const extension = block.indexOf(`\n\n${name}.`);
  const literal = (extension >= 0 ? block.slice(0, extension) : block).replace(/;\s*$/, '');
  return vm.runInNewContext(`(${literal})`);
}

const errors = readConst('ERRORS', 'ERROR_SERVICE');
const services = readConst('ERROR_SERVICE', 'SEQUENCE_TRINITY').trinity;
const trinityCodes = errors.filter(item => item.boards.includes('trinity')).map(item => item.code);
const expectedCodes = ['0001','0002','0003','0010','0011','0012','0013','0020','0021','0022','0023','0030','0031','0032','0033'];
const areas = new Set(['powerin','standby','southbridge','hana','nand','mainvrm','xcgpu','memory']);

if (JSON.stringify(trinityCodes) !== JSON.stringify(expectedCodes)) {
  throw new Error(`Unexpected Trinity SMC code set: ${trinityCodes.join(', ')}`);
}

for (const code of expectedCodes) {
  const item = errors.find(error => error.code === code);
  const service = services[code];
  if (!item || !service) throw new Error(`Missing record or Trinity service profile for ${code}`);
  if (service.confidence !== 'community') throw new Error(`Unexpected confidence for ${code}`);
  if (!areas.has(service.primary)) throw new Error(`Invalid primary area for ${code}`);
  if (!service.rail || !Array.isArray(service.components) || service.components.length === 0) throw new Error(`Missing rail/components for ${code}`);
  if (!service.causes?.pl?.length || !service.causes?.en?.length) throw new Error(`Missing bilingual causes for ${code}`);
  if (!Array.isArray(service.steps) || service.steps.length < 2) throw new Error(`Insufficient check sequence for ${code}`);
  for (const [index, step] of service.steps.entries()) {
    if (!areas.has(step.area) || !step.label || !step.point || !step.expected || !step.condition) {
      throw new Error(`Incomplete step ${index + 1} for ${code}`);
    }
  }
}

const voltageExpectations = {
  '0001': '12 V',
  '0002': '0.9–1.2 V',
  '0003': '3.3 V',
  '0023': '1.075 V',
  '0031': '5.09 V',
  '0032': '1.25–1.3 V',
  '0033': '1.8 V'
};

for (const [code, expected] of Object.entries(voltageExpectations)) {
  const serialized = JSON.stringify(services[code]);
  if (!serialized.includes(expected)) throw new Error(`${code} does not contain ${expected}`);
}

if (!source.includes("<h3>UNKNOWN</h3>") || !source.includes("if(!item)")) {
  throw new Error('UNKNOWN fallback is missing');
}

console.log(JSON.stringify({
  trinitySmcCodes: trinityCodes.length,
  serviceProfiles: Object.keys(services).length,
  bilingual: true,
  unknownFallback: true
}));
