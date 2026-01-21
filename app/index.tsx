import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Screen from '../components/Screen'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { localMediaRepository } from '../src/data/localMediaRepository'
import { localScheduleRepository } from '../src/data/localScheduleRepository'
import { localAccountRepository } from '../src/data/localAccountRepository'
import { ScheduleItem } from '../src/domain/models'
import { formatDateTime } from '../src/utils/date'

type UpcomingItem = {
  id: string
  title: string
  platform: ScheduleItem['platform']
  status: ScheduleItem['status']
  scheduledAt: string
}

const statusTone = (status: ScheduleItem['status']) => {
  switch (status) {
    case 'uploaded':
      return 'success'
    case 'failed':
      return 'danger'
    case 'uploading':
    case 'queued':
      return 'warning'
    default:
      return 'neutral'
  }
}

export default function HomeScreen() {
  const router = useRouter()
  const [mediaCount, setMediaCount] = useState(0)
  const [scheduledCount, setScheduledCount] = useState(0)
  const [linkedCount, setLinkedCount] = useState(0)
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([])

  const loadData = useCallback(async () => {
    const [media, schedules, accounts] = await Promise.all([
      localMediaRepository.list(),
      localScheduleRepository.list(),
      localAccountRepository.list(),
    ])

    const now = Date.now()
    const upcomingSchedules = schedules
      .filter(
        (schedule) =>
          new Date(schedule.scheduledAt).getTime() >= now &&
          (schedule.status === 'scheduled' || schedule.status === 'queued')
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      .slice(0, 3)

    const upcomingItems = upcomingSchedules.map((schedule) => {
      const mediaItem = media.find((item) => item.id === schedule.mediaId)
      return {
        id: schedule.id,
        title: mediaItem?.fileName ?? schedule.title ?? 'Untitled upload',
        platform: schedule.platform,
        status: schedule.status,
        scheduledAt: schedule.scheduledAt,
      }
    })

    setMediaCount(media.length)
    setScheduledCount(
      schedules.filter(
        (schedule) =>
          schedule.status === 'scheduled' || schedule.status === 'queued'
      ).length
    )
    setLinkedCount(accounts.filter((account) => account.status === 'linked').length)
    setUpcoming(upcomingItems)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Keep your uploads on track.</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{mediaCount}</Text>
          <Text style={styles.summaryLabel}>Backlog videos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{scheduledCount}</Text>
          <Text style={styles.summaryLabel}>Scheduled</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{linkedCount}</Text>
          <Text style={styles.summaryLabel}>Linked accounts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <Button title="Record" onPress={() => router.push('/capture')} />
          <Button
            title="Schedule"
            variant="secondary"
            onPress={() => router.push('/schedule')}
          />
        </View>
        <View style={styles.actionsRow}>
          <Button
            title="Backlog"
            variant="outline"
            onPress={() => router.push('/backlog')}
          />
          <Button
            title="Accounts"
            variant="outline"
            onPress={() => router.push('/accounts')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming uploads</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No upcoming uploads</Text>
            <Text style={styles.emptySubtitle}>
              Schedule videos to keep your channels active.
            </Text>
          </View>
        ) : (
          upcoming.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Badge
                  label={`${item.platform.toUpperCase()} · ${item.status}`}
                  tone={statusTone(item.status)}
                />
              </View>
              <Text style={styles.scheduleTime}>
                {formatDateTime(item.scheduledAt)}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#636366',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636366',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  scheduleTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#636366',
    marginTop: 6,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 6,
  },
})
