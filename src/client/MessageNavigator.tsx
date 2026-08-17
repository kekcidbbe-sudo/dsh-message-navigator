import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
import { compactPositions, markerWidth } from '../core.ts'
import {
  buildSnapshot,
  COMPOSER_SELECTOR,
  currentScrollport,
  EMPTY,
  FLOW_SELECTOR,
  invalidatePreviews,
  sameSnapshot,
  type NavigatorSnapshot,
} from './dom.ts'
import { loadCompleteHistory } from './history.ts'
import { styles } from './styles.ts'

export interface MessageNavigatorProps {
  readonly session: SessionFace | undefined
}

export function MessageNavigator({ session }: MessageNavigatorProps) {
  const [snapshot, setSnapshot] = useState<NavigatorSnapshot>(EMPTY)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [readySession, setReadySession] = useState<SessionFace | null>(null)
  const railRef = useRef<HTMLDivElement | null>(null)
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const snapshotRef = useRef(snapshot)
  snapshotRef.current = snapshot

  const subscribeToSession = useCallback((listener: () => void) => session?.subscribe(listener) ?? (() => {}), [session])
  const readOpenState = useCallback(() => session?.getSnapshot().openState ?? 'cold', [session])
  const openState = useSyncExternalStore(subscribeToSession, readOpenState, readOpenState)

  useEffect(() => {
    let cancelled = false
    setReadySession(null)
    if (session === undefined || openState !== 'open') return () => { cancelled = true }
    if (!session.getSnapshot().hasMore) {
      setReadySession(session)
      return () => { cancelled = true }
    }
    void loadCompleteHistory(session, () => cancelled).finally(() => {
      if (!cancelled) setReadySession(session)
    })
    return () => { cancelled = true }
  }, [openState, session])

  useLayoutEffect(() => {
    let frame: number | null = null
    let boundScrollport: HTMLElement | null = null
    let scrollCleanup = () => {}
    let contentObserver: MutationObserver | null = null
    let sizeObserver: ResizeObserver | null = null

    const commit = (): void => {
      frame = null
      const scrollport = currentScrollport()
      if (scrollport === null) {
        setSnapshot(previous => previous.items.length === 0 ? previous : EMPTY)
        return
      }
      if (boundScrollport !== scrollport) bind(scrollport)
      const railHeight = railRef.current?.getBoundingClientRect().height ?? 0
      const next = buildSnapshot(scrollport, railHeight)
      setSnapshot(previous => sameSnapshot(previous, next) ? previous : next)
    }
    const schedule = (): void => {
      if (frame === null) frame = requestAnimationFrame(commit)
    }
    const unbind = (): void => {
      scrollCleanup()
      contentObserver?.disconnect()
      sizeObserver?.disconnect()
      scrollCleanup = () => {}
      contentObserver = null
      sizeObserver = null
    }
    const bind = (scrollport: HTMLElement): void => {
      unbind()
      boundScrollport = scrollport
      scrollport.addEventListener('scroll', schedule, { passive: true })
      scrollCleanup = () => { scrollport.removeEventListener('scroll', schedule) }
      const flow = scrollport.querySelector<HTMLElement>(FLOW_SELECTOR)
      if (flow !== null) {
        contentObserver = new MutationObserver((mutations) => {
          invalidatePreviews(mutations)
          schedule()
        })
        contentObserver.observe(flow, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-chat-flow-kind'] })
        if (typeof ResizeObserver !== 'undefined') {
          sizeObserver = new ResizeObserver(schedule)
          sizeObserver.observe(scrollport)
          sizeObserver.observe(flow)
          const composer = scrollport.querySelector<HTMLElement>(COMPOSER_SELECTOR)
          if (composer !== null) sizeObserver.observe(composer)
        }
      }
    }

    const shellObserver = new MutationObserver(schedule)
    shellObserver.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', schedule, { passive: true })
    schedule()
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      unbind()
      shellObserver.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [])

  useEffect(() => {
    if (hoveredIndex !== null && hoveredIndex >= snapshot.items.length) setHoveredIndex(null)
  }, [hoveredIndex, snapshot.items.length])

  const hitHeight = Math.max(6, Math.min(14, snapshot.height / Math.max(1, snapshot.items.length)))
  const positions = useMemo(
    () => compactPositions(snapshot.items.length, snapshot.height, 20, hitHeight / 2),
    [hitHeight, snapshot.height, snapshot.items.length],
  )

  const jumpTo = useCallback((index: number): void => {
    const current = snapshotRef.current
    const item = current.items[index]
    const scrollport = current.scrollport
    if (item === undefined || scrollport === null) return
    const viewport = scrollport.getBoundingClientRect()
    const row = item.element.getBoundingClientRect()
    const offset = Math.min(110, viewport.height * .16)
    const top = scrollport.scrollTop + row.top - viewport.top - offset
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollport.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [])

  const onMarkerKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>, index: number): void => {
    let target: number | null = null
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = Math.min(snapshot.items.length - 1, index + 1)
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = Math.max(0, index - 1)
    if (event.key === 'Home') target = 0
    if (event.key === 'End') target = snapshot.items.length - 1
    if (target === null) return
    event.preventDefault()
    markerRefs.current[target]?.focus()
    setHoveredIndex(target)
  }, [snapshot.items.length])

  const onNavigatorBlur = useCallback((event: ReactFocusEvent<HTMLElement>): void => {
    const next = event.relatedTarget
    const navigator = event.currentTarget.closest('.dsh-message-navigator')
    if (!(next instanceof Node) || navigator === null || !navigator.contains(next)) setHoveredIndex(null)
  }, [])

  const historyReady = session === undefined || readySession === session
  if (!historyReady || snapshot.items.length === 0 || snapshot.height < 80) return <style data-dsh-message-navigator="">{styles}</style>

  const previewIndex = hoveredIndex ?? snapshot.activeIndex
  const preview = snapshot.items[previewIndex]
  const previewPosition = positions[previewIndex] ?? 0
  const rootStyle = {
    left: snapshot.left,
    top: snapshot.top,
    height: snapshot.height,
    '--mn-preview-left': `${snapshot.previewLeft}px`,
  } as CSSProperties

  return (
    <>
      <style data-dsh-message-navigator="">{styles}</style>
      <nav className="dsh-message-navigator" style={rootStyle} aria-label="消息导航器">
        <div ref={railRef} className="dsh-message-navigator__rail" onMouseLeave={() => { setHoveredIndex(null) }}>
          {snapshot.items.map((item, index) => {
            const active = index === snapshot.activeIndex
            const markerStyle = {
              top: positions[index] ?? 0,
              '--mn-width': `${markerWidth(active)}px`,
              '--mn-hit-height': `${hitHeight}px`,
            } as CSSProperties
            const summary = item.preview.length > 72 ? `${item.preview.slice(0, 71)}…` : item.preview
            return (
              <button
                key={item.key}
                ref={(node) => { markerRefs.current[index] = node }}
                type="button"
                className="dsh-message-navigator__marker"
                style={markerStyle}
                data-active={active ? 'true' : undefined}
                aria-current={active ? 'location' : undefined}
                aria-label={`${index + 1}/${snapshot.items.length}，你的问题：${summary}`}
                onClick={() => { jumpTo(index) }}
                onFocus={() => { setHoveredIndex(index) }}
                onBlur={onNavigatorBlur}
                onMouseEnter={() => { setHoveredIndex(index) }}
                onKeyDown={event => { onMarkerKeyDown(event, index) }}
              >
                <span className="dsh-message-navigator__line" aria-hidden="true" />
              </button>
            )
          })}
          {preview !== undefined && hoveredIndex !== null && (
            <button
              type="button"
              className="dsh-message-navigator__preview"
              style={{ top: Math.max(0, Math.min(snapshot.height - 148, previewPosition - 48)) }}
              aria-label={`跳转到第 ${previewIndex + 1} 个问题：${preview.preview}`}
              onClick={() => { jumpTo(previewIndex) }}
              onFocus={() => { setHoveredIndex(previewIndex) }}
              onBlur={onNavigatorBlur}
              onMouseEnter={() => { setHoveredIndex(previewIndex) }}
            >
              <span className="dsh-message-navigator__preview-label">你的问题 · {previewIndex + 1}/{snapshot.items.length}</span>
              <span className="dsh-message-navigator__preview-text">{preview.preview}</span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
