export const nowIso = () => new Date().toISOString()

export const isPast = (iso: string) => new Date(iso).getTime() <= Date.now()

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString()

const pad2 = (value: number) => value.toString().padStart(2, '0')

export const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  return `${year}-${month}-${day}`
}

export const toTimeKey = (date: Date) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`

export const parseTimeKey = (value: string) => {
  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)
  return {
    hours: Number.isFinite(hours) ? hours : 0,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  }
}

export const buildOccurrences = (
  {
    daysOfWeek,
    times,
  }: { daysOfWeek: number[]; times: string[] },
  count: number,
  startDate: Date,
  occupiedKeys: Set<string> = new Set()
) => {
  if (daysOfWeek.length === 0 || times.length === 0 || count <= 0) {
    return []
  }

  const uniqueTimes = Array.from(new Set(times)).sort()
  const results: string[] = []
  const start = new Date(startDate)
  start.setSeconds(0, 0)

  for (let dayOffset = 0; dayOffset < 366; dayOffset += 1) {
    if (results.length >= count) {
      break
    }
    const day = new Date(start)
    day.setDate(start.getDate() + dayOffset)
    if (!daysOfWeek.includes(day.getDay())) {
      continue
    }

    for (const time of uniqueTimes) {
      if (results.length >= count) {
        break
      }
      const { hours, minutes } = parseTimeKey(time)
      const candidate = new Date(day)
      candidate.setHours(hours, minutes, 0, 0)
      if (candidate.getTime() <= start.getTime()) {
        continue
      }
      const dateKey = toDateKey(candidate)
      const timeKey = toTimeKey(candidate)
      const key = `${dateKey} ${timeKey}`
      if (occupiedKeys.has(key)) {
        continue
      }
      results.push(candidate.toISOString())
    }
  }

  return results
}
