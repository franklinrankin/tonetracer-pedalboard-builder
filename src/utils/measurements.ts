// Measurement conversion utilities

const MM_PER_INCH = 25.4;

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function formatInches(mm: number, decimals: number = 1): string {
  return mmToInches(mm).toFixed(decimals);
}

export function formatDimensions(widthMm: number, depthMm: number): string {
  return `${formatInches(widthMm)}" × ${formatInches(depthMm)}"`;
}

export function formatArea(areaMmSq: number): string {
  // Convert mm² to in²
  const areaInSq = areaMmSq / (MM_PER_INCH * MM_PER_INCH);
  return areaInSq.toFixed(1);
}

export function formatSingleDimension(mm: number): string {
  return `${formatInches(mm)}"`;
}

