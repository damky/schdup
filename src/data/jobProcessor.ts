import { ScheduleItem } from '../domain/models'
import { localScheduleRepository } from './localScheduleRepository'
import { localUploadService } from './localUploadService'
import { isPast, nowIso } from '../utils/date'

export const processDueSchedules = async () => {
  const schedules = await localScheduleRepository.list()
  const due = schedules.filter(
    (schedule) => schedule.status === 'scheduled' && isPast(schedule.scheduledAt)
  )

  for (const schedule of due) {
    const next: ScheduleItem = {
      ...schedule,
      status: 'queued',
      updatedAt: nowIso(),
    }
    await localScheduleRepository.update(next)
    await localUploadService.uploadSchedule(next)
  }
}
