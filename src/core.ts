export interface GeometryRow {
  readonly top: number
  readonly bottom: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Keeps short conversations compact and compresses only when the rail fills. */
export function compactPositions(count: number, height: number, preferredGap = 20, edgeInset = 0): number[] {
  if (count <= 0 || height <= 0) return []
  if (count === 1) return [height / 2]

  const inset = clamp(edgeInset, 0, height / 2)
  const usableHeight = height - inset * 2
  const gap = Math.min(preferredGap, usableHeight / (count - 1))
  const start = (height - gap * (count - 1)) / 2
  return Array.from({ length: count }, (_, index) => start + gap * index)
}

export function isHumanMessageKind(value: string | undefined): boolean {
  return value === 'user' || value === 'steering'
}

/** Picks the message nearest the upper reading band, preferring visible rows. */
export function chooseActiveIndex(rows: readonly GeometryRow[], viewportTop: number, viewportBottom: number): number {
  if (rows.length === 0) return -1
  const readingLine = viewportTop + Math.min(220, Math.max(56, (viewportBottom - viewportTop) * 0.3))
  const visible = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.bottom > viewportTop && row.top < viewportBottom)
  const candidates = visible.length > 0 ? visible : rows.map((row, index) => ({ row, index }))

  let winner = candidates[0]?.index ?? 0
  let distance = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    const rowCenter = (candidate.row.top + candidate.row.bottom) / 2
    const nextDistance = Math.abs(rowCenter - readingLine)
    if (nextDistance < distance) {
      winner = candidate.index
      distance = nextDistance
    }
  }
  return winner
}

export function markerWidth(active: boolean): number {
  return active ? 52 : 12
}

export function shortenPreview(value: string, limit = 220): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`
}
