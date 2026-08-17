import { chooseActiveIndex, isHumanMessageKind, shortenPreview } from '../core.ts'

export const FLOW_SELECTOR = '[data-chat-flow]'
export const COMPOSER_SELECTOR = '[data-composer-seat]'
const SCROLL_SELECTOR = '[data-conversation-scroll]'
export const ANCHOR_SELECTOR = '[data-chat-anchor-key]'

export interface NavigatorItem {
  readonly key: string
  readonly element: HTMLElement
  readonly preview: string
  readonly top: number
  readonly bottom: number
}

export interface NavigatorSnapshot {
  readonly scrollport: HTMLElement | null
  readonly items: readonly NavigatorItem[]
  readonly activeIndex: number
  readonly left: number
  readonly top: number
  readonly height: number
  readonly previewLeft: number
}

export const EMPTY: NavigatorSnapshot = {
  scrollport: null,
  items: [],
  activeIndex: -1,
  left: 0,
  top: 0,
  height: 0,
  previewLeft: 0,
}

const previewCache = new WeakMap<HTMLElement, string>()

function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
}

export function currentScrollport(): HTMLElement | null {
  const candidates = [...document.querySelectorAll<HTMLElement>(SCROLL_SELECTOR)]
  return candidates.find(element => isVisible(element) && element.querySelector(FLOW_SELECTOR) !== null) ?? null
}

function visibleText(row: HTMLElement): string {
  const cached = previewCache.get(row)
  if (cached !== undefined) return cached
  const text = row.innerText || row.textContent || ''
  const preview = shortenPreview(text) || '你的问题'
  previewCache.set(row, preview)
  return preview
}

/** Invalidates only rows touched by a stream/content mutation. */
export function invalidatePreviews(mutations: readonly MutationRecord[]): void {
  for (const mutation of mutations) {
    const target = mutation.target instanceof HTMLElement ? mutation.target : mutation.target.parentElement
    const row = target?.closest<HTMLElement>(ANCHOR_SELECTOR)
    if (row !== null && row !== undefined) previewCache.delete(row)
  }
}

export function buildSnapshot(scrollport: HTMLElement, railHeight: number): NavigatorSnapshot {
  const flow = scrollport.querySelector<HTMLElement>(FLOW_SELECTOR)
  const overlay = document.querySelector<HTMLElement>('[data-shell-overlay]')
  if (flow === null || overlay === null) return EMPTY

  const viewport = scrollport.getBoundingClientRect()
  if (viewport.width < 600) return EMPTY
  const overlayRect = overlay.getBoundingClientRect()
  const composer = scrollport.querySelector<HTMLElement>(COMPOSER_SELECTOR)
  const visibleBottom = composer?.getBoundingClientRect().top ?? viewport.bottom
  const seenKeys = new Set<string>()
  const rows = [...flow.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR)].filter((element) => {
    if (!isVisible(element)) return false
    if (!isHumanMessageKind(element.dataset.chatFlowKind)) return false
    const parentHumanRow = element.parentElement?.closest<HTMLElement>(ANCHOR_SELECTOR)
    if (parentHumanRow !== null && parentHumanRow !== undefined && flow.contains(parentHumanRow)
      && isHumanMessageKind(parentHumanRow.dataset.chatFlowKind)) return false
    const key = element.dataset.chatAnchorKey?.trim()
    if (key === undefined || key === '') return true
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
  const items = rows.map((element, index): NavigatorItem => {
    const rect = element.getBoundingClientRect()
    const anchorKey = element.dataset.chatAnchorKey?.trim()
    return {
      key: anchorKey === undefined || anchorKey === '' ? `user-message-${index + 1}` : anchorKey,
      element,
      preview: visibleText(element),
      top: rect.top,
      bottom: rect.bottom,
    }
  })
  const activeIndex = chooseActiveIndex(items, viewport.top, visibleBottom)
  const desiredHeight = Math.max(80, Math.min(720, viewport.height - 96))
  const height = railHeight > 0 ? Math.min(railHeight, desiredHeight) : desiredHeight
  const top = viewport.top - overlayRect.top + Math.max(48, (viewport.height - height) / 2)
  const left = viewport.left - overlayRect.left + 24

  return {
    scrollport,
    items,
    activeIndex,
    left,
    top,
    height,
    previewLeft: overlayRect.left + left + 76,
  }
}

export function sameSnapshot(left: NavigatorSnapshot, right: NavigatorSnapshot): boolean {
  if (left.scrollport !== right.scrollport || left.activeIndex !== right.activeIndex || left.items.length !== right.items.length) return false
  if (Math.abs(left.left - right.left) > .5 || Math.abs(left.top - right.top) > .5 || Math.abs(left.height - right.height) > .5) return false
  return left.items.every((item, index) => {
    const other = right.items[index]
    return other !== undefined
      && item.key === other.key
      && item.preview === other.preview
      && Math.abs(item.top - other.top) < .5
      && Math.abs(item.bottom - other.bottom) < .5
  })
}
