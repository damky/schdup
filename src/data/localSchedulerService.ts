import * as Notifications from 'expo-notifications'
import { SchedulerService } from '../domain/services'
import { ScheduleItem } from '../domain/models'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export const localSchedulerService: SchedulerService = {
  ensurePermissions: async () => {
    const settings = await Notifications.getPermissionsAsync()
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      settings.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true
    }

    const request = await Notifications.requestPermissionsAsync()
    return (
      request.granted ||
      request.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    )
  },
  scheduleReminder: async (schedule: ScheduleItem) => {
    const granted = await localSchedulerService.ensurePermissions()
    if (!granted) {
      return null
    }

    const triggerDate = new Date(schedule.scheduledAt)
    if (Number.isNaN(triggerDate.getTime())) {
      return null
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Scheduled upload due',
        body: `${schedule.platform.toUpperCase()} upload is ready to send.`,
      },
      trigger: triggerDate,
    })

    return notificationId
  },
  cancelReminder: async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  },
}
