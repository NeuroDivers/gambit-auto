
export function getLocalArea(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number[] {
  const area = []
  const radius = 2
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = Math.min(Math.max(x + dx, 0), width - 1)
      const ny = Math.min(Math.max(y + dy, 0), height - 1)
      const idx = (ny * width + nx) * 4
      area.push(data[idx])
    }
  }
  return area
}

export function getLocalContrast(area: number[]): number {
  const min = Math.min(...area)
  const max = Math.max(...area)
  return (max - min) / 255
}
