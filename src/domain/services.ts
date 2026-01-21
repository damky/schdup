import { AccountLink, Platform, ScheduleItem } from './models'

export interface AuthService {
  linkAccount(platform: Platform): Promise<AccountLink>
  unlinkAccount(platform: Platform): Promise<void>
  getToken(platform: Platform): Promise<string | null>
}

export interface SchedulerService {
  scheduleReminder(schedule: ScheduleItem): Promise<string | null>
  cancelReminder(notificationId: string): Promise<void>
  ensurePermissions(): Promise<boolean>
}

export interface UploadService {
  uploadSchedule(schedule: ScheduleItem): Promise<void>
}
