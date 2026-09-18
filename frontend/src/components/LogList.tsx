import { relativeLogTime } from '../lib/dates'
import { roleLabel } from '../lib/roles'
import type { ActivityLog } from '../types'
import { PixelEmoji } from './PixelEmoji'

export function LogList({ logs }: { logs: ActivityLog[] }) {
  if (!logs.length) {
    return <p className="empty">NO LOGS YET. ADD A QUEST.</p>
  }
  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id}>
          <PixelEmoji emoji={log.actorRole === 'gf' ? '💖' : '🩵'} size="sm" motion="pulse" />
          <div>
            <b>
              {log.actorName} · {roleLabel(log.actorRole)}
            </b>
            <p>{log.message}</p>
          </div>
          <time>{relativeLogTime(log.createdAt)}</time>
        </li>
      ))}
    </ul>
  )
}
