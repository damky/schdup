import React, { useCallback, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Calendar } from 'react-native-calendars'
import DateTimePicker from '@react-native-community/datetimepicker'
import Screen from '../components/Screen'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { localMediaRepository } from '../src/data/localMediaRepository'
import { localScheduleRepository } from '../src/data/localScheduleRepository'
import { localIntervalRepository } from '../src/data/localIntervalRepository'
import { MediaItem, ScheduleItem, UploadInterval } from '../src/domain/models'
import {
  buildOccurrences,
  parseTimeKey,
  toDateKey,
  toTimeKey,
} from '../src/utils/date'

type CalendarEntry = {
  id: string
  scheduledAt: string
  media: MediaItem | null
  status: ScheduleItem['status'] | 'tentative'
  missingMetadata: boolean
  source: 'scheduled' | 'tentative'
}

const DOT_COLORS = {
  success: '#34C759',
  danger: '#FF3B30',
  neutral: '#8E8E93',
  warning: '#FFCC00',
}

const DAY_OPTIONS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

const getMissingMetadata = (schedule: ScheduleItem) =>
  schedule.title.trim().length === 0 ||
  schedule.description.trim().length === 0 ||
  schedule.hashtags.length === 0

const getDotTone = (entry: CalendarEntry) => {
  if (entry.status === 'uploaded') {
    return 'success'
  }
  if (entry.status === 'failed') {
    return 'danger'
  }
  return entry.missingMetadata ? 'warning' : 'neutral'
}

const formatTimeLabel = (timeKey: string) => {
  const { hours, minutes } = parseTimeKey(timeKey)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function ScheduleScreen() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [interval, setInterval] = useState<UploadInterval>(
    localIntervalRepository.getDefault()
  )
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [savingInterval, setSavingInterval] = useState(false)

  const loadData = useCallback(async () => {
    const [media, scheduleItems, intervalSettings] = await Promise.all([
      localMediaRepository.list(),
      localScheduleRepository.list(),
      localIntervalRepository.get(),
    ])
    setMediaItems(media)
    setSchedules(scheduleItems)
    setInterval(intervalSettings)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const { markedDates, selectedEntries } = useMemo(() => {
    const mediaById = new Map(mediaItems.map((item) => [item.id, item]))
    const schedulesByMedia = schedules.reduce<Record<string, ScheduleItem[]>>(
      (acc, schedule) => {
        if (!acc[schedule.mediaId]) {
          acc[schedule.mediaId] = []
        }
        acc[schedule.mediaId].push(schedule)
        return acc
      },
      {}
    )

    const scheduledEntries: CalendarEntry[] = schedules.map((schedule) => ({
      id: schedule.id,
      scheduledAt: schedule.scheduledAt,
      media: mediaById.get(schedule.mediaId) ?? null,
      status: schedule.status,
      missingMetadata: getMissingMetadata(schedule),
      source: 'scheduled',
    }))

    const occupiedKeys = new Set(
      scheduledEntries.map((entry) => {
        const date = new Date(entry.scheduledAt)
        return `${toDateKey(date)} ${toTimeKey(date)}`
      })
    )

    const unscheduledMedia = mediaItems.filter(
      (item) => !schedulesByMedia[item.id] || schedulesByMedia[item.id].length === 0
    )

    const tentativeTimes = buildOccurrences(
      interval,
      unscheduledMedia.length,
      new Date(),
      occupiedKeys
    )

    const tentativeEntries: CalendarEntry[] = tentativeTimes.map(
      (scheduledAt, index) => {
        const media = unscheduledMedia[index] ?? null
        return {
          id: `tentative-${media?.id ?? index}`,
          scheduledAt,
          media,
          status: 'tentative',
          missingMetadata: true,
          source: 'tentative',
        }
      }
    )

    const allEntries = [...scheduledEntries, ...tentativeEntries]
    const marked: Record<
      string,
      { dots: { key: string; color: string }[]; selected?: boolean }
    > = {}

    allEntries.forEach((entry) => {
      const dateKey = toDateKey(new Date(entry.scheduledAt))
      if (!marked[dateKey]) {
        marked[dateKey] = { dots: [] }
      }
      const tone = getDotTone(entry)
      if (!marked[dateKey].dots.some((dot) => dot.key === tone)) {
        marked[dateKey].dots.push({ key: tone, color: DOT_COLORS[tone] })
      }
    })

    if (!marked[selectedDate]) {
      marked[selectedDate] = { dots: [] }
    }
    marked[selectedDate].selected = true

    const selectedDayEntries = allEntries.filter(
      (entry) => toDateKey(new Date(entry.scheduledAt)) === selectedDate
    )

    return {
      markedDates: marked,
      selectedEntries: selectedDayEntries,
    }
  }, [interval, mediaItems, schedules, selectedDate])

  const handleAddTime = (_: unknown, date?: Date) => {
    setShowTimePicker(false)
    if (!date) {
      return
    }
    const timeKey = toTimeKey(date)
    setInterval((prev) => {
      if (prev.times.includes(timeKey)) {
        return prev
      }
      return {
        ...prev,
        times: [...prev.times, timeKey].sort(),
      }
    })
  }

  const toggleDay = (day: number) => {
    setInterval((prev) => {
      const exists = prev.daysOfWeek.includes(day)
      const nextDays = exists
        ? prev.daysOfWeek.filter((value) => value !== day)
        : [...prev.daysOfWeek, day].sort()
      return {
        ...prev,
        daysOfWeek: nextDays,
      }
    })
  }

  const handleSaveInterval = async () => {
    setSavingInterval(true)
    await localIntervalRepository.set(interval)
    setSavingInterval(false)
  }

  const handleResetInterval = async () => {
    const defaultInterval = localIntervalRepository.getDefault()
    setInterval(defaultInterval)
    setSavingInterval(true)
    await localIntervalRepository.set(defaultInterval)
    setSavingInterval(false)
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Schedule heads-up</Text>
        <Text style={styles.subtitle}>
          Your backlog is tentatively scheduled based on the interval below. Confirm
          items that are ready to go.
        </Text>

        <View style={styles.calendarCard}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
              textSectionTitleColor: '#8E8E93',
            }}
          />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: DOT_COLORS.success }]} />
            <Text style={styles.legendText}>Uploaded</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: DOT_COLORS.danger }]} />
            <Text style={styles.legendText}>Failed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: DOT_COLORS.neutral }]} />
            <Text style={styles.legendText}>Ready</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: DOT_COLORS.warning }]} />
            <Text style={styles.legendText}>Needs attention</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Interval settings</Text>
        <Text style={styles.sectionSubtitle}>
          Pick the days and times you want uploads to go out.
        </Text>
        <View style={styles.dayRow}>
          {DAY_OPTIONS.map((option) => {
            const selected = interval.daysOfWeek.includes(option.value)
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.dayChip, selected && styles.dayChipSelected]}
                onPress={() => toggleDay(option.value)}
              >
                <Text
                  style={[styles.dayText, selected && styles.dayTextSelected]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.subSectionTitle}>Times</Text>
        {interval.times.length === 0 ? (
          <Text style={styles.emptyText}>Add at least one time slot.</Text>
        ) : (
          <View style={styles.timeList}>
            {interval.times.map((time) => (
              <View key={time} style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTimeLabel(time)}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setInterval((prev) => ({
                      ...prev,
                      times: prev.times.filter((value) => value !== time),
                    }))
                  }
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Button
          title="Add time"
          variant="outline"
          onPress={() => setShowTimePicker(true)}
        />
        {showTimePicker && (
          <DateTimePicker value={new Date()} mode="time" onChange={handleAddTime} />
        )}

        <View style={styles.intervalActions}>
          <Button
            title={savingInterval ? 'Saving...' : 'Save interval'}
            onPress={handleSaveInterval}
            disabled={savingInterval}
          />
          <Button
            title="Use default"
            variant="outline"
            onPress={handleResetInterval}
            disabled={savingInterval}
          />
        </View>

        <Text style={styles.sectionTitle}>Selected day</Text>
        <Text style={styles.sectionSubtitle}>
          {selectedDate} · {selectedEntries.length} items
        </Text>
        {selectedEntries.length === 0 ? (
          <Text style={styles.emptyText}>No uploads scheduled for this day.</Text>
        ) : (
          <View style={styles.entryList}>
            {selectedEntries.map((entry) => {
              const timeLabel = new Date(entry.scheduledAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })
              const title = entry.media?.fileName ?? 'Untitled video'
              const badgeTone = getDotTone(entry)
              const badgeLabel =
                entry.status === 'uploaded'
                  ? 'Uploaded'
                  : entry.status === 'failed'
                    ? 'Failed'
                    : entry.missingMetadata
                      ? 'Needs attention'
                      : 'Ready'
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{title}</Text>
                    <Badge label={badgeLabel} tone={badgeTone} />
                  </View>
                  <Text style={styles.entryMeta}>
                    {entry.source === 'tentative' ? 'Tentative' : 'Scheduled'} ·{' '}
                    {timeLabel}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#3A3A3C',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#636366',
    marginBottom: 10,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  dayChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EAF3FF',
  },
  dayText: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#1C1C1E',
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  timeList: {
    gap: 8,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  timeText: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  removeText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  intervalActions: {
    gap: 8,
    marginTop: 12,
  },
  entryList: {
    gap: 10,
  },
  entryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  entryMeta: {
    fontSize: 12,
    color: '#636366',
  },
})
