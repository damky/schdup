import { MediaItem } from '../domain/models'
import { MediaRepository } from '../domain/repositories'
import { STORAGE_KEYS, readJson, writeJson } from './storage'

const listMedia = async () =>
  readJson<MediaItem[]>(STORAGE_KEYS.mediaItems, [])

export const localMediaRepository: MediaRepository = {
  list: async () => listMedia(),
  getById: async (id: string) => {
    const items = await listMedia()
    return items.find((item) => item.id === id) ?? null
  },
  add: async (item: MediaItem) => {
    const items = await listMedia()
    await writeJson(STORAGE_KEYS.mediaItems, [...items, item])
  },
  update: async (item: MediaItem) => {
    const items = await listMedia()
    const next = items.map((existing) =>
      existing.id === item.id ? item : existing
    )
    await writeJson(STORAGE_KEYS.mediaItems, next)
  },
  remove: async (id: string) => {
    const items = await listMedia()
    await writeJson(
      STORAGE_KEYS.mediaItems,
      items.filter((item) => item.id !== id)
    )
  },
}
