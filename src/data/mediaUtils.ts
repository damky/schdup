import * as FileSystem from 'expo-file-system'
import { MediaAvailability, MediaItem, MediaSource } from '../domain/models'
import { generateId } from '../utils/id'
import { nowIso } from '../utils/date'

type MediaInput = {
  uri: string
  fileName?: string | null
  durationMs?: number | null
  sizeBytes?: number | null
  source: MediaSource
}

export const buildMediaItem = async ({
  uri,
  fileName,
  durationMs,
  sizeBytes,
  source,
}: MediaInput): Promise<MediaItem> => {
  const info = await FileSystem.getInfoAsync(uri)
  const actualSize = sizeBytes ?? (info.exists ? info.size : undefined)
  const now = nowIso()

  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    localUri: uri,
    fileName: fileName ?? undefined,
    durationSeconds: durationMs ? Math.round(durationMs / 1000) : undefined,
    sizeBytes: actualSize,
    availability: info.exists ? 'local' : 'missing',
    source,
  }
}

export const refreshMediaAvailability = async (
  item: MediaItem
): Promise<MediaAvailability> => {
  if (item.localUri) {
    const info = await FileSystem.getInfoAsync(item.localUri)
    if (info.exists) {
      return 'local'
    }
  }

  if (item.remoteUri) {
    return 'cloud'
  }

  return 'missing'
}
