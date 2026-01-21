import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { localAccountRepository } from '../src/data/localAccountRepository'
import { localAuthService } from '../src/data/localAuthService'
import { AccountLink, Platform } from '../src/domain/models'
import { PLATFORMS, PLATFORM_LABELS } from '../src/domain/constants'

const statusTone = (status: AccountLink['status']) => {
  switch (status) {
    case 'linked':
      return 'success'
    case 'revoked':
    case 'expired':
      return 'danger'
    default:
      return 'neutral'
  }
}

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<AccountLink[]>([])
  const [busy, setBusy] = useState<Platform | null>(null)

  const loadAccounts = useCallback(async () => {
    const stored = await localAccountRepository.list()
    setAccounts(stored)
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleLink = async (platform: Platform) => {
    setBusy(platform)
    await localAuthService.linkAccount(platform)
    await loadAccounts()
    setBusy(null)
  }

  const handleUnlink = async (platform: Platform) => {
    setBusy(platform)
    await localAuthService.unlinkAccount(platform)
    await loadAccounts()
    setBusy(null)
  }

  const getAccount = (platform: Platform) =>
    accounts.find((account) => account.platform === platform)

  return (
    <Screen>
      <Text style={styles.title}>Connected accounts</Text>
      <Text style={styles.subtitle}>
        Link your social accounts to enable scheduled uploads.
      </Text>
      <View style={styles.list}>
        {PLATFORMS.map((platform) => {
          const account = getAccount(platform)
          const status = account?.status ?? 'unknown'
          return (
            <View key={platform} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{PLATFORM_LABELS[platform]}</Text>
                <Badge label={status} tone={statusTone(status)} />
              </View>
              <Text style={styles.cardSubtitle}>
                Permissions for uploads and scheduling.
              </Text>
              <View style={styles.cardActions}>
                {status === 'linked' ? (
                  <Button
                    title={busy === platform ? 'Unlinking...' : 'Unlink'}
                    variant="outline"
                    size="small"
                    onPress={() => handleUnlink(platform)}
                    disabled={busy === platform}
                  />
                ) : (
                  <Button
                    title={busy === platform ? 'Linking...' : 'Link account'}
                    size="small"
                    onPress={() => handleLink(platform)}
                    disabled={busy === platform}
                  />
                )}
              </View>
            </View>
          )
        })}
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
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#636366',
    marginTop: 6,
  },
  cardActions: {
    marginTop: 12,
  },
})
