// dsh-message-navigator — 宿主半边（极简占位）。
// 消息导航器的全部功能都在浏览器半边（lib/client.js）实现：
// 消息提取、导航面板、滚动定位与高亮同步均为纯客户端 UI 能力。
// 该半边仅用于让组合行在宿主侧可解析（行 id 与插件 name 一致）。
export const name = 'message-navigator';

export function apply(_ctx) {
  // 无宿主副作用。
}
