import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface BadgeProps {
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneStyles = {
  neutral: { backgroundColor: '#E5E5EA', color: '#1C1C1E' },
  success: { backgroundColor: '#D1F5E0', color: '#1C7C54' },
  warning: { backgroundColor: '#FFE8CC', color: '#C46B00' },
  danger: { backgroundColor: '#FFD6D6', color: '#B00020' },
}

export default function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const toneStyle = toneStyles[tone]
  return (
    <View style={[styles.container, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: toneStyle.color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})
