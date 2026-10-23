import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estimatePrint, fitsBuildVolume, measureMeshVolumeMm3 } from '../custom-print/calculator-core.js';
const config = JSON.parse(readFileSync(new URL('../assets/print-estimator-config.json', import.meta.url), 'utf8'));
const enPage = readFileSync(new URL('../custom-print/index.html', import.meta.url), 'utf8');
const arPage = readFileSync(new URL('../ar/custom-print/index.html', import.meta.url), 'utf8');

const triangles = [
  0,0,0, 0,10,0, 10,0,0,
  0,0,0, 10,0,0, 0,0,10,
  0,0,0, 0,0,10, 0,10,0,
  10,0,0, 0,10,0, 0,0,10
];
const attr = { count: triangles.length / 3, getX: i => triangles[i * 3], getY: i => triangles[i * 3 + 1], getZ: i => triangles[i * 3 + 2] };
assert.ok(Math.abs(measureMeshVolumeMm3(attr) - (1000 / 6)) < 1e-9, 'tetrahedron mesh volume');
assert.ok(Math.abs(measureMeshVolumeMm3(attr, 10) - (1000000 / 6)) < 1e-6, 'centimeter scaling');
assert.throws(() => measureMeshVolumeMm3({ ...attr, count: 4 }), /Invalid triangle/);
assert.equal(fitsBuildVolume({ x: 250, y: 250, z: 250 }, { x: 256, y: 256, z: 256 }), true);
assert.equal(fitsBuildVolume({ x: 257, y: 250, z: 250 }, { x: 256, y: 256, z: 256 }), false);
const estimate = estimatePrint({ volumeCm3: 10, densityGPerCm3: 1.24, infillPercent: 20, shellAllowance: .18, supportAllowance: 1.1, flowMm3PerSecond: 8, filamentEgpPerGram: 2.5, machineEgpPerHour: 30, setupFeeEgp: 10 });
assert.ok(estimate.grams > 0 && estimate.hours > 0 && estimate.total >= 10, 'transparent estimate fields');
assert.throws(() => estimatePrint({ volumeCm3: -1 }), /finite numbers|outside valid/);
assert.deepEqual(config.buildVolumeMm, { x: 256, y: 256, z: 256 });
assert.equal(config.pricing.filamentEgpPerGram, 2.5);
assert.equal(config.pricing.machineEgpPerHour, 30);
assert.equal(config.pricing.setupFeeEgp, 10);
assert.ok(enPage.includes('canonical" href="https://www.printfy3d-eg.com/custom-print/'));
assert.ok(enPage.includes('hreflang="ar-EG"'));
assert.ok(arPage.includes('<html lang="ar" dir="rtl">'));
assert.ok(arPage.includes('https://www.printfy3d-eg.com/ar/custom-print/'));
assert.ok(enPage.includes('/custom-print/calculator.js') && arPage.includes('/custom-print/calculator.js'));
assert.ok(!enPage.includes('href="#"') && !arPage.includes('href="#"'));
console.log('STL estimator core checks passed.');

