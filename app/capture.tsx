import React, { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import Screen from '../components/Screen'
import Button from '../components/Button'
import { buildMediaItem } from '../src/data/mediaUtils'
import { localMediaRepository } from '../src/data/localMediaRepository'

export default function CaptureScreen() {
  const [busy, setBusy] = useState(false)

  const saveMedia = async (asset: {
    uri: string
    fileName?: string | null
    duration?: number | null
    size?: number | null
    source: 'camera' | 'library' | 'files'
  }) => {
    const item = await buildMediaItem({
      uri: asset.uri,
      fileName: asset.fileName,
      durationMs: asset.duration ?? undefined,
      sizeBytes: asset.size ?? undefined,
      source: asset.source,
    })
    await localMediaRepository.add(item)
  }

  const handleCamera = async () => {
    setBusy(true)
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Camera permission required', 'Enable camera access in iOS.')
      setBusy(false)
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    })

    if (!result.canceled && result.assets[0]) {
      await saveMedia({
        uri: result.assets[0].uri,
        fileName: result.assets[0].fileName,
        duration: result.assets[0].duration ?? null,
        size: result.assets[0].fileSize ?? null,
        source: 'camera',
      })
    }
    setBusy(false)
  }

  const handleLibrary = async () => {
    setBusy(true)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Library permission required', 'Enable photo access in iOS.')
      setBusy(false)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    })

    if (!result.canceled && result.assets[0]) {
      await saveMedia({
        uri: result.assets[0].uri,
        fileName: result.assets[0].fileName,
        duration: result.assets[0].duration ?? null,
        size: result.assets[0].fileSize ?? null,
        source: 'library',
      })
    }
    setBusy(false)
  }

  const handleFiles = async () => {
    setBusy(true)
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      multiple: false,
      copyToCacheDirectory: true,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      await saveMedia({
        uri: asset.uri,
        fileName: asset.name,
        size: asset.size ?? null,
        source: 'files',
      })
    }
    setBusy(false)
  }

  return (
    <Screen>
      <Text style={styles.title}>Add new video</Text>
      <Text style={styles.subtitle}>
        Capture videos or import them to build your upload backlog.
      </Text>
      <View style={styles.buttonGroup}>
        <Button title="Record with camera" onPress={handleCamera} disabled={busy} />
        <Button
          title="Choose from library"
          variant="secondary"
          onPress={handleLibrary}
          disabled={busy}
        />
        <Button
          title="Pick from files"
          variant="outline"
          onPress={handleFiles}
          disabled={busy}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  buttonGroup: {
    gap: 12,
  },
})
