import type { CoupleEvent } from '../types'

export const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

export function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - x.getDay())
  return x
}

export function addWeeks(d: Date, n: number) {
  return addDays(startOfWeek(d), n * 7)
}

export function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' }).toUpperCase()
}

export function weekRangeLabel(d: Date) {
  const start = startOfWeek(d)
  const end = addDays(start, 6)
  const a = start.toLocaleString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()
  const b = end.toLocaleString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()
  return `${a} — ${b}`
}

export function monthGrid(d: Date) {
  const first = startOfMonth(d)
  const start = startOfWeek(first)
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i))
  return cells
}

export function weekDays(d: Date) {
  const start = startOfWeek(d)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function eventStart(ev: Pick<CoupleEvent, 'date' | 'hour'>) {
  if (ev.hour) return new Date(`${ev.date}T${ev.hour}:00`)
  return new Date(`${ev.date}T00:00:00`)
}

export function eventEnd(ev: Pick<CoupleEvent, 'date' | 'hour'>) {
  if (ev.hour) return new Date(`${ev.date}T${ev.hour}:00`)
  return new Date(`${ev.date}T23:59:59`)
}

export function eventIsPast(ev: Pick<CoupleEvent, 'date' | 'hour'>, now = Date.now()) {
  return eventEnd(ev).getTime() < now
}

export function countdownParts(target: number, now = Date.now()) {
  const diff = Math.max(0, target - now)
  const sec = Math.floor(diff / 1000)
  return {
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    done: diff <= 0,
  }
}

export function formatWhen(ev: Pick<CoupleEvent, 'date' | 'hour'>) {
  const d = parseISODate(ev.date)
  const day = d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  return ev.hour ? `${day} · ${ev.hour}` : `${day} · ALL DAY`
}

export function relativeLogTime(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'NOW'
  if (mins < 60) return `${mins}M AGO`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}H AGO`
  const days = Math.floor(hrs / 24)
  return `${days}D AGO`
}
