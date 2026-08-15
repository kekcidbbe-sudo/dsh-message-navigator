# dsh-message-navigator

**DeepSeek Harness (dsh) 消息导航器插件** —— 给长对话加一个「目录」：提取全部用户消息生成导航大纲，点击条目直接跳到对应消息，滚动时高亮实时跟随，支持关键词搜索与 Markdown 大纲导出。

[![npm](https://img.shields.io/npm/v/dsh-message-navigator)](https://www.npmjs.com/package/dsh-message-navigator)
[![CI](https://github.com/kekcidbbe-sudo/dsh-message-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/kekcidbbe-sudo/dsh-message-navigator/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | [中文](README.zh.md)

## 功能

- **消息大纲**：提取当前会话的全部用户消息（数据层 `useSession` 快照，非 DOM 解析），生成带序号、时间、摘要的导航列表
- **点击跳转**：点击条目平滑滚动到对应消息（视口中央），复用 DSH 产品自身的 `data-chat-anchor-key` 锚点契约（与产品内部定位机制完全一致）
- **滚动同步**：`IntersectionObserver`（root 为会话滚动容器）自动高亮视口中央最近的消息
- **实时更新**：新消息通过快照订阅自动追加——无需轮询、无需 MutationObserver
- **关键词搜索**：即时过滤
- **键盘导航**：`↑`/`↓` 选择，`Enter` 跳转，`Esc` 收起
- **面板自定义**：按住标题栏拖动位置；拖左边缘调宽度（240–640px）；可收起为右侧小胶囊
- **复制大纲**：一键将全部用户消息复制为 Markdown 大纲
- **消息计数**：底部显示「第 N / 共 M 条」，历史未加载时给出提示
- **零构建步骤**：仓库直接发布可用的产物，使用者无需任何构建

## 安装

三种方式任选其一，然后重启 `dsh web`。

```sh
# 1. npm（发布到 npm 后）
dsh plugin --profile web add dsh-message-navigator

# 2. 直接从 GitHub 安装
dsh plugin --profile web add github:kekcidbbe-sudo/dsh-message-navigator

# 3. 本地目录
dsh plugin --profile web add link:/path/to/dsh-message-navigator
```

再把包名追加到 profile 清单（`$DSH_HOME/profiles/web/package.json`）：

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

> `dsh plugin add` 会自动写入依赖项；bundles 列表是组合清单，需要手动加上面这一行。重启 DeepSeek Harness 后新 bundle 生效。

## 使用

1. 打开任意会话——顶部右侧出现「📋 消息导航」按钮，屏幕右侧出现「📋 导航 N」悬浮胶囊；
2. 点任一入口打开导航面板；
3. 点条目跳转；滚动对话时高亮自动跟随；搜索框输入关键词过滤；按住标题栏拖动位置、拖左缘调整宽度；
4. 「复制大纲」把全部用户消息复制为 Markdown 大纲。

## 工作原理

| 模块 | 实现 |
| --- | --- |
| 消息提取 | `conversation.session.header.utilities` 槽位的 `useSession` 快照 → `chat.order` + `chat.nodes` 中 `kind === 'user'` 的节点 |
| 跳转定位 | 数据层节点 key ↔ DOM `[data-chat-anchor-key]`（一一对应），`scrollIntoView({ behavior: 'smooth', block: 'center' })` |
| 滚动同步 | `IntersectionObserver`，root = `[data-conversation-scroll]`（会话滚动容器） |
| 面板 UI | `shell.overlay` 全局浮动层（点透安全、可拖动） |
| 状态 | 包内内存态，无任何持久化 |

插件采用标准的 DSH 双面形态：极简的宿主半边（`lib/index.js`）让组合行可解析，全部功能在浏览器半边（`lib/client.js`），以 `dsh.client` 模块注册。未改动任何官方界面——只使用加法槽位。

## 项目结构

```
dsh-message-navigator/
├── package.json          # dsh.bundle 补丁 + dsh.client 声明
├── cordis.patch.yml      # 组合补丁：插入插件行
├── lib/
│   ├── index.js          # 宿主半边（极简占位）
│   └── client.js         # 浏览器半边（全部功能）
├── .github/workflows/ci.yml
├── CHANGELOG.md
├── LICENSE
├── README.md
└── README.zh.md
```

## 兼容性

- 面向 **DeepSeek Harness**：桌面 App 与 `dsh web` 网页端跑的是同一个 web profile，一次安装两种形态都生效
- 只依赖 DSH 公开契约：`useSession` 快照、`shell.overlay` / `conversation.session.header.utilities` 槽位、`data-chat-anchor-key` DOM 锚点。DSH 尚未到 1.0，若未来版本调整这些契约，对应选择器集中在 `lib/client.js` 中
- 不是通用浏览器插件：无法安装到 ChatGPT、Claude 等其他聊天产品

## 已知限制

- 只显示当前渲染窗口内的消息（DSH 按窗口加载历史，更早消息需先向上滚动加载，面板底部有提示）
- 模型流式输出时跳转可能被「跟随底部」拉回，输出结束后跳转稳定

## 开发

```sh
npm test             # 语法校验两个半边 + 校验宿主导出
npm pack --dry-run   # 预览发布产物内容
```

无构建管线：`lib/client.js` 直接以 Web shell 消费的 `window.__ModuleLoader__.load` 产物格式编写。

## License

MIT — 见 [LICENSE](LICENSE)。
