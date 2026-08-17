import type { Context } from '@deepseek-ai/cordis'
import type { GlobalStandardProps } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { MessageNavigator } from './MessageNavigator.tsx'

/** Services required before the browser half is applied. */
export const inject = ['slots', 'sessions']

/** Registers after ui-layout declares the shell overlay slot. */
export function apply(ctx: Context): void {
  function NavigatorEntry({ useSessions }: GlobalStandardProps) {
    const sessionId = useSessions(state => state.current)
    const session = sessionId === undefined ? undefined : ctx.sessions.binding(sessionId)?.session
    return <MessageNavigator session={session} />
  }

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'message-navigator',
    order: 20,
  }, NavigatorEntry))
}

export { MessageNavigator }
