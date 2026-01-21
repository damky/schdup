import * as SecureStore from 'expo-secure-store'
import { AccountLink, Platform } from '../domain/models'
import { AuthService } from '../domain/services'
import { generateId } from '../utils/id'
import { nowIso } from '../utils/date'
import { localAccountRepository } from './localAccountRepository'

const tokenKey = (platform: Platform) => `auth_token_${platform}`

export const localAuthService: AuthService = {
  linkAccount: async (platform: Platform): Promise<AccountLink> => {
    const now = nowIso()
    const tokenPayload = JSON.stringify({
      accessToken: `mock-${platform}-${Date.now()}`,
      createdAt: now,
    })

    await SecureStore.setItemAsync(tokenKey(platform), tokenPayload)

    const account: AccountLink = {
      id: generateId(),
      platform,
      status: 'linked',
      linkedAt: now,
      updatedAt: now,
    }

    await localAccountRepository.upsert(account)
    return account
  },
  unlinkAccount: async (platform: Platform) => {
    await SecureStore.deleteItemAsync(tokenKey(platform))
    const existing = await localAccountRepository.getByPlatform(platform)
    if (existing) {
      await localAccountRepository.upsert({
        ...existing,
        status: 'revoked',
        updatedAt: nowIso(),
      })
    } else {
      await localAccountRepository.remove(platform)
    }
  },
  getToken: async (platform: Platform) => {
    return SecureStore.getItemAsync(tokenKey(platform))
  },
}
