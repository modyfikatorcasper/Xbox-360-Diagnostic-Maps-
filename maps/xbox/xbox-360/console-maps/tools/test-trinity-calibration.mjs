import fs from 'node:fs';

const componentSource = fs.readFileSync(new URL('../dist/assets/trinity-components.js', import.meta.url), 'utf8');
const componentDb = JSON.parse(componentSource.slice(componentSource.indexOf('=') + 1, componentSource.lastIndexOf(';')));

const calibration = {
  top: {
    width: 2081,
    height: 2048,
    x: [0.009991163613849085, 0.0000069652290432115366, 10.459505646725349],
    y: [-0.000018625579684337077, -0.010194702706990562, 88.18513777888512],
    rmsLimit: 4,
    maxLimit: 5,
    expectedVisible: 955,
    expectedOutside: ['R1'],
    landmarks: [
      ['MTG1B1', -43, 5922, 209.1, 566.6],
      ['MTG1G1', -42.52, 331.496, 209.2, 1739.2],
      ['MTG7G1', 8067.496, 331, 1895, 1731],
      ['MTG4G1', 4192.914, -42.52, 1089, 1811],
      ['MTG4D1', 4604.897, 4263.78, 1175.1, 915.1],
      ['MTG6D1', 6967.102, 4263.779, 1668.1, 915],
      ['MTG4F1', 4604.897, 1901.574, 1176.9, 1409.5],
      ['MTG6F1', 6967.102, 1901.574, 1665, 1407]
    ]
  },
  bottom: {
    width: 1857,
    height: 2048,
    x: [-0.01153265258744556, -0.00002346913966080749, 96.2423678346921],
    y: [-0.000018308543285589342, -0.010658415585986644, 91.02023008922899],
    rmsLimit: 5,
    maxLimit: 10,
    expectedVisible: 1002,
    expectedOutside: [],
    landmarks: [
      ['MTG1B1', -43, 5922, 1794.5, 573.1],
      ['MTG1G1', -42.52, 331.496, 1796.7, 1790.2],
      ['MTG7G1', 8067.496, 331, 62.2, 1786.6],
      ['MTG4G1', 4192.914, -42.52, 887.1, 1878.4],
      ['MTG4D1', 4604.897, 4263.78, 799.5, 930.4],
      ['MTG6D1', 6967.102, 4263.779, 292.3, 932.1],
      ['MTG4F1', 4604.897, 1901.574, 800.3, 1439.4],
      ['MTG6F1', 6967.102, 1901.574, 293, 1449.7]
    ]
  }
};

function project(c, x, y) {
  return {
    xPct: c.x[0] * x + c.x[1] * y + c.x[2],
    yPct: c.y[0] * x + c.y[1] * y + c.y[2]
  };
}

let failed = false;
for (const [side, c] of Object.entries(calibration)) {
  const errors = c.landmarks.map(([, x, y, imageX, imageY]) => {
    const projected = project(c, x, y);
    return Math.hypot(projected.xPct / 100 * c.width - imageX, projected.yPct / 100 * c.height - imageY);
  });
  const rms = Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length);
  const max = Math.max(...errors);
  const sideComponents = componentDb.components.filter(component => component.side === side);
  const outside = sideComponents.filter(component => {
    const point = project(c, component.x, component.y);
    return point.xPct < 0 || point.xPct > 100 || point.yPct < 0 || point.yPct > 100;
  }).map(component => component.ref).sort();
  const visible = sideComponents.length - outside.length;
  const containmentPass = visible === c.expectedVisible && JSON.stringify(outside) === JSON.stringify(c.expectedOutside);
  const fitPass = rms <= c.rmsLimit && max <= c.maxLimit;
  failed ||= !fitPass || !containmentPass;
  console.log(JSON.stringify({side, landmarks:c.landmarks.length, rmsPx:+rms.toFixed(2), maxPx:+max.toFixed(2), visible, total:sideComponents.length, outside, fitPass, containmentPass}));
}

if (failed) process.exitCode = 1;
