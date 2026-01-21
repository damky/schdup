import { AccountLink, MediaItem, ScheduleItem } from './models'

export interface AccountRepository {
  list(): Promise<AccountLink[]>
  getByPlatform(platform: AccountLink['platform']): Promise<AccountLink | null>
  upsert(account: AccountLink): Promise<void>
  remove(platform: AccountLink['platform']): Promise<void>
}

export interface MediaRepository {
  list(): Promise<MediaItem[]>
  getById(id: string): Promise<MediaItem | null>
  add(item: MediaItem): Promise<void>
  update(item: MediaItem): Promise<void>
  remove(id: string): Promise<void>
}

export interface ScheduleRepository {
  list(): Promise<ScheduleItem[]>
  getById(id: string): Promise<ScheduleItem | null>
  add(item: ScheduleItem): Promise<void>
  update(item: ScheduleItem): Promise<void>
  remove(id: string): Promise<void>
}
