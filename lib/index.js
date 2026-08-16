// dsh-message-navigator — 宿主半边。
// 注册一个 loopback 只读 HTTP 接口，向浏览器半边提供「当前会话的
// 全量用户消息列表」（含窗口外的历史），浏览器半边据此渲染完整目录，
// 并用 conversation.loadOlder() 把窗口外的目标逐页加载入窗后跳转。
export const name = 'message-navigator';

export const inject = ['webServer', 'sessionQuery'];

/** 从 ContentBlock[] 提取导航摘要文本（与浏览器半边逻辑一致）。 */
function summarizeBlocks(content) {
  if (!Array.isArray(content)) return '(无文本)';
  const parts = [];
  for (const block of content) {
    if (!block) continue;
    if (block.type === 'text' && typeof block.text === 'string') parts.push(block.text);
    else if (block.type === 'image') parts.push('[图片]');
    else if (block.type === 'tool-call') parts.push('[工具调用]');
    else if (block.type === 'tool-result') parts.push('[工具结果]');
    else if (block.type === 'reasoning') parts.push('[思考]');
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return text.length > 80 ? text.slice(0, 80) + '…' : (text || '(无文本)');
}

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/plugins/dsh-message-navigator/messages',
    handler: async (req, res) => {
      const payload = { sessionId: '', messages: [] };
      try {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        const sessionId = url.searchParams.get('sessionId') || '';
        payload.sessionId = sessionId;
        if (sessionId !== '') {
          const snap = await ctx.sessionQuery.readSession(sessionId);
          const messages = [];
          for (const ev of snap.events) {
            if (ev.type !== 'user/message') continue;
            const data = ev.data;
            if (!data || !data.source || data.source.kind !== 'user') continue;
            messages.push({
              id: String(data.id),
              seq: ev.seq,
              time: ev.time,
              text: summarizeBlocks(data.content),
            });
          }
          payload.messages = messages;
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify(payload));
      } catch (error) {
        payload.error = error instanceof Error ? error.message : String(error);
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(payload));
      }
    },
  }));
}
