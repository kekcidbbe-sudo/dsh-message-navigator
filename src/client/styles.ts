export const styles = String.raw`
.dsh-message-navigator {
  --mn-muted: color-mix(in srgb, var(--dsw-alias-label-secondary, #74777c) 32%, transparent);
  --mn-active: var(--dsw-alias-label-primary, #202124);
  --mn-surface: color-mix(in srgb, var(--dsw-alias-bg-overlay, #fff) 96%, transparent);
  --mn-border: var(--dsw-alias-border-l1, rgba(32, 33, 36, .16));
  position: absolute;
  z-index: 2;
  width: 72px;
  min-height: 80px;
  pointer-events: none;
  contain: layout style;
}
.dsh-message-navigator__rail {
  position: relative;
  width: 72px;
  height: 100%;
  pointer-events: auto;
}
.dsh-message-navigator__marker {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  width: 72px;
  height: max(6px, var(--mn-hit-height));
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translateY(-50%);
  outline: none;
}
.dsh-message-navigator__line {
  display: block;
  width: var(--mn-width);
  height: 3px;
  border-radius: 99px;
  background: var(--mn-muted);
  transition: width 140ms ease, height 140ms ease, background-color 140ms ease, opacity 140ms ease;
}
.dsh-message-navigator__marker:hover .dsh-message-navigator__line,
.dsh-message-navigator__marker:focus-visible .dsh-message-navigator__line {
  width: max(var(--mn-width), 38px);
  background: color-mix(in srgb, var(--mn-active) 55%, transparent);
}
.dsh-message-navigator__marker[data-active='true'] .dsh-message-navigator__line {
  height: 4px;
  background: var(--mn-active);
}
.dsh-message-navigator__marker:focus-visible::after {
  content: '';
  position: absolute;
  inset: 0 2px 0 -5px;
  border: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  border-radius: 6px;
}
.dsh-message-navigator__preview {
  position: absolute;
  left: 76px;
  width: min(440px, calc(100vw - var(--mn-preview-left) - 24px));
  min-width: min(280px, calc(100vw - var(--mn-preview-left) - 24px));
  max-height: 176px;
  overflow: hidden;
  display: block;
  padding: 18px 20px;
  border: 1px solid var(--mn-border);
  border-radius: 24px;
  background: var(--mn-surface);
  box-shadow: 0 14px 38px rgba(0, 0, 0, .12);
  color: var(--dsw-alias-label-primary, #202124);
  font: inherit;
  text-align: left;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(18px);
  animation: dsh-message-navigator-in 120ms ease-out;
}
.dsh-message-navigator__preview:hover {
  background: color-mix(in srgb, var(--dsw-alias-bg-overlay, #fff) 92%, var(--dsw-alias-label-primary, #202124) 8%);
}
.dsh-message-navigator__preview:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-message-navigator__preview-label {
  display: block;
  margin-bottom: 7px;
  color: var(--dsw-alias-label-secondary, #74777c);
  font: 600 11px/1.2 ui-sans-serif, system-ui, sans-serif;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.dsh-message-navigator__preview-text {
  display: -webkit-box;
  overflow: hidden;
  font: 600 16px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}
@keyframes dsh-message-navigator-in {
  from { opacity: 0; transform: translateX(-5px) scale(.985); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@media (max-width: 760px) {
  .dsh-message-navigator { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-message-navigator__line { transition: none; }
  .dsh-message-navigator__preview { animation: none; }
}
`
