export type Platform = 'tiktok' | 'instagram' | 'youtube'

export type AccountStatus = 'linked' | 'expired' | 'revoked' | 'unknown'

export type MediaAvailability = 'local' | 'cloud' | 'missing'

export type ScheduleStatus =
  | 'scheduled'
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'failed'
  | 'cancelled'

export type MediaSource = 'camera' | 'library' | 'files'

export interface AccountLink {
  id: string
  platform: Platform
  status: AccountStatus
  linkedAt: string
  updatedAt: string
}

export interface MediaItem {
  id: string
  createdAt: string
  updatedAt: string
  localUri?: string
  remoteUri?: string
  fileName?: string
  durationSeconds?: number
  sizeBytes?: number
  thumbnailUri?: string
  availability: MediaAvailability
  source: MediaSource
  checksum?: string
}

export interface ScheduleItem {
  id: string
  createdAt: string
  updatedAt: string
  mediaId: string
  platform: Platform
  scheduledAt: string
  status: ScheduleStatus
  title: string
  description: string
  hashtags: string[]
  lastAttemptAt?: string
  errorMessage?: string
  notificationId?: string
}

export interface UploadJob {
  id: string
  createdAt: string
  updatedAt: string
  scheduleId: string
  platform: Platform
  payload: {
    title: string
    description: string
    hashtags: string[]
  }
}
