import { ScheduleItem } from '../domain/models'
import { ScheduleRepository } from '../domain/repositories'
import { STORAGE_KEYS, readJson, writeJson } from './storage'

const listSchedules = async () =>
  readJson<ScheduleItem[]>(STORAGE_KEYS.scheduleItems, [])

export const localScheduleRepository: ScheduleRepository = {
  list: async () => listSchedules(),
  getById: async (id: string) => {
    const items = await listSchedules()
    return items.find((item) => item.id === id) ?? null
  },
  add: async (item: ScheduleItem) => {
    const items = await listSchedules()
    await writeJson(STORAGE_KEYS.scheduleItems, [...items, item])
  },
  update: async (item: ScheduleItem) => {
    const items = await listSchedules()
    const next = items.map((existing) =>
      existing.id === item.id ? item : existing
    )
    await writeJson(STORAGE_KEYS.scheduleItems, next)
  },
  remove: async (id: string) => {
    const items = await listSchedules()
    await writeJson(
      STORAGE_KEYS.scheduleItems,
      items.filter((item) => item.id !== id)
    )
  },
}
