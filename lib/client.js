// dsh-message-navigator — 浏览器半边（消息导航器）。
// 已构建的客户端 bundle 格式：window.__ModuleLoader__.load({ id, factory })，
// 模块具名导出 { name, apply }，由 Web shell 内核作为插件条目收养。
window.__ModuleLoader__.load({
  id: 'dsh-message-navigator',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    var React = require('react');

    var CSS_TAG_ID = 'dsh-message-navigator/style.css';
    var CSS = [
      // 右缘窄把手：默认收着，不占空间，浮在一切侧边栏之上
      '.mnv-handle {',
      '  position: fixed; right: 0; top: 38%;',
      '  z-index: 200; pointer-events: auto;',
      '  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;',
      '  width: 24px; padding: 10px 0;',
      '  background: var(--dsw-alias-bg-overlay);',
      '  border: 1px solid var(--dsw-alias-border-l2);',
      '  border-right: none;',
      '  border-radius: 8px 0 0 8px;',
      '  cursor: pointer;',
      '  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.18);',
      '}',
      '.mnv-handle:hover { border-color: var(--dsw-alias-brand-primary); }',
      '.mnv-handle-icon { font-size: 13px; line-height: 1; }',
      '.mnv-handle-label {',
      '  writing-mode: vertical-rl; letter-spacing: 2px;',
      '  font-size: 11px; color: var(--dsw-alias-label-secondary);',
      '}',
      '.mnv-handle-count {',
      '  font-size: 10px; line-height: 1;',
      '  min-width: 16px; padding: 2px 4px; text-align: center;',
      '  background: var(--dsw-alias-brand-primary); color: #fff;',
      '  border-radius: 999px;',
      '}',
      // 展开浮层：从把手向左伸出，浮在侧边栏之上，不挤占其布局
      '.mnv-panel {',
      '  position: fixed; right: 26px; top: 38%;',
      '  z-index: 200; pointer-events: auto;',
      '  width: 320px; max-height: calc(100vh - 38vh - 16px);',
      '  display: flex; flex-direction: column;',
      '  background: var(--dsw-alias-bg-overlay);',
      '  border: 1px solid var(--dsw-alias-border-l2);',
      '  border-radius: 12px;',
      '  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);',
      '  font-family: inherit;',
      '  color: var(--dsw-alias-label-primary);',
      '  overflow: hidden;',
      '}',
      '.mnv-header {',
      '  display: flex; align-items: center; gap: 8px;',
      '  padding: 8px 10px;',
      '  border-bottom: 1px solid var(--dsw-alias-border-l1);',
      '}',
      '.mnv-title { font-size: 13px; font-weight: 600; flex: 1; }',
      '.mnv-count { font-size: 11px; color: var(--dsw-alias-label-secondary); }',
      '.mnv-btn {',
      '  border: 1px solid var(--dsw-alias-border-l1);',
      '  background: transparent;',
      '  color: var(--dsw-alias-label-secondary);',
      '  border-radius: 6px; font-size: 11px;',
      '  padding: 3px 8px; cursor: pointer;',
      '}',
      '.mnv-btn:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }',
      '.mnv-search {',
      '  margin: 8px 10px 0; padding: 5px 8px;',
      '  border: 1px solid var(--dsw-alias-border-l1);',
      '  border-radius: 8px;',
      '  background: var(--dsw-alias-bg-layer-2);',
      '  color: var(--dsw-alias-label-primary);',
      '  font-size: 12px; outline: none;',
      '}',
      '.mnv-search:focus { border-color: var(--dsw-alias-brand-primary); }',
      '.mnv-list {',
      '  list-style: none; margin: 8px 0 0; padding: 0 6px 6px;',
      '  overflow-y: auto; flex: 1; min-height: 0;',
      '}',
      '.mnv-item {',
      '  display: flex; flex-direction: column; gap: 2px;',
      '  padding: 6px 8px; border-radius: 8px;',
      '  cursor: pointer; border: 1px solid transparent;',
      '}',
      '.mnv-item:hover { background: var(--dsw-alias-bg-layer-2); }',
      '.mnv-item-active { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-brand-primary); }',
      '.mnv-item-sel { outline: 1px dashed var(--dsw-alias-brand-primary); }',
      '.mnv-item-top { display: flex; gap: 6px; align-items: baseline; }',
      '.mnv-item-idx { font-size: 10px; color: var(--dsw-alias-label-secondary); min-width: 20px; }',
      '.mnv-item-time { font-size: 10px; color: var(--dsw-alias-label-secondary); }',
      '.mnv-item-text {',
      '  font-size: 12px; line-height: 1.45;',
      '  color: var(--dsw-alias-label-primary);',
      '  display: -webkit-box; -webkit-line-clamp: 2;',
      '  -webkit-box-orient: vertical; overflow: hidden;',
      '}',
      '.mnv-empty { padding: 24px 12px; text-align: center; font-size: 12px; color: var(--dsw-alias-label-secondary); }',
      '.mnv-footer {',
      '  padding: 6px 10px;',
      '  border-top: 1px solid var(--dsw-alias-border-l1);',
      '  font-size: 11px; color: var(--dsw-alias-label-secondary);',
      '  display: flex; justify-content: space-between;',
      '}',
      '.mnv-status { padding: 4px 10px; font-size: 11px; color: var(--dsw-alias-state-warn-primary); }',
      '.mnv-toggle {',
      '  display: inline-flex; align-items: center; gap: 5px;',
      '  position: relative; z-index: 70;',
      '  border: 1px solid var(--dsw-alias-border-l1);',
      '  background: transparent;',
      '  color: var(--dsw-alias-label-secondary);',
      '  border-radius: 8px; font-size: 12px;',
      '  padding: 4px 9px; cursor: pointer;',
      '}',
      '.mnv-toggle:hover {',
      '  color: var(--dsw-alias-label-primary);',
      '  border-color: var(--dsw-alias-border-l2);',
      '  background: var(--dsw-alias-bg-layer-2);',
      '}',
      '.mnv-item-hist .mnv-item-text { color: var(--dsw-alias-label-secondary); }',
      '.mnv-item-tag {',
      '  font-size: 10px; line-height: 1;',
      '  color: var(--dsw-alias-label-secondary);',
      '  border: 1px solid var(--dsw-alias-border-l1);',
      '  border-radius: 4px; padding: 1px 4px; margin-left: 6px;',
      '}',
    ].join('\n');

    function ensureCss() {
      if (typeof document === 'undefined') return function () {};
      if (document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_TAG_ID) + ']') !== null) {
        return function () {};
      }
      var tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-message-navigator';
      tag.dataset.pluginCss = CSS_TAG_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return function () {
        if (tag.parentNode !== null) tag.parentNode.removeChild(tag);
      };
    }

    function apply(ctx) {
      var slots = ctx.get('slots');
      if (slots === undefined) return;
      var sessions = ctx.get('sessions');

      var disposeCss = ensureCss();
      ctx.effect(function () { return disposeCss; });

      // ---------- 共享状态（包内内存态，随插件停止而释放） ----------
      function createStore() {
        var state = {
          sessionId: null,
          items: [],
          fullItems: [],
          hasMore: false,
          open: false,
          query: '',
        };
        var listeners = new Set();
        return {
          get: function () { return state; },
          set: function (patch) {
            state = Object.assign({}, state, patch);
            listeners.forEach(function (listener) { listener(state); });
          },
          subscribe: function (listener) {
            listeners.add(listener);
            return function () { listeners.delete(listener); };
          },
        };
      }
      var store = createStore();

      function useStore(source) {
        var ref = React.useState(function () { return source.get(); });
        var state = ref[0];
        var setState = ref[1];
        React.useEffect(function () { return source.subscribe(setState); }, [source]);
        return state;
      }

      // ---------- 消息摘要 / 时间 ----------
      function summarize(content) {
        if (!Array.isArray(content)) return '(无文本)';
        var parts = [];
        for (var i = 0; i < content.length; i++) {
          var block = content[i];
          if (!block) continue;
          if (block.type === 'text' && typeof block.text === 'string') parts.push(block.text);
          else if (block.type === 'image') parts.push('[图片]');
          else if (block.type === 'tool-call') parts.push('[工具调用]');
          else if (block.type === 'tool-result') parts.push('[工具结果]');
          else if (block.type === 'reasoning') parts.push('[思考]');
        }
        var text = parts.join(' ').replace(/\s+/g, ' ').trim();
        if (text.length > 80) text = text.slice(0, 80) + '…';
        return text || '(无文本)';
      }

      function timeStr(t) {
        if (!t) return '';
        try {
          var d = new Date(t);
          var hh = String(d.getHours()).padStart(2, '0');
          var mm = String(d.getMinutes()).padStart(2, '0');
          return hh + ':' + mm;
        } catch (error) { return ''; }
      }

      // ---------- 头部切换按钮（会话作用域：读取数据层快照） ----------
      function NavToggle(props) {
        var state = useStore(store);
        var chatSel = props.useSession(
          function (s) { return s && s.chat ? { order: s.chat.order, nodes: s.chat.nodes } : null; },
          function (a, b) {
            return a === b || (a !== null && b !== null && a.order === b.order && a.nodes === b.nodes);
          },
        );
        var hasMore = props.useSession(function (s) { return s ? s.hasMore === true : false; });

        React.useEffect(function () {
          if (chatSel === null) {
            store.set({ items: [], sessionId: null, hasMore: false });
            return;
          }
          var items = [];
          for (var i = 0; i < chatSel.order.length; i++) {
            var key = chatSel.order[i];
            var node = chatSel.nodes.get(key);
            if (node === undefined || node === null) continue;
            if (node.kind !== 'user' || node.visibility === 'hidden') continue;
            var data = node.data || {};
            items.push({
              key: key,
              seq: node.anchorSeq,
              time: data.time || 0,
              text: summarize(data.content),
            });
          }
          // 合并窗口内 + 已有全量列表（窗口外的历史条目由 host 接口补入）
          var prev = store.get();
          var isNewSession = prev.sessionId !== props.sessionId;
          var bySeq = new Map();
          if (prev.fullItems && prev.fullItems.length > 0) {
            for (var j = 0; j < prev.fullItems.length; j++) {
              var f = prev.fullItems[j];
              bySeq.set(f.seq, { seq: f.seq, time: f.time, text: f.text, key: f.key, inWindow: false });
            }
          }
          for (var k = 0; k < items.length; k++) {
            var it = items[k];
            bySeq.set(it.seq, { seq: it.seq, time: it.time, text: it.text, key: it.key, inWindow: true });
          }
          var fullItems = [];
          bySeq.forEach(function (v) { fullItems.push(v); });
          fullItems.sort(function (a, b) { return a.seq - b.seq; });
          store.set({ items: items, fullItems: fullItems, sessionId: props.sessionId, hasMore: hasMore });
          // 会话切换时拉取 host 全量列表（含窗口外历史）
          if (isNewSession && typeof window !== 'undefined' && typeof window.fetch === 'function') {
            var sid = props.sessionId;
            window.fetch('/plugins/dsh-message-navigator/messages?sessionId=' + encodeURIComponent(sid))
              .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
              .then(function (payload) {
                if (store.get().sessionId !== sid) return;
                var remote = Array.isArray(payload.messages) ? payload.messages : [];
                var map = new Map();
                for (var r = 0; r < remote.length; r++) {
                  var m = remote[r];
                  map.set(m.seq, {
                    seq: m.seq, time: m.time, text: m.text,
                    key: (String('input-message').length + ':input-message') + m.id,
                    inWindow: false,
                  });
                }
                for (var w = 0; w < store.get().items.length; w++) {
                  var wi = store.get().items[w];
                  map.set(wi.seq, { seq: wi.seq, time: wi.time, text: wi.text, key: wi.key, inWindow: true });
                }
                var merged = [];
                map.forEach(function (v) { merged.push(v); });
                merged.sort(function (a, b) { return a.seq - b.seq; });
                store.set({ fullItems: merged });
              })
              .catch(function () { /* host 不可用时降级为窗口内模式 */ });
          }
        }, [chatSel, hasMore, props.sessionId]);

        React.useEffect(function () {
          return function () { store.set({ items: [], sessionId: null, hasMore: false }); };
        }, []);

        return React.createElement('button', {
          className: 'mnv-toggle',
          type: 'button',
          title: '消息导航器：打开/收起消息目录',
          onClick: function () { store.set({ open: !state.open }); },
        }, '📋 ', React.createElement('span', null, state.open ? '收起导航' : '消息导航'));
      }

      // ---------- 右缘把手 + 折叠浮层面板（全局覆盖层） ----------
      function NavPanel() {
        var state = useStore(store);
        var activeKeyRef = React.useState(null);
        var activeKey = activeKeyRef[0];
        var setActiveKey = activeKeyRef[1];
        var selIndexRef = React.useState(0);
        var selIndex = selIndexRef[0];
        var setSelIndex = selIndexRef[1];
        var copiedRef = React.useState(false);
        var copied = copiedRef[0];
        var setCopied = copiedRef[1];
        var statusRef = React.useState(null);
        var status = statusRef[0];
        var setStatus = statusRef[1];
        var panelEl = null;
        var edgeRightRef = React.useState(0);
        var edgeRight = edgeRightRef[0];
        var setEdgeRight = edgeRightRef[1];

        // 跟随对话内容区右缘：侧边栏展开挤窄内容区时，把手与面板随之左移，
        // 始终贴在对话区右边，而不是固定在视口右缘被侧边栏盖住。
        React.useEffect(function () {
          if (typeof document === 'undefined' || typeof window === 'undefined') return;
          function measure() {
            var ref = document.querySelector('[data-conversation-scroll]');
            if (ref === null) { setEdgeRight(0); return; }
            var rect = ref.getBoundingClientRect();
            setEdgeRight(Math.max(0, Math.round(window.innerWidth - rect.right)));
          }
          measure();
          var ro = null;
          if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(function () { measure(); });
            var ref = document.querySelector('[data-conversation-scroll]');
            if (ref !== null) ro.observe(ref);
          }
          window.addEventListener('resize', measure);
          return function () {
            if (ro !== null) ro.disconnect();
            window.removeEventListener('resize', measure);
          };
        }, [state.sessionId]);

        var query = (state.query || '').trim().toLowerCase();
        var fullList = (state.fullItems && state.fullItems.length > 0) ? state.fullItems : state.items;
        var items = query === ''
          ? fullList
          : fullList.filter(function (item) { return item.text.toLowerCase().indexOf(query) !== -1; });
        var indexByKey = new Map();
        for (var i = 0; i < fullList.length; i++) indexByKey.set(fullList[i].key, i);
        var inWindowCount = 0;
        for (var w = 0; w < fullList.length; w++) if (fullList[w].inWindow === true) inWindowCount += 1;

        // 滚动同步：IntersectionObserver 监听用户消息行，root 为会话滚动容器
        React.useEffect(function () {
          if (!state.open) return;
          if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;
          var all = document.querySelectorAll('[data-chat-anchor-key]');
          var rows = [];
          for (var i = 0; i < all.length; i++) {
            if (indexByKey.has(all[i].dataset.chatAnchorKey)) rows.push(all[i]);
          }
          if (rows.length === 0) return;
          var rootEl = rows[0].closest('[data-conversation-scroll]') || null;
          var observer = new IntersectionObserver(function (entries) {
            var bestKey = null;
            var bestDist = Infinity;
            for (var i = 0; i < entries.length; i++) {
              var entry = entries[i];
              if (!entry.isIntersecting || !entry.rootBounds) continue;
              var rect = entry.boundingClientRect;
              var root = entry.rootBounds;
              var dist = Math.abs((rect.top + rect.bottom) / 2 - (root.top + root.bottom) / 2);
              if (dist < bestDist) { bestDist = dist; bestKey = entry.target.dataset.chatAnchorKey; }
            }
            if (bestKey !== null) setActiveKey(bestKey);
          }, { root: rootEl, threshold: [0, 0.5, 1] });
          for (var i = 0; i < rows.length; i++) observer.observe(rows[i]);
          return function () { observer.disconnect(); };
        }, [state.open, state.items]);

        // 激活条目变化时，让导航列表内部跟随滚动
        React.useEffect(function () {
          if (activeKey === null || typeof document === 'undefined' || panelEl === null) return;
          var target = panelEl.querySelector('[data-nav-key="' + activeKey + '"]');
          if (target !== null && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ block: 'nearest' });
          }
        }, [activeKey]);

        // 目标消息是否已在 DOM 渲染
        function domHasKey(key) {
          if (typeof document === 'undefined') return false;
          var all = document.querySelectorAll('[data-chat-anchor-key]');
          for (var i = 0; i < all.length; i++) {
            if (all[i].dataset.chatAnchorKey === key) return true;
          }
          return false;
        }

        // 平滑滚动到目标消息行
        function scrollToKey(key) {
          if (typeof document === 'undefined') return false;
          var all = document.querySelectorAll('[data-chat-anchor-key]');
          for (var i = 0; i < all.length; i++) {
            if (all[i].dataset.chatAnchorKey === key) {
              try { all[i].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
              catch (error) { try { all[i].scrollIntoView(true); } catch (error2) {} }
              return true;
            }
          }
          return false;
        }

        // 点击条目 → 平滑滚动；窗口外的先连续 loadOlder 直到入窗
        function jump(item, index) {
          setSelIndex(index);
          setActiveKey(item.key);
          setStatus(null);
          if (typeof document === 'undefined') { setStatus('当前环境无法访问页面 DOM'); return; }
          if (domHasKey(item.key)) {
            scrollToKey(item.key);
            store.set({ open: false });
            return;
          }
          setStatus('正在加载更早的历史…');
          var agentCtx = sessions ? sessions.scope(state.sessionId) : undefined;
          var conv = agentCtx ? agentCtx.conversation : undefined;
          if (!conv || typeof conv.loadOlder !== 'function') {
            setStatus('无法自动加载更早历史（重启 DSH 后生效）');
            return;
          }
          var attempt = 0;
          var step = function () {
            if (domHasKey(item.key)) {
              scrollToKey(item.key);
              setStatus(null);
              store.set({ open: false });
              return;
            }
            if (!store.get().hasMore || attempt >= 120) {
              setStatus('该消息未能加载（可能已被归档压缩）');
              return;
            }
            attempt += 1;
            conv.loadOlder().then(function () {
              window.setTimeout(step, 150);
            }, function () {
              setStatus('加载更早历史失败');
            });
          };
          step();
        }

        function copyOutline() {
          var lines = [];
          for (var i = 0; i < fullList.length; i++) {
            lines.push((i + 1) + '. [' + timeStr(fullList[i].time) + '] ' + fullList[i].text);
          }
          var markdown = lines.join('\n');
          if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(markdown).then(
              function () { setCopied(true); },
              function () { setStatus('复制失败：剪贴板不可用'); },
            );
          } else {
            setStatus('复制失败：剪贴板不可用');
          }
        }

        function onKeyDown(event) {
          if (event.key === 'Escape') { store.set({ open: false }); return; }
          if (items.length === 0) return;
          if (event.key === 'ArrowDown') { event.preventDefault(); setSelIndex((selIndex + 1) % items.length); return; }
          if (event.key === 'ArrowUp') { event.preventDefault(); setSelIndex((selIndex - 1 + items.length) % items.length); return; }
          if (event.key === 'Enter') { event.preventDefault(); jump(items[selIndex], selIndex); }
        }

        // 收起态：右缘窄把手
        if (!state.open) {
          if (!state.sessionId || fullList.length === 0) return null;
          return React.createElement('div', {
            className: 'mnv-handle',
            style: { right: (edgeRight + 4) + 'px' },
            role: 'button',
            tabIndex: 0,
            title: '打开消息导航器（' + fullList.length + ' 条用户消息）',
            onClick: function () { store.set({ open: true, query: '' }); },
            onKeyDown: function (event) {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); store.set({ open: true, query: '' }); }
            },
          },
            React.createElement('span', { className: 'mnv-handle-icon' }, '📋'),
            React.createElement('span', { className: 'mnv-handle-count' }, String(fullList.length)),
            React.createElement('span', { className: 'mnv-handle-label' }, '消息导航'),
          );
        }

        var activeIndex = items.findIndex(function (item) { return item.key === activeKey; });
        var children = [];
        children.push(React.createElement('div', { className: 'mnv-header' },
          React.createElement('span', { className: 'mnv-title' }, '📋 消息导航器'),
          React.createElement('span', { className: 'mnv-count' }, fullList.length + ' 条'),
          React.createElement('button', { className: 'mnv-btn', type: 'button', title: '复制全部用户消息大纲', onClick: copyOutline }, copied ? '已复制 ✓' : '复制大纲'),
          React.createElement('button', { className: 'mnv-btn', type: 'button', title: '收起面板', onClick: function () { store.set({ open: false }); } }, '✕'),
        ));
        children.push(React.createElement('input', {
          className: 'mnv-search',
          type: 'text',
          placeholder: '搜索消息关键词…',
          value: state.query,
          onChange: function (event) { store.set({ query: event.target.value }); },
        }));
        if (status !== null) children.push(React.createElement('div', { className: 'mnv-status' }, status));

        var listChildren = null;
        if (fullList.length === 0) {
          listChildren = React.createElement('div', { className: 'mnv-empty' },
            state.sessionId ? '该会话还没有用户消息' : '打开一个会话后自动同步消息');
        } else if (items.length === 0) {
          listChildren = React.createElement('div', { className: 'mnv-empty' }, '没有匹配的消息');
        } else {
          var rows = [];
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var classes = 'mnv-item'
              + (item.key === activeKey ? ' mnv-item-active' : '')
              + (i === selIndex ? ' mnv-item-sel' : '')
              + (item.inWindow === false ? ' mnv-item-hist' : '');
            rows.push(React.createElement('li', {
              key: item.key,
              'data-nav-key': item.key,
              className: classes,
              title: item.text,
              onClick: (function (it, idx) { return function () { jump(it, idx); }; })(item, i),
            },
              React.createElement('span', { className: 'mnv-item-top' },
                React.createElement('span', { className: 'mnv-item-idx' }, '#' + (indexByKey.get(item.key) + 1)),
                React.createElement('span', { className: 'mnv-item-time' }, timeStr(item.time)),
                item.inWindow === false
                  ? React.createElement('span', { className: 'mnv-item-tag' }, '历史')
                  : null,
              ),
              React.createElement('span', { className: 'mnv-item-text' }, item.text),
            ));
          }
          listChildren = React.createElement('ul', { className: 'mnv-list' }, rows);
        }
        children.push(listChildren);

        children.push(React.createElement('div', { className: 'mnv-footer' },
          React.createElement('span', null, items.length > 0 ? '第 ' + (activeIndex + 1) + ' / ' + items.length + ' 条' : '—'),
          React.createElement('span', null, '共 ' + fullList.length + ' 条 · 已加载 ' + inWindowCount + ' 条（点历史条目自动加载）'),
        ));

        return React.createElement('div', {
          className: 'mnv-panel',
          style: { right: (edgeRight + 6) + 'px' },
          tabIndex: 0,
          role: 'navigation',
          'aria-label': '消息导航器',
          ref: function (el) { panelEl = el; },
          onKeyDown: onKeyDown,
        }, children);
      }

      // ---------- 槽位注册 ----------
      slots.inject('conversation.session.header.utilities', function () {
        return slots.register(
          { name: 'conversation.session.header.utilities', id: 'message-navigator-toggle', order: 100, label: '消息导航' },
          function (props) {
            return React.createElement(NavToggle, {
              store: store,
              useSession: props.useSession,
              sessionId: props.sessionId,
            });
          },
        );
      });

      slots.inject('shell.overlay', function () {
        return slots.register(
          { name: 'shell.overlay', id: 'message-navigator-panel', order: 100, label: '消息导航器' },
          function () {
            return React.createElement(NavPanel, { store: store });
          },
        );
      });
    }

    exports.name = 'message-navigator';
    exports.apply = apply;
    return module.exports;
  },
});
