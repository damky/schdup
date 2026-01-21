import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import Screen from '../components/Screen'
import Field from '../components/Field'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { localMediaRepository } from '../src/data/localMediaRepository'
import { localScheduleRepository } from '../src/data/localScheduleRepository'
import { localSchedulerService } from '../src/data/localSchedulerService'
import { MediaItem, Platform, ScheduleItem } from '../src/domain/models'
import { generateId } from '../src/utils/id'
import { nowIso } from '../src/utils/date'
import { PLATFORMS, PLATFORM_LABELS } from '../src/domain/constants'

export default function ScheduleScreen() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('tiktok')
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 3600000))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadMedia = useCallback(async () => {
    const items = await localMediaRepository.list()
    setMediaItems(items)
    if (!selectedMediaId && items[0]) {
      setSelectedMediaId(items[0].id)
    }
  }, [selectedMediaId])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const scheduleDisabled = useMemo(
    () => !selectedMediaId || submitting,
    [selectedMediaId, submitting]
  )

  const handleSchedule = async () => {
    if (!selectedMediaId) {
      return
    }
    setSubmitting(true)
    const now = nowIso()
    const hashtagsList = hashtags
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)

    const schedule: ScheduleItem = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      mediaId: selectedMediaId,
      platform: selectedPlatform,
      scheduledAt: scheduledAt.toISOString(),
      status: 'scheduled',
      title: title.trim(),
      description: description.trim(),
      hashtags: hashtagsList,
    }

    await localScheduleRepository.add(schedule)
    const notificationId = await localSchedulerService.scheduleReminder(schedule)
    if (notificationId) {
      await localScheduleRepository.update({
        ...schedule,
        notificationId,
        updatedAt: nowIso(),
      })
    }

    setTitle('')
    setDescription('')
    setHashtags('')
    setSubmitting(false)
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Pick media</Text>
        {mediaItems.length === 0 ? (
          <Text style={styles.emptyText}>
            Add media from the Capture tab to start scheduling.
          </Text>
        ) : (
          <View style={styles.mediaList}>
            {mediaItems.map((item) => {
              const selected = item.id === selectedMediaId
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.mediaCard, selected && styles.mediaSelected]}
                  onPress={() => setSelectedMediaId(item.id)}
                >
                  <Text style={styles.mediaTitle}>
                    {item.fileName ?? 'Untitled video'}
                  </Text>
                  <Badge
                    label={item.availability}
                    tone={item.availability === 'local' ? 'success' : 'warning'}
                  />
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Platform</Text>
        <View style={styles.platformRow}>
          {PLATFORMS.map((platform) => {
            const selected = platform === selectedPlatform
            return (
              <TouchableOpacity
                key={platform}
                style={[styles.platformChip, selected && styles.platformSelected]}
                onPress={() => setSelectedPlatform(platform)}
              >
                <Text
                  style={[
                    styles.platformText,
                    selected && styles.platformTextSelected,
                  ]}
                >
                  {PLATFORM_LABELS[platform]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>Schedule time</Text>
        <Button
          title={scheduledAt.toLocaleString()}
          variant="outline"
          onPress={() => setShowPicker(true)}
        />
        {showPicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="datetime"
            onChange={(_, date) => {
              if (date) {
                setScheduledAt(date)
              }
              setShowPicker(false)
            }}
          />
        )}

        <Text style={styles.sectionTitle}>Metadata</Text>
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.multiline}
        />
        <Field
          label="Hashtags"
          value={hashtags}
          onChangeText={setHashtags}
          placeholder="#video #upload"
        />

        <Button
          title={submitting ? 'Scheduling...' : 'Schedule upload'}
          onPress={handleSchedule}
          disabled={scheduleDisabled}
        />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#1C1C1E',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  mediaList: {
    gap: 8,
  },
  mediaCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  platformSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EAF3FF',
  },
  platformText: {
    fontSize: 13,
    color: '#1C1C1E',
  },
  platformTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
})
