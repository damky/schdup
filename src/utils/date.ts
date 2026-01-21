export const nowIso = () => new Date().toISOString()

export const isPast = (iso: string) => new Date(iso).getTime() <= Date.now()

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString()
