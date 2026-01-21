import React, { useCallback, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import Screen from '../components/Screen'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { localMediaRepository } from '../src/data/localMediaRepository'
import { localScheduleRepository } from '../src/data/localScheduleRepository'
import { processDueSchedules } from '../src/data/jobProcessor'
import { MediaItem, ScheduleItem } from '../src/domain/models'
import { formatDateTime } from '../src/utils/date'

type BacklogItem = {
  media: MediaItem
  schedules: ScheduleItem[]
}

const toneForStatus = (status: ScheduleItem['status']) => {
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

export default function BacklogScreen() {
  const [items, setItems] = useState<BacklogItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setRefreshing(true)
    await processDueSchedules()
    const [media, schedules] = await Promise.all([
      localMediaRepository.list(),
      localScheduleRepository.list(),
    ])

    const grouped: BacklogItem[] = media.map((mediaItem) => ({
      media: mediaItem,
      schedules: schedules
        .filter((schedule) => schedule.mediaId === mediaItem.id)
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        ),
    }))
    setItems(grouped)
    setRefreshing(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const renderItem = ({ item }: { item: BacklogItem }) => {
    const latestSchedule = item.schedules[0]
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {item.media.fileName ?? 'Untitled video'}
        </Text>
        <Text style={styles.subtitle}>
          Source: {item.media.source} · Availability: {item.media.availability}
        </Text>
        {latestSchedule ? (
          <View style={styles.row}>
            <Badge
              label={`${latestSchedule.platform.toUpperCase()} · ${latestSchedule.status}`}
              tone={toneForStatus(latestSchedule.status)}
            />
            <Text style={styles.scheduleText}>
              {formatDateTime(latestSchedule.scheduledAt)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptySchedule}>No schedules yet</Text>
        )}
      </View>
    )
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload backlog</Text>
        <Button
          title="Refresh"
          variant="outline"
          size="small"
          onPress={loadData}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.media.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No media yet</Text>
            <Text style={styles.emptySubtitle}>
              Record or import videos to build your backlog.
            </Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : null}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 13,
    color: '#636366',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  scheduleText: {
    fontSize: 12,
    color: '#3A3A3C',
  },
  emptySchedule: {
    marginTop: 10,
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
