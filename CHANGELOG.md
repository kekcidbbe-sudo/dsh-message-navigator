# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-08-16

### Added

- **Full-history outline**: the host half now exposes a loopback endpoint
  (`/plugins/dsh-message-navigator/messages`) that returns every user
  message of a session, including ones outside the render window. The panel
  shows the complete outline — like the navigators in Hermes/Codex.
- **Auto-load on jump**: clicking an item whose message is outside the render
  window drives `conversation.loadOlder()` page by page until the target
  enters the window, then scrolls to it — no manual "加载更早" clicks.
- Outside-window items are marked with a 历史 tag; the footer shows
  共 N 条 · 已加载 M 条. If the host half is not loaded (old process), the
  client degrades gracefully to the window-only mode.

## [1.1.1] - 2025-08-16

### Fixed

- **Handle follows the conversation edge**: the edge handle and panel are now
  anchored to the conversation content area's right edge instead of the
  viewport. When a right sidebar (e.g. `dsh-better-sidebar`) opens and
  squeezes the conversation, the handle moves with it and stays visible at
  the conversation's right edge, never covered by the sidebar panel.

## [1.1.0] - 2025-08-16

### Changed

- **Edge-handle + fold-out panel**: the navigator no longer occupies a fixed
  floating card beside the right sidebar. It now collapses into a slim
  right-edge handle (📋 + message count, no layout footprint) and expands
  into an overlay panel that floats **above** any right sidebar
  (z-index 200) without pushing or being covered by it.
- Clicking an outline item now auto-collapses the panel after the jump,
  keeping the workspace clean.
- Drag-to-move and width-resize were removed: the handle stays docked to the
  right edge and the panel has a fixed comfortable width.

## [1.0.1] - 2025-08-16

### Fixed

- **Z-index conflict with floating sidebars**: the navigator toggle button,
  floating pill and panel were layered below the fixed toggle cluster /
  side panel of `dsh-better-sidebar` (z-index 50–60). All navigator surfaces
  now layer at z-index 70, so the button stays clickable and the panel stays
  on top when the side card opens.

## [1.0.0] - 2025-08-16

### Added

- **Message outline**: extracts every user message of the current session from
  the `useSession` conversation snapshot (data layer, no DOM parsing) into a
  numbered, timestamped outline.
- **Click-to-jump**: clicking an outline item smooth-scrolls the conversation
  to that message (viewport center) through the product's own
  `data-chat-anchor-key` anchor contract.
- **Scroll-synced highlight**: an `IntersectionObserver` rooted at the session
  scroll container keeps the outline highlight on the message nearest the
  viewport center.
- **Live updates**: new messages join the outline through snapshot
  subscription — no polling, no MutationObserver.
- **Keyword search** with instant filtering.
- **Keyboard navigation**: ↑/↓ select, Enter jump, Esc collapse.
- **Panel customization**: drag the header to move, drag the left edge to
  resize (240–640px), collapse to a right-edge pill.
- **Copy outline**: exports all user messages as a Markdown outline in one
  click.
- **Message counter**: "第 N / 共 M 条" plus a hint when older history is not
  loaded yet.
- **Two entries**: a session-header toggle button (`📋 消息导航`) and a
  floating right-edge pill (`📋 导航 N`).
- Zero-build distribution: hand-written `lib/client.js` ships in the final
  `window.__ModuleLoader__.load` bundle format; no pnpm/Node build step for
  consumers.

[1.0.0]: https://github.com/kekcidbbe-sudo/dsh-message-navigator/releases/tag/v1.0.0
