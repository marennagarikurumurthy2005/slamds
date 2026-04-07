import { rawApi } from '../lib/api'

let wakeupPromise = null

export function startBackendWakeup() {
  if (!wakeupPromise) {
    wakeupPromise = rawApi
      .get('/wakeup/', {
        timeout: 15000,
      })
      .then(({ data }) => data)
      .catch((error) => {
        wakeupPromise = null
        throw error
      })
  }

  return wakeupPromise
}

export async function wakeBackend() {
  return startBackendWakeup()
}
