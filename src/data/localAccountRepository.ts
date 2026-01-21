import { AccountLink, Platform } from '../domain/models'
import { AccountRepository } from '../domain/repositories'
import { STORAGE_KEYS, readJson, writeJson } from './storage'

const listAccounts = async () =>
  readJson<AccountLink[]>(STORAGE_KEYS.accounts, [])

export const localAccountRepository: AccountRepository = {
  list: async () => listAccounts(),
  getByPlatform: async (platform: Platform) => {
    const accounts = await listAccounts()
    return accounts.find((account) => account.platform === platform) ?? null
  },
  upsert: async (account: AccountLink) => {
    const accounts = await listAccounts()
    const next = accounts.filter((item) => item.platform !== account.platform)
    next.push(account)
    await writeJson(STORAGE_KEYS.accounts, next)
  },
  remove: async (platform: Platform) => {
    const accounts = await listAccounts()
    const next = accounts.filter((item) => item.platform !== platform)
    await writeJson(STORAGE_KEYS.accounts, next)
  },
}
