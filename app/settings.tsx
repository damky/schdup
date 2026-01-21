import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Badge from '../components/Badge'

export default function SettingsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>App settings</Text>
      <Text style={styles.subtitle}>
        Local-only mode is enabled. Data is stored on this device and ready to
        sync when a backend is added.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mode</Text>
        <Badge label="Local queue" tone="neutral" />
        <Text style={styles.cardText}>
          Scheduling uses local notifications and simulated uploads.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sync readiness</Text>
        <Text style={styles.cardText}>
          Records include created/updated timestamps and can be synced later.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#636366',
  },
})
