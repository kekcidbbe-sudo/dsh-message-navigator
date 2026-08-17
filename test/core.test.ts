import { describe, expect, it } from 'vitest'
import {
  chooseActiveIndex,
  compactPositions,
  isHumanMessageKind,
  markerWidth,
  shortenPreview,
} from '../src/core.ts'

describe('compactPositions', () => {
  it('keeps a short conversation in a Codex-style compact group', () => {
    expect(compactPositions(3, 720, 20, 7)).toEqual([340, 360, 380])
  })

  it('compresses all gaps equally only when the group would overflow', () => {
    const result = compactPositions(101, 100, 20)
    expect(result).toHaveLength(101)
    expect(result[0]).toBe(0)
    expect(result.at(-1)).toBe(100)
    expect((result[51] ?? 0) - (result[50] ?? 0)).toBe(1)
  })

  it('centers a single user turn', () => {
    expect(compactPositions(1, 100, 20, 8)).toEqual([50])
  })
})

describe('chooseActiveIndex', () => {
  it('prefers the visible row nearest the reading band', () => {
    const rows = [
      { top: -200, bottom: -100 },
      { top: 20, bottom: 100 },
      { top: 180, bottom: 300 },
      { top: 700, bottom: 800 },
    ]
    expect(chooseActiveIndex(rows, 0, 600)).toBe(2)
  })

  it('returns -1 for an empty conversation', () => {
    expect(chooseActiveIndex([], 0, 600)).toBe(-1)
  })
})

describe('content helpers', () => {
  it('counts ordinary and steering user messages, but not assistant output', () => {
    expect(isHumanMessageKind('user')).toBe(true)
    expect(isHumanMessageKind('steering')).toBe(true)
    expect(isHumanMessageKind('assistant-step')).toBe(false)
  })

  it('collapses whitespace and truncates previews', () => {
    expect(shortenPreview('  hello\n  world  ')).toBe('hello world')
    expect(shortenPreview('123456', 5)).toBe('1234…')
  })

  it('uses one width for inactive markers and emphasizes only the active one', () => {
    expect(markerWidth(false)).toBe(12)
    expect(markerWidth(true)).toBe(52)
  })
})
