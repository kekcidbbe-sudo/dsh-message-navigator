# dsh-message-navigator

**DeepSeek Harness (dsh) message navigator plugin** — a table of contents for
long conversations: extract every user message into an outline, click any item
to jump straight to it, keep the highlight in sync while you scroll, search,
and export the whole outline as Markdown.

[![npm](https://img.shields.io/npm/v/dsh-message-navigator)](https://www.npmjs.com/package/dsh-message-navigator)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | [中文](README.zh.md)

## Features

- **Message outline**: every user message of the current session, numbered and
  timestamped, extracted from the `useSession` conversation snapshot (data
  layer — no fragile DOM parsing).
- **Click-to-jump**: clicking an item smooth-scrolls the conversation to that
  message (viewport center) via the product's own `data-chat-anchor-key`
  anchor contract — the same mechanism DSH itself uses for message anchoring.
- **Scroll-synced highlight**: an `IntersectionObserver` rooted at the session
  scroll container keeps the highlight on the message nearest the viewport
  center.
- **Live updates**: new messages join the outline through snapshot
  subscription — no polling, no MutationObserver.
- **Keyword search** with instant filtering.
- **Keyboard navigation**: ↑/↓ select, Enter jump, Esc collapse.
- **Panel customization**: drag the header to move the panel, drag the left
  edge to resize (240–640px), collapse it to a small right-edge pill.
- **Copy outline**: export all user messages as a Markdown outline in one
  click.
- **Message counter**: "第 N / 共 M 条" plus a hint when older history has not
  been loaded yet.
- **Zero build step**: the repository ships ready-to-serve bundles — consumers
  never run a build.

## Install

Three equivalent ways; pick one, then restart `dsh web`.

```sh
# 1. npm (after the package is published)
dsh plugin --profile web add dsh-message-navigator

# 2. straight from GitHub
dsh plugin --profile web add github:kekcidbbe-sudo/dsh-message-navigator

# 3. local checkout
dsh plugin --profile web add link:/path/to/dsh-message-navigator
```

Then append the bundle to the profile manifest
(`$DSH_HOME/profiles/web/package.json`):

```json
"dsh": {
  "profile": {
    "bundles": [
      "@deepseek-ai/dsh-base",
      "@deepseek-ai/dsh-web-app",
      "dsh-message-navigator"
    ]
  }
}
```

> `dsh plugin add` handles the dependency entry for you; the bundles list is
> the composition manifest and needs the one-line addition above. Restart
> DeepSeek Harness to load the new bundle.

## Usage

1. Open a session — the toggle button (`📋 消息导航`) appears in the session
   header, and a floating pill (`📋 导航 N`) sits at the right edge.
2. Click either to open the navigator panel.
3. Click an item to jump; scroll the conversation to watch the highlight
   follow; type in the search box to filter; drag the header / left edge to
   reposition or resize.
4. `复制大纲` copies every user message as a Markdown outline.

## How it works

| Module | Implementation |
| --- | --- |
| Message extraction | `useSession` snapshot from the `conversation.session.header.utilities` slot → `chat.order` + `chat.nodes` entries with `kind === 'user'` |
| Jump targeting | data-layer node key ↔ DOM `[data-chat-anchor-key]` (1:1), `scrollIntoView({ behavior: 'smooth', block: 'center' })` |
| Scroll sync | `IntersectionObserver`, root = `[data-conversation-scroll]` (the session scrollport) |
| Panel UI | `shell.overlay` frame-wide floating layer (click-through safe, draggable) |
| State | in-memory per-plugin store; nothing is persisted |

The plugin is dual-face in the standard DSH shape: a minimal host half
(`lib/index.js`) makes the composition row resolvable, and the whole feature
lives in the browser half (`lib/client.js`) registered as a `dsh.client`
module. No official surfaces are patched — only additive slots are used.

## Project structure

```
dsh-message-navigator/
├── package.json          # dsh.bundle patch + dsh.client declaration
├── cordis.patch.yml      # composition patch: inserts the plugin row
├── lib/
│   ├── index.js          # host half (minimal placeholder)
│   └── client.js         # browser half (the whole feature)
├── CHANGELOG.md
├── LICENSE
├── README.md
└── README.zh.md
```

## Compatibility

- Targets **DeepSeek Harness** (desktop app and `dsh web` browser both run the
  same web profile — one install covers both).
- Uses public DSH contracts only: the `useSession` snapshot, the
  `shell.overlay` / `conversation.session.header.utilities` slots and the
  `data-chat-anchor-key` DOM anchor. DSH is pre-1.0; if a future version moves
  these contracts, the matching selectors live in `lib/client.js`.
- Not a generic browser extension: it cannot be installed into ChatGPT,
  Claude or other chat products.

## Known limitations

- Only messages in the currently rendered window are listed (DSH loads
  history in windows; scroll up to load older messages first — the panel
  footer hints at this).
- While the model is streaming, the conversation may pull you back to the
  bottom after a jump; jumping is stable once the turn settles.

## Development

```sh
npm test        # syntax-check both halves and validate the host export
npm pack --dry-run   # preview the published tarball contents
```

No build pipeline: `lib/client.js` is written directly in the final
`window.__ModuleLoader__.load` bundle format the web shell consumes.

## License

MIT — see [LICENSE](LICENSE).
