# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
