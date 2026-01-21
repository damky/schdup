import React from 'react'
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native'

interface ScreenProps {
  children: React.ReactNode
  style?: ViewStyle
}

export default function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    padding: 16,
  },
})
