import { UploadInterval } from '../domain/models'
import { STORAGE_KEYS, readJson, writeJson } from './storage'

const defaultInterval: UploadInterval = {
  daysOfWeek: [1, 3, 6],
  times: ['10:00'],
}

export const localIntervalRepository = {
  get: async () =>
    readJson<UploadInterval>(STORAGE_KEYS.uploadInterval, defaultInterval),
  set: async (interval: UploadInterval) =>
    writeJson(STORAGE_KEYS.uploadInterval, interval),
  getDefault: () => defaultInterval,
}
