import AsyncStorage from '@react-native-async-storage/async-storage'

export const STORAGE_KEYS = {
  accounts: 'accounts',
  mediaItems: 'media_items',
  scheduleItems: 'schedule_items',
  uploadInterval: 'upload_interval',
}

export const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) {
    return fallback
  }
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    return fallback
  }
}

export const writeJson = async <T>(key: string, value: T): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}
