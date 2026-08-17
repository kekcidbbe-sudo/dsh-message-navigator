import type { SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
import { ANCHOR_SELECTOR, currentScrollport, FLOW_SELECTOR } from './dom.ts'

interface ScrollAnchor {
  readonly scrollport: HTMLElement
  readonly key: string
  readonly viewportTop: number
}

function nextPaint(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
  })
}

function captureScrollAnchor(): ScrollAnchor | null {
  const scrollport = currentScrollport()
  if (scrollport === null) return null
  const flow = scrollport.querySelector<HTMLElement>(FLOW_SELECTOR)
  if (flow === null) return null

  const viewport = scrollport.getBoundingClientRect()
  const rows = [...flow.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR)]
  const row = rows.find((candidate) => {
    const rect = candidate.getBoundingClientRect()
    return rect.bottom > viewport.top && rect.top < viewport.bottom
  }) ?? rows[0]
  const key = row?.dataset.chatAnchorKey
  if (row === undefined || key === undefined) return null
  return { scrollport, key, viewportTop: row.getBoundingClientRect().top }
}

function restoreScrollAnchor(anchor: ScrollAnchor | null): void {
  if (anchor === null || !anchor.scrollport.isConnected) return
  const rows = anchor.scrollport.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR)
  const row = [...rows].find(candidate => candidate.dataset.chatAnchorKey === anchor.key)
  if (row === undefined) return
  const delta = row.getBoundingClientRect().top - anchor.viewportTop
  if (Math.abs(delta) > .5) anchor.scrollport.scrollTop += delta
}

/** Loads the complete transcript so every human turn can be counted and jumped to. */
export async function loadCompleteHistory(session: SessionFace, isCancelled: () => boolean): Promise<void> {
  let attempts = 0
  let stagnantPages = 0

  while (!isCancelled() && attempts < 100) {
    const before = session.getSnapshot()
    if (before.openState !== 'open' || !before.hasMore) return
    if (before.loadingOlder) {
      await nextPaint()
      continue
    }

    const firstKey = before.chat.order[0]
    const anchor = captureScrollAnchor()
    await session.loadOlder()
    attempts += 1
    await nextPaint()
    if (isCancelled()) return
    restoreScrollAnchor(anchor)

    const after = session.getSnapshot()
    const progressed = after.chat.order[0] !== firstKey || !after.hasMore
    stagnantPages = progressed ? 0 : stagnantPages + 1
    if (after.openError !== null || stagnantPages >= 3) return
  }
}
