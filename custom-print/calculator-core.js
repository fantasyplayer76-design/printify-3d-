export function measureMeshVolumeMm3(position, scale = 1) {
  if (!position || !Number.isInteger(position.count) || position.count < 3 || position.count % 3 !== 0 || !Number.isFinite(scale) || scale <= 0) {
    throw new TypeError('Invalid triangle positions or unit scale');
  }
  let sixTimesVolume = 0;
  for (let i = 0; i < position.count; i += 3) {
    const ax = position.getX(i) * scale, ay = position.getY(i) * scale, az = position.getZ(i) * scale;
    const bx = position.getX(i + 1) * scale, by = position.getY(i + 1) * scale, bz = position.getZ(i + 1) * scale;
    const cx = position.getX(i + 2) * scale, cy = position.getY(i + 2) * scale, cz = position.getZ(i + 2) * scale;
    if (![ax, ay, az, bx, by, bz, cx, cy, cz].every(Number.isFinite)) throw new TypeError('Mesh contains invalid coordinates');
    sixTimesVolume += ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx);
  }
  const volume = Math.abs(sixTimesVolume / 6);
  if (!Number.isFinite(volume)) throw new RangeError('Mesh volume is not finite');
  return volume;
}

export function estimatePrint({ volumeCm3, densityGPerCm3, infillPercent, shellAllowance, supportAllowance, flowMm3PerSecond, filamentEgpPerGram, machineEgpPerHour, setupFeeEgp }) {
  const numbers = [volumeCm3, densityGPerCm3, infillPercent, shellAllowance, supportAllowance, flowMm3PerSecond, filamentEgpPerGram, machineEgpPerHour, setupFeeEgp].map(Number);
  if (!numbers.every(Number.isFinite)) throw new TypeError('Estimate settings must be finite numbers');
  const [volume, density, infill, shell, support, flow, perGram, perHour, setup] = numbers;
  if (volume <= 0 || density <= 0 || infill < 0 || infill > 100 || shell < 0 || shell > 1 || support < 1 || flow <= 0 || perGram < 0 || perHour < 0 || setup < 0) {
    throw new RangeError('Estimate settings are outside valid ranges');
  }
  const materialFraction = shell + (1 - shell) * infill / 100;
  const grams = volume * density * materialFraction * support;
  const depositedMm3 = grams / density * 1000;
  const hours = depositedMm3 / flow / 3600;
  const filamentCharge = grams * perGram;
  const machineCharge = hours * perHour;
  return { grams, hours, filamentCharge, machineCharge, setupFee: setup, total: Math.ceil(filamentCharge + machineCharge + setup) };
}

export function fitsBuildVolume(dimensionsMm, buildVolumeMm) {
  return ['x', 'y', 'z'].every(axis => Number.isFinite(dimensionsMm[axis]) && Number.isFinite(buildVolumeMm[axis]) && dimensionsMm[axis] > 0 && dimensionsMm[axis] <= buildVolumeMm[axis]);
}

