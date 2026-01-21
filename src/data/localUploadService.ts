import { UploadService } from '../domain/services'
import { ScheduleItem } from '../domain/models'
import { localMediaRepository } from './localMediaRepository'
import { localScheduleRepository } from './localScheduleRepository'
import { localAuthService } from './localAuthService'
import { nowIso } from '../utils/date'
import { refreshMediaAvailability } from './mediaUtils'

export const localUploadService: UploadService = {
  uploadSchedule: async (schedule: ScheduleItem) => {
    const media = await localMediaRepository.getById(schedule.mediaId)
    if (!media) {
      await localScheduleRepository.update({
        ...schedule,
        status: 'failed',
        errorMessage: 'Media not found.',
        lastAttemptAt: nowIso(),
        updatedAt: nowIso(),
      })
      return
    }

    const token = await localAuthService.getToken(schedule.platform)
    if (!token) {
      await localScheduleRepository.update({
        ...schedule,
        status: 'failed',
        errorMessage: 'Account not linked.',
        lastAttemptAt: nowIso(),
        updatedAt: nowIso(),
      })
      return
    }

    const availability = await refreshMediaAvailability(media)
    if (availability !== 'local') {
      await localScheduleRepository.update({
        ...schedule,
        status: 'failed',
        errorMessage: 'Media unavailable. Re-download required.',
        lastAttemptAt: nowIso(),
        updatedAt: nowIso(),
      })
      return
    }

    await localScheduleRepository.update({
      ...schedule,
      status: 'uploading',
      lastAttemptAt: nowIso(),
      updatedAt: nowIso(),
    })

    await new Promise((resolve) => setTimeout(resolve, 600))

    await localScheduleRepository.update({
      ...schedule,
      status: 'uploaded',
      lastAttemptAt: nowIso(),
      updatedAt: nowIso(),
      errorMessage: undefined,
    })
  },
}
