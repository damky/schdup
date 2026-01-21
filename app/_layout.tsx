import { Tabs } from 'expo-router'
import React, { useEffect } from 'react'
import { localSchedulerService } from '../src/data/localSchedulerService'

export default function RootLayout() {
  useEffect(() => {
    localSchedulerService.ensurePermissions()
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="backlog" options={{ title: 'Backlog' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="capture" options={{ title: 'Capture' }} />
      <Tabs.Screen name="accounts" options={{ title: 'Accounts' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}
