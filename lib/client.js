window.__ModuleLoader__.load({
	id: "dsh-message-navigator",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/core.ts
		function clamp(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}
		/** Keeps short conversations compact and compresses only when the rail fills. */
		function compactPositions(count, height, preferredGap = 20, edgeInset = 0) {
			if (count <= 0 || height <= 0) return [];
			if (count === 1) return [height / 2];
			const usableHeight = height - clamp(edgeInset, 0, height / 2) * 2;
			const gap = Math.min(preferredGap, usableHeight / (count - 1));
			const start = (height - gap * (count - 1)) / 2;
			return Array.from({ length: count }, (_, index) => start + gap * index);
		}
		function isHumanMessageKind(value) {
			return value === "user" || value === "steering";
		}
		/** Picks the message nearest the upper reading band, preferring visible rows. */
		function chooseActiveIndex(rows, viewportTop, viewportBottom) {
			if (rows.length === 0) return -1;
			const readingLine = viewportTop + Math.min(220, Math.max(56, (viewportBottom - viewportTop) * .3));
			const visible = rows.map((row, index) => ({
				row,
				index
			})).filter(({ row }) => row.bottom > viewportTop && row.top < viewportBottom);
			const candidates = visible.length > 0 ? visible : rows.map((row, index) => ({
				row,
				index
			}));
			let winner = candidates[0]?.index ?? 0;
			let distance = Number.POSITIVE_INFINITY;
			for (const candidate of candidates) {
				const rowCenter = (candidate.row.top + candidate.row.bottom) / 2;
				const nextDistance = Math.abs(rowCenter - readingLine);
				if (nextDistance < distance) {
					winner = candidate.index;
					distance = nextDistance;
				}
			}
			return winner;
		}
		function markerWidth(active) {
			return active ? 52 : 12;
		}
		function shortenPreview(value, limit = 220) {
			const normalized = value.replace(/\s+/g, " ").trim();
			if (normalized.length <= limit) return normalized;
			return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
		}
		//#endregion
		//#region src/client/dom.ts
		const FLOW_SELECTOR = "[data-chat-flow]";
		const COMPOSER_SELECTOR = "[data-composer-seat]";
		const SCROLL_SELECTOR = "[data-conversation-scroll]";
		const ANCHOR_SELECTOR = "[data-chat-anchor-key]";
		const EMPTY = {
			scrollport: null,
			items: [],
			activeIndex: -1,
			left: 0,
			top: 0,
			height: 0,
			previewLeft: 0
		};
		const previewCache = /* @__PURE__ */ new WeakMap();
		function isVisible(element) {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
		}
		function currentScrollport() {
			return [...document.querySelectorAll(SCROLL_SELECTOR)].find((element) => isVisible(element) && element.querySelector("[data-chat-flow]") !== null) ?? null;
		}
		function visibleText(row) {
			const cached = previewCache.get(row);
			if (cached !== void 0) return cached;
			const preview = shortenPreview(row.innerText || row.textContent || "") || "你的问题";
			previewCache.set(row, preview);
			return preview;
		}
		/** Invalidates only rows touched by a stream/content mutation. */
		function invalidatePreviews(mutations) {
			for (const mutation of mutations) {
				const row = (mutation.target instanceof HTMLElement ? mutation.target : mutation.target.parentElement)?.closest(ANCHOR_SELECTOR);
				if (row !== null && row !== void 0) previewCache.delete(row);
			}
		}
		function buildSnapshot(scrollport, railHeight) {
			const flow = scrollport.querySelector(FLOW_SELECTOR);
			const overlay = document.querySelector("[data-shell-overlay]");
			if (flow === null || overlay === null) return EMPTY;
			const viewport = scrollport.getBoundingClientRect();
			if (viewport.width < 600) return EMPTY;
			const overlayRect = overlay.getBoundingClientRect();
			const visibleBottom = scrollport.querySelector("[data-composer-seat]")?.getBoundingClientRect().top ?? viewport.bottom;
			const seenKeys = /* @__PURE__ */ new Set();
			const items = [...flow.querySelectorAll(ANCHOR_SELECTOR)].filter((element) => {
				if (!isVisible(element)) return false;
				if (!isHumanMessageKind(element.dataset.chatFlowKind)) return false;
				const parentHumanRow = element.parentElement?.closest(ANCHOR_SELECTOR);
				if (parentHumanRow !== null && parentHumanRow !== void 0 && flow.contains(parentHumanRow) && isHumanMessageKind(parentHumanRow.dataset.chatFlowKind)) return false;
				const key = element.dataset.chatAnchorKey?.trim();
				if (key === void 0 || key === "") return true;
				if (seenKeys.has(key)) return false;
				seenKeys.add(key);
				return true;
			}).map((element, index) => {
				const rect = element.getBoundingClientRect();
				const anchorKey = element.dataset.chatAnchorKey?.trim();
				return {
					key: anchorKey === void 0 || anchorKey === "" ? `user-message-${index + 1}` : anchorKey,
					element,
					preview: visibleText(element),
					top: rect.top,
					bottom: rect.bottom
				};
			});
			const activeIndex = chooseActiveIndex(items, viewport.top, visibleBottom);
			const desiredHeight = Math.max(80, Math.min(720, viewport.height - 96));
			const height = railHeight > 0 ? Math.min(railHeight, desiredHeight) : desiredHeight;
			const top = viewport.top - overlayRect.top + Math.max(48, (viewport.height - height) / 2);
			const left = viewport.left - overlayRect.left + 24;
			return {
				scrollport,
				items,
				activeIndex,
				left,
				top,
				height,
				previewLeft: overlayRect.left + left + 76
			};
		}
		function sameSnapshot(left, right) {
			if (left.scrollport !== right.scrollport || left.activeIndex !== right.activeIndex || left.items.length !== right.items.length) return false;
			if (Math.abs(left.left - right.left) > .5 || Math.abs(left.top - right.top) > .5 || Math.abs(left.height - right.height) > .5) return false;
			return left.items.every((item, index) => {
				const other = right.items[index];
				return other !== void 0 && item.key === other.key && item.preview === other.preview && Math.abs(item.top - other.top) < .5 && Math.abs(item.bottom - other.bottom) < .5;
			});
		}
		//#endregion
		//#region src/client/history.ts
		function nextPaint() {
			return new Promise((resolve) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						resolve();
					});
				});
			});
		}
		function captureScrollAnchor() {
			const scrollport = currentScrollport();
			if (scrollport === null) return null;
			const flow = scrollport.querySelector(FLOW_SELECTOR);
			if (flow === null) return null;
			const viewport = scrollport.getBoundingClientRect();
			const rows = [...flow.querySelectorAll(ANCHOR_SELECTOR)];
			const row = rows.find((candidate) => {
				const rect = candidate.getBoundingClientRect();
				return rect.bottom > viewport.top && rect.top < viewport.bottom;
			}) ?? rows[0];
			const key = row?.dataset.chatAnchorKey;
			if (row === void 0 || key === void 0) return null;
			return {
				scrollport,
				key,
				viewportTop: row.getBoundingClientRect().top
			};
		}
		function restoreScrollAnchor(anchor) {
			if (anchor === null || !anchor.scrollport.isConnected) return;
			const row = [...anchor.scrollport.querySelectorAll(ANCHOR_SELECTOR)].find((candidate) => candidate.dataset.chatAnchorKey === anchor.key);
			if (row === void 0) return;
			const delta = row.getBoundingClientRect().top - anchor.viewportTop;
			if (Math.abs(delta) > .5) anchor.scrollport.scrollTop += delta;
		}
		/** Loads the complete transcript so every human turn can be counted and jumped to. */
		async function loadCompleteHistory(session, isCancelled) {
			let attempts = 0;
			let stagnantPages = 0;
			while (!isCancelled() && attempts < 100) {
				const before = session.getSnapshot();
				if (before.openState !== "open" || !before.hasMore) return;
				if (before.loadingOlder) {
					await nextPaint();
					continue;
				}
				const firstKey = before.chat.order[0];
				const anchor = captureScrollAnchor();
				await session.loadOlder();
				attempts += 1;
				await nextPaint();
				if (isCancelled()) return;
				restoreScrollAnchor(anchor);
				const after = session.getSnapshot();
				stagnantPages = after.chat.order[0] !== firstKey || !after.hasMore ? 0 : stagnantPages + 1;
				if (after.openError !== null || stagnantPages >= 3) return;
			}
		}
		//#endregion
		//#region src/client/styles.ts
		const styles = String.raw`
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
`;
		//#endregion
		//#region src/client/MessageNavigator.tsx
		function MessageNavigator({ session }) {
			const [snapshot, setSnapshot] = (0, react.useState)(EMPTY);
			const [hoveredIndex, setHoveredIndex] = (0, react.useState)(null);
			const [readySession, setReadySession] = (0, react.useState)(null);
			const railRef = (0, react.useRef)(null);
			const markerRefs = (0, react.useRef)([]);
			const snapshotRef = (0, react.useRef)(snapshot);
			snapshotRef.current = snapshot;
			const subscribeToSession = (0, react.useCallback)((listener) => session?.subscribe(listener) ?? (() => {}), [session]);
			const readOpenState = (0, react.useCallback)(() => session?.getSnapshot().openState ?? "cold", [session]);
			const openState = (0, react.useSyncExternalStore)(subscribeToSession, readOpenState, readOpenState);
			(0, react.useEffect)(() => {
				let cancelled = false;
				setReadySession(null);
				if (session === void 0 || openState !== "open") return () => {
					cancelled = true;
				};
				if (!session.getSnapshot().hasMore) {
					setReadySession(session);
					return () => {
						cancelled = true;
					};
				}
				loadCompleteHistory(session, () => cancelled).finally(() => {
					if (!cancelled) setReadySession(session);
				});
				return () => {
					cancelled = true;
				};
			}, [openState, session]);
			(0, react.useLayoutEffect)(() => {
				let frame = null;
				let boundScrollport = null;
				let scrollCleanup = () => {};
				let contentObserver = null;
				let sizeObserver = null;
				const commit = () => {
					frame = null;
					const scrollport = currentScrollport();
					if (scrollport === null) {
						setSnapshot((previous) => previous.items.length === 0 ? previous : EMPTY);
						return;
					}
					if (boundScrollport !== scrollport) bind(scrollport);
					const next = buildSnapshot(scrollport, railRef.current?.getBoundingClientRect().height ?? 0);
					setSnapshot((previous) => sameSnapshot(previous, next) ? previous : next);
				};
				const schedule = () => {
					if (frame === null) frame = requestAnimationFrame(commit);
				};
				const unbind = () => {
					scrollCleanup();
					contentObserver?.disconnect();
					sizeObserver?.disconnect();
					scrollCleanup = () => {};
					contentObserver = null;
					sizeObserver = null;
				};
				const bind = (scrollport) => {
					unbind();
					boundScrollport = scrollport;
					scrollport.addEventListener("scroll", schedule, { passive: true });
					scrollCleanup = () => {
						scrollport.removeEventListener("scroll", schedule);
					};
					const flow = scrollport.querySelector(FLOW_SELECTOR);
					if (flow !== null) {
						contentObserver = new MutationObserver((mutations) => {
							invalidatePreviews(mutations);
							schedule();
						});
						contentObserver.observe(flow, {
							childList: true,
							subtree: true,
							characterData: true,
							attributes: true,
							attributeFilter: ["data-chat-flow-kind"]
						});
						if (typeof ResizeObserver !== "undefined") {
							sizeObserver = new ResizeObserver(schedule);
							sizeObserver.observe(scrollport);
							sizeObserver.observe(flow);
							const composer = scrollport.querySelector(COMPOSER_SELECTOR);
							if (composer !== null) sizeObserver.observe(composer);
						}
					}
				};
				const shellObserver = new MutationObserver(schedule);
				shellObserver.observe(document.body, {
					childList: true,
					subtree: true
				});
				window.addEventListener("resize", schedule, { passive: true });
				schedule();
				return () => {
					if (frame !== null) cancelAnimationFrame(frame);
					unbind();
					shellObserver.disconnect();
					window.removeEventListener("resize", schedule);
				};
			}, []);
			(0, react.useEffect)(() => {
				if (hoveredIndex !== null && hoveredIndex >= snapshot.items.length) setHoveredIndex(null);
			}, [hoveredIndex, snapshot.items.length]);
			const hitHeight = Math.max(6, Math.min(14, snapshot.height / Math.max(1, snapshot.items.length)));
			const positions = (0, react.useMemo)(() => compactPositions(snapshot.items.length, snapshot.height, 20, hitHeight / 2), [
				hitHeight,
				snapshot.height,
				snapshot.items.length
			]);
			const jumpTo = (0, react.useCallback)((index) => {
				const current = snapshotRef.current;
				const item = current.items[index];
				const scrollport = current.scrollport;
				if (item === void 0 || scrollport === null) return;
				const viewport = scrollport.getBoundingClientRect();
				const row = item.element.getBoundingClientRect();
				const offset = Math.min(110, viewport.height * .16);
				const top = scrollport.scrollTop + row.top - viewport.top - offset;
				const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
				scrollport.scrollTo({
					top,
					behavior: reducedMotion ? "auto" : "smooth"
				});
			}, []);
			const onMarkerKeyDown = (0, react.useCallback)((event, index) => {
				let target = null;
				if (event.key === "ArrowDown" || event.key === "ArrowRight") target = Math.min(snapshot.items.length - 1, index + 1);
				if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = Math.max(0, index - 1);
				if (event.key === "Home") target = 0;
				if (event.key === "End") target = snapshot.items.length - 1;
				if (target === null) return;
				event.preventDefault();
				markerRefs.current[target]?.focus();
				setHoveredIndex(target);
			}, [snapshot.items.length]);
			const onNavigatorBlur = (0, react.useCallback)((event) => {
				const next = event.relatedTarget;
				const navigator = event.currentTarget.closest(".dsh-message-navigator");
				if (!(next instanceof Node) || navigator === null || !navigator.contains(next)) setHoveredIndex(null);
			}, []);
			if (!(session === void 0 || readySession === session) || snapshot.items.length === 0 || snapshot.height < 80) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", {
				"data-dsh-message-navigator": "",
				children: styles
			});
			const previewIndex = hoveredIndex ?? snapshot.activeIndex;
			const preview = snapshot.items[previewIndex];
			const previewPosition = positions[previewIndex] ?? 0;
			const rootStyle = {
				left: snapshot.left,
				top: snapshot.top,
				height: snapshot.height,
				"--mn-preview-left": `${snapshot.previewLeft}px`
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", {
				"data-dsh-message-navigator": "",
				children: styles
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
				className: "dsh-message-navigator",
				style: rootStyle,
				"aria-label": "消息导航器",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: railRef,
					className: "dsh-message-navigator__rail",
					onMouseLeave: () => {
						setHoveredIndex(null);
					},
					children: [snapshot.items.map((item, index) => {
						const active = index === snapshot.activeIndex;
						const markerStyle = {
							top: positions[index] ?? 0,
							"--mn-width": `${markerWidth(active)}px`,
							"--mn-hit-height": `${hitHeight}px`
						};
						const summary = item.preview.length > 72 ? `${item.preview.slice(0, 71)}…` : item.preview;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							ref: (node) => {
								markerRefs.current[index] = node;
							},
							type: "button",
							className: "dsh-message-navigator__marker",
							style: markerStyle,
							"data-active": active ? "true" : void 0,
							"aria-current": active ? "location" : void 0,
							"aria-label": `${index + 1}/${snapshot.items.length}，你的问题：${summary}`,
							onClick: () => {
								jumpTo(index);
							},
							onFocus: () => {
								setHoveredIndex(index);
							},
							onBlur: onNavigatorBlur,
							onMouseEnter: () => {
								setHoveredIndex(index);
							},
							onKeyDown: (event) => {
								onMarkerKeyDown(event, index);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-message-navigator__line",
								"aria-hidden": "true"
							})
						}, item.key);
					}), preview !== void 0 && hoveredIndex !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsh-message-navigator__preview",
						style: { top: Math.max(0, Math.min(snapshot.height - 148, previewPosition - 48)) },
						"aria-label": `跳转到第 ${previewIndex + 1} 个问题：${preview.preview}`,
						onClick: () => {
							jumpTo(previewIndex);
						},
						onFocus: () => {
							setHoveredIndex(previewIndex);
						},
						onBlur: onNavigatorBlur,
						onMouseEnter: () => {
							setHoveredIndex(previewIndex);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-message-navigator__preview-label",
							children: [
								"你的问题 · ",
								previewIndex + 1,
								"/",
								snapshot.items.length
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-message-navigator__preview-text",
							children: preview.preview
						})]
					})]
				})
			})] });
		}
		//#endregion
		//#region src/client/index.tsx
		/** Services required before the browser half is applied. */
		const inject = ["slots", "sessions"];
		/** Registers after ui-layout declares the shell overlay slot. */
		function apply(ctx) {
			function NavigatorEntry({ useSessions }) {
				const sessionId = useSessions((state) => state.current);
				const session = sessionId === void 0 ? void 0 : ctx.sessions.binding(sessionId)?.session;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageNavigator, { session });
			}
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "message-navigator",
				order: 20
			}, NavigatorEntry));
		}
		//#endregion
		exports.MessageNavigator = MessageNavigator;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map